import { Request, Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middlewares/authMiddleware';
import { startDispatch } from './dispatchController';
import { sendPushNotification } from '../services/pushNotificationService';
import User from '../models/User';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

// Customer places a new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  const { restaurantId, items, totalAmount, deliveryLocation, deliveryAddress, paymentMethod, paymentStatus } = req.body;

  console.log('\n🔥 [CREATE ORDER] restaurantId from checkout:', restaurantId);
  console.log('🔥 [CREATE ORDER] customer:', req.user._id);

  try {
    // Look up the restaurant doc
    const Restaurant = require('../models/Restaurant').default;
    const restaurantDoc = await Restaurant.findById(restaurantId);
    console.log('🔥 [CREATE ORDER] restaurantDoc found:', restaurantDoc ? restaurantDoc.name : 'NOT FOUND');

    let distanceKm = 0;
    let dynamicDeliveryFee = 40; // Default base fee

    if (restaurantDoc && restaurantDoc.location?.coordinates && deliveryLocation?.coordinates) {
      // coordinates are [longitude, latitude]
      const restLon = restaurantDoc.location.coordinates[0];
      const restLat = restaurantDoc.location.coordinates[1];
      const custLon = deliveryLocation.coordinates[0];
      const custLat = deliveryLocation.coordinates[1];
      distanceKm = getDistanceKm(restLat, restLon, custLat, custLon);
      
      // Pricing Tier: ₹40 for first 3km, then ₹10 per km
      if (distanceKm > 3) {
        dynamicDeliveryFee = 40 + Math.ceil(distanceKm - 3) * 10;
      }
    }

    const grandTotal = totalAmount + dynamicDeliveryFee;

    const order = new Order({
      customer: req.user._id,
      restaurant: restaurantId,
      items,
      totalAmount,
      deliveryFee: dynamicDeliveryFee,
      distanceKm,
      grandTotal,
      deliveryLocation,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'pending',
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      pickupOtp: Math.floor(100 + Math.random() * 900).toString(), // 3 digit pickup PIN
      status: 'pending'
    });

    const createdOrder = await order.save();

    // Emit new order to the restaurant room
    const io = req.app.get('io');
    if (io) {
      // Get all connected socket rooms for debugging
      const rooms = io.sockets.adapter.rooms;
      console.log('🔥 [CREATE ORDER] All active socket rooms:', [...rooms.keys()]);
      console.log('🔥 [CREATE ORDER] Emitting newOrder to room:', restaurantId.toString());
      
      io.to(restaurantId.toString()).emit('newOrder', createdOrder);
      
      // Also emit to the restaurant owner's ID room 
      // This handles the case where the restaurant app joined with a different ID
      if (restaurantDoc && restaurantDoc.owner) {
         console.log('🔥 [CREATE ORDER] Also emitting to Restaurant Owner User ID:', restaurantDoc.owner.toString());
         io.to(restaurantDoc.owner.toString()).emit('newOrder', createdOrder);

         // SEND PUSH NOTIFICATION TO RESTAURANT OWNER
         try {
           const ownerUser = await User.findById(restaurantDoc.owner);
           if (ownerUser && ownerUser.expoPushToken) {
             await sendPushNotification(
               ownerUser.expoPushToken,
               '🔔 New Order Received!',
               `Order #${createdOrder._id.toString().slice(-6).toUpperCase()} for ₹${grandTotal} has been placed.`,
               { type: 'NEW_ORDER', orderId: createdOrder._id }
             );
           }
         } catch(pushErr) {
           console.error('Failed to send push notification to restaurant', pushErr);
         }
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('🔥 [CREATE ORDER] ERROR:', error);
    res.status(500).json({ message: 'Error creating order', error });
  }
};

// Get orders for a specific restaurant (Restaurant App)
export const getRestaurantOrders = async (req: AuthRequest, res: Response) => {
  try {
    // req.user._id is the restaurant owner's ID
    const Restaurant = require('../models/Restaurant').default;
    const restaurantDoc = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurantDoc) {
      res.json([]);
      return;
    }
    const orders = await Order.find({ restaurant: restaurantDoc._id }).populate('customer', 'name phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Get orders for a specific customer (Customer App)
export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).populate('restaurant', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Update order status (Restaurant/Rider App)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status, riderId } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.status = status || order.status;
    if (riderId) {
      order.rider = riderId;
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('restaurant', 'name location')
      .populate('rider', 'name phone location');

    // Emit status update to the customer and restaurant rooms
    const io = req.app.get('io');
    if (io && populatedOrder) {
      if (populatedOrder.customer) {
        const custId = (populatedOrder.customer as any)._id || populatedOrder.customer;
        io.to(custId.toString()).emit('orderStatusUpdate', populatedOrder);
      }
      if (populatedOrder.restaurant) {
        const restId = (populatedOrder.restaurant as any)._id || populatedOrder.restaurant;
        io.to(restId.toString()).emit('orderStatusUpdate', populatedOrder);
        
        // Fallback: emit to owner
        if ((populatedOrder.restaurant as any).owner) {
          io.to((populatedOrder.restaurant as any).owner.toString()).emit('orderStatusUpdate', populatedOrder);
        }
      }

      // If restaurant starts preparing, trigger predictive dispatch immediately!
      if (status === 'preparing' && !order.rider) {
        await startDispatch(req as Request, io, order);
      }
    }
    
    // Send Push Notification to Customer
    try {
      const custUser = await User.findById(order.customer);
      if (custUser && custUser.expoPushToken) {
        let msg = '';
        if (status === 'accepted') msg = '🍳 Your order has been accepted!';
        if (status === 'preparing') msg = '👨‍🍳 Chef is preparing your food!';
        if (status === 'ready' || status === 'ready_for_pickup') msg = '✅ Food is ready! Rider is on the way.';
        
        if (msg) {
          await sendPushNotification(
            custUser.expoPushToken,
            'Order Update',
            msg,
            { type: 'ORDER_UPDATE', orderId: order._id }
          );
        }
      }
    } catch (pushErr) {
      console.error('Failed to send push notification to customer:', pushErr);
    }

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
};

// Restaurant broadcasts the order for delivery (Triggers Dispatch Engine)
export const requestDeliveryRider = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant', 'name location');
    
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.status = 'ready_for_pickup';
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('restaurant', 'name location')
      .populate('rider', 'name phone location');

    const io = req.app.get('io');
    if (io && populatedOrder) {
      if (populatedOrder.customer) {
        const custId = (populatedOrder.customer as any)._id || populatedOrder.customer;
        io.to(custId.toString()).emit('orderStatusUpdate', populatedOrder);
      }
      if (populatedOrder.restaurant) {
        const restId = (populatedOrder.restaurant as any)._id || populatedOrder.restaurant;
        io.to(restId.toString()).emit('orderStatusUpdate', populatedOrder);
        
        // Fallback: emit to owner
        if ((populatedOrder.restaurant as any).owner) {
          io.to((populatedOrder.restaurant as any).owner.toString()).emit('orderStatusUpdate', populatedOrder);
        }
      }

      // Start the intelligent dispatch queue only if no rider has been assigned yet
      if (!order.rider) {
        await startDispatch(req as Request, io, order);
        return res.json({ message: 'Order entered Dispatch Queue', order: populatedOrder });
      }
    }
    
    // Push Notification to Customer
    try {
      const custUser = await User.findById(order.customer);
      if (custUser && custUser.expoPushToken) {
        await sendPushNotification(
          custUser.expoPushToken,
          'Order Update',
          '✅ Food is ready! Rider is on the way.',
          { type: 'ORDER_UPDATE', orderId: order._id }
        );
      }
    } catch (pushErr) {
      console.error('Failed to send push notification to customer:', pushErr);
    }

    res.json({ message: 'Order marked ready', order: populatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting rider', error });
  }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name imageUrl location')
      .populate('rider', 'name phone location');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Optional: Ensure the user is the customer or restaurant or rider of the order
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel order with refund logic
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only pending/accepted orders can be cancelled by customer
    const cancelableStatuses = ['pending', 'accepted'];
    // Restaurant can cancel pending/accepted/preparing
    const restaurantCancelable = ['pending', 'accepted', 'preparing'];
    
    const userId = req.user._id.toString();
    const isCustomer = order.customer.toString() === userId;
    let isRestaurant = false;
    
    const Restaurant = require('../models/Restaurant').default;
    const restDoc = await Restaurant.findOne({ owner: userId });
    if (restDoc && order.restaurant.toString() === restDoc._id.toString()) {
      isRestaurant = true;
    }

    if (isCustomer && !cancelableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage. Food is already being prepared.' 
      });
    }

    if (isRestaurant && !restaurantCancelable.includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage.' 
      });
    }

    if (!isCustomer && !isRestaurant) {
      return res.status(403).json({ message: 'Not authorized to cancel this order.' });
    }

    // Calculate refund
    let refundAmount = 0;
    if (order.status === 'pending') {
      // Full refund if not yet accepted
      refundAmount = order.grandTotal;
    } else if (order.status === 'accepted') {
      // Full refund minus ₹25 convenience fee
      refundAmount = Math.max(0, order.grandTotal - 25);
    } else if (order.status === 'preparing' && isRestaurant) {
      // Full refund if restaurant cancels while cooking
      refundAmount = order.grandTotal;
    }

    // Update order
    order.status = 'cancelled';
    order.cancelledBy = isCustomer ? 'customer' : 'restaurant';
    order.cancellationReason = reason || 'No reason provided';
    order.cancelledAt = new Date();
    order.refundAmount = refundAmount;
    order.refundStatus = refundAmount > 0 ? 'completed' : 'none';
    await order.save();

    // Process wallet refund if applicable
    if (refundAmount > 0) {
      const User = require('../models/User').default;
      const Transaction = require('../models/Transaction').default;
      
      const customer = await User.findById(order.customer);
      if (customer) {
        customer.walletBalance = (customer.walletBalance || 0) + refundAmount;
        await customer.save();

        await Transaction.create({
          user: order.customer,
          amount: refundAmount,
          type: 'credit',
          description: `Refund for cancelled order #${order._id.toString().slice(-6)}`,
          order: order._id,
        });
      }
    }

    // Notify via WebSocket
    const io = req.app.get('io');
    if (io) {
      if (isCustomer && order.restaurant) {
        io.to(order.restaurant.toString()).emit('orderCancelled', order);
      }
      if (isRestaurant && order.customer) {
        io.to(order.customer.toString()).emit('orderCancelled', order);
      }
    }

    res.json({ 
      message: 'Order cancelled successfully.', 
      refundAmount,
      refundStatus: order.refundStatus,
      order 
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};

// Rider verifies delivery OTP from customer
export const verifyDeliveryOtp = async (req: AuthRequest, res: Response) => {
  const { otp } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only assigned rider can verify
    if (!order.rider || order.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned rider can verify delivery.' });
    }

    if (order.status !== 'dispatched') {
      return res.status(400).json({ message: 'Order is not in dispatched state.' });
    }

    if (order.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP. Please ask customer for the correct delivery PIN.' });
    }

    // Mark as delivered
    order.status = 'delivered';
    const updatedOrder = await order.save();

    // --- RIDER EARNINGS CREDIT ---
    try {
      const User = require('../models/User').default;
      const Transaction = require('../models/Transaction').default;
      const RiderProfile = require('../models/RiderProfile').default;
      
      const rider = await User.findById(req.user._id);
      if (rider) {
        const earnings = updatedOrder.deliveryFee || 40;
        rider.walletBalance = (rider.walletBalance || 0) + earnings;
        await rider.save();

        await Transaction.create({
          userId: rider._id,
          type: 'credit',
          amount: earnings,
          description: `Earnings for Delivery Order #${updatedOrder._id.toString().substring(0,6)}`,
          status: 'success'
        });

        // Update Quests
        const riderProfile = await RiderProfile.findOne({ userId: rider._id });
        if (riderProfile) {
          riderProfile.quests.ridesCompleted = (riderProfile.quests.ridesCompleted || 0) + 1;
          await riderProfile.save();
        }
      }
    } catch (err) {
      console.error('Error crediting rider wallet for food delivery:', err);
    }
    // -----------------------------

    // Notify customer
    const io = req.app.get('io');
    if (io && updatedOrder.customer) {
      io.to(updatedOrder.customer.toString()).emit('orderStatusUpdate', updatedOrder);
    }
    // Notify restaurant
    if (io && updatedOrder.restaurant) {
      const restId = (updatedOrder.restaurant as any)._id || updatedOrder.restaurant;
      io.to(restId.toString()).emit('orderStatusUpdate', updatedOrder);
      
      const Restaurant = require('../models/Restaurant').default;
      const restDoc = await Restaurant.findById(restId);
      if (restDoc && restDoc.owner) {
        io.to(restDoc.owner.toString()).emit('orderStatusUpdate', updatedOrder);
      }
    }

    // Push Notification to Customer
    try {
      const custUser = await User.findById(order.customer);
      if (custUser && custUser.expoPushToken) {
        await sendPushNotification(
          custUser.expoPushToken,
          'Delivered',
          '🎉 Your food has been delivered!',
          { type: 'ORDER_DELIVERED', orderId: order._id }
        );
      }
    } catch (pushErr) {
      console.error('Failed to send push notification to customer:', pushErr);
    }

    res.json({ message: 'Delivery verified successfully! Order marked as delivered.', order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ message: 'Error verifying delivery', error: error.message });
  }
};

