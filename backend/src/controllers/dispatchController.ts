import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendPushNotification } from '../services/pushNotificationService';

// In-memory queue to track active dispatch loops
interface DispatchState {
  order: any;
  eligibleRiderIds: string[];
  currentIndex: number;
  timeoutId?: NodeJS.Timeout;
}

const activeDispatches = new Map<string, DispatchState>();
const DISPATCH_TIMEOUT_MS = 15000; // 15 seconds

export const startDispatch = async (req: Request | null, io: any, order: any) => {
  try {
    const Restaurant = require('../models/Restaurant').default;
    const restaurant = await Restaurant.findById(order.restaurant);
    // Note: Restaurant users might not have a location set in the current mockup. 
    // If location is missing, we use a fallback coordinate (e.g. Hyderabad center) to allow testing.
    let lng = 78.4867;
    let lat = 17.3850;
    
    if (restaurant && restaurant.location && restaurant.location.coordinates) {
      [lng, lat] = restaurant.location.coordinates;
    } else {
      console.warn(`[Dispatch] Restaurant ${order.restaurant} location missing. Using fallback coordinates.`);
    }

    // Find the 5 nearest online riders within 10km
    const RiderProfile = require('../models/RiderProfile').default;
    const riders = await RiderProfile.find({
      isOnline: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 10000 
        }
      }
    }).limit(5);

    if (riders.length === 0) {
      console.log(`No online riders found for order ${order._id}`);
      if (io && order.restaurant) {
        io.to(order.restaurant.toString()).emit('dispatchFailed', { 
          orderId: order._id, 
          message: 'No delivery partners are online within a 10km radius.' 
        });
      }
      return;
    }

    const riderIds = riders.map((r: any) => r.userId.toString());
    
    activeDispatches.set(order._id.toString(), {
      order,
      eligibleRiderIds: riderIds,
      currentIndex: 0
    });

    console.log(`[Dispatch] Order ${order._id} initialized with ${riderIds.length} nearby riders.`);
    
    // Start pinging the first driver
    pingNextDriver(io, order._id.toString());

  } catch (error) {
    console.error('Error starting dispatch:', error);
  }
};

const pingNextDriver = async (io: any, orderId: string) => {
  const state = activeDispatches.get(orderId);
  if (!state) return;

  // Clear existing timeout if any
  if (state.timeoutId) {
    clearTimeout(state.timeoutId);
  }

  // Check if we exhausted all drivers
  if (state.currentIndex >= state.eligibleRiderIds.length) {
    console.log(`[Dispatch] Order ${orderId} exhausted all drivers. Broadcasting to Admin.`);
    io.to('admin_room').emit('dispatchFailed', { orderId, message: 'No riders accepted the order.' });
    activeDispatches.delete(orderId);
    return;
  }

  const targetedRiderId = state.eligibleRiderIds[state.currentIndex];
  
  console.log(`[Dispatch] Pinging Rider ${targetedRiderId} for Order ${orderId}`);

  // Ping this specific rider
  io.to(targetedRiderId).emit('pingRider', state.order);

  // Send Push Notification
  try {
    const riderUser = await User.findById(targetedRiderId);
    if (riderUser && riderUser.expoPushToken) {
      await sendPushNotification(
        riderUser.expoPushToken,
        '🚨 New Ride Request!',
        'You have 15 seconds to accept the order.',
        { type: 'NEW_PING', orderId: orderId },
        'notification_ringtone' // Use a custom loud sound if defined in app.json, else default
      );
    }
  } catch(e) {
    console.error('Failed to send push to rider', e);
  }

  // Set timeout for 15 seconds
  state.timeoutId = setTimeout(() => {
    console.log(`[Dispatch] Rider ${targetedRiderId} timed out. Moving to next...`);
    
    // Tell the client the ping expired so it dismisses the UI
    io.to(targetedRiderId).emit('pingExpired', { orderId });
    
    state.currentIndex += 1;
    pingNextDriver(io, orderId);
  }, DISPATCH_TIMEOUT_MS);
};

export const acceptOrder = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.body;
  const riderId = req.user._id.toString();

  const state = activeDispatches.get(orderId);
  if (!state) {
    res.status(400).json({ message: 'Dispatch expired or already accepted by someone else.' });
    return;
  }

  // Ensure this rider was actually the one being targeted right now
  const targetedRiderId = state.eligibleRiderIds[state.currentIndex];
  if (targetedRiderId !== riderId) {
    res.status(403).json({ message: 'You are not the targeted rider.' });
    return;
  }

  try {
    // Clear timeout & stop pinging
    if (state.timeoutId) clearTimeout(state.timeoutId);
    activeDispatches.delete(orderId);

    // Update Order in DB
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.rider = req.user._id;
    // Status intentionally left unchanged (remains 'preparing' or 'ready_for_pickup')
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('restaurant', 'name location')
      .populate('rider', 'name phone location');

    const io = req.app.get('io');
    
    // Tell Customer and Restaurant
    if (io && populatedOrder) {
      if (populatedOrder.customer) {
        const custId = (populatedOrder.customer as any)._id || populatedOrder.customer;
        io.to(custId.toString()).emit('orderStatusUpdate', populatedOrder);
      }
      if (populatedOrder.restaurant) {
        const restId = (populatedOrder.restaurant as any)._id || populatedOrder.restaurant;
        io.to(restId.toString()).emit('orderStatusUpdate', populatedOrder);
      }
    }

    res.json({ message: 'Order accepted successfully', order: populatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const declineOrder = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.body;
  const riderId = req.user._id.toString();

  const state = activeDispatches.get(orderId);
  if (!state) {
    res.status(400).json({ message: 'Dispatch already resolved.' });
    return;
  }

  const targetedRiderId = state.eligibleRiderIds[state.currentIndex];
  if (targetedRiderId !== riderId) {
    res.status(403).json({ message: 'You are not the targeted rider.' });
    return;
  }

  // Clear timeout and manually trigger the next driver
  if (state.timeoutId) clearTimeout(state.timeoutId);
  console.log(`[Dispatch] Rider ${riderId} explicitly declined Order ${orderId}. Moving to next.`);
  
  const io = req.app.get('io');
  io.to(targetedRiderId).emit('pingExpired', { orderId });

  state.currentIndex += 1;
  pingNextDriver(io, orderId);

  res.json({ message: 'Order declined.' });
};

// Test Endpoint to inject a fake order into the dispatch queue
export const testDispatch = async (req: AuthRequest, res: Response) => {
  try {
    const io = req.app.get('io');
    // Grab the most recent pending order or make a dummy one
    const order = await Order.findOne().sort({ createdAt: -1 }).populate('restaurant');
    
    if (!order) {
       res.status(404).json({ message: 'No orders exist to test with.' });
       return;
    }

    await startDispatch(req, io, order);
    res.json({ message: `Test dispatch started for order ${order._id}` });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