// Rider verifies pickup OTP from restaurant
export const verifyPickupOtp = async (req: AuthRequest, res: Response) => {
  const { otp } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only assigned rider can verify
    if (!order.rider || order.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned rider can pick up this order.' });
    }

    if (!['preparing', 'ready', 'ready_for_pickup', 'arrived_at_restaurant'].includes(order.status)) {
      return res.status(400).json({ message: 'Order is not ready for pickup.' });
    }

    if (order.pickupOtp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP. Please ask the restaurant for the correct pickup PIN.' });
    }

    // Mark as dispatched
    order.status = 'dispatched';
    const updatedOrder = await order.save();

    // Notify customer
    const io = req.app.get('io');
    if (io && updatedOrder.customer) {
      io.to(updatedOrder.customer.toString()).emit('orderStatusUpdate', updatedOrder);
    }
    // Notify restaurant
    if (io && updatedOrder.restaurant) {
      const restId = (updatedOrder.restaurant as any)._id || updatedOrder.restaurant;
      io.to(restId.toString()).emit('orderStatusUpdate', updatedOrder);
      
      const Restaurant = require('../models/Restaurant').default;
      const restDoc = await Restaurant.findById(restId);
      if (restDoc && restDoc.owner) {
        io.to(restDoc.owner.toString()).emit('orderStatusUpdate', updatedOrder);
      }
    }

    // Push Notification to Customer
    try {
      const custUser = await User.findById(order.customer);
      if (custUser && custUser.expoPushToken) {
        await sendPushNotification(
          custUser.expoPushToken,
          'On The Way',
          '🛵 Your food has been picked up and is on the way!',
          { type: 'ORDER_DISPATCHED', orderId: order._id }
        );
      }
    } catch (pushErr) {
      console.error('Failed to send push notification to customer:', pushErr);
    }

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: 'Error verifying pickup OTP', error: error.message });
  }
};
