
import { Expo } from 'expo-server-sdk';
let expo = new Expo();

const sendPushToDrivers = async (vehicleType: string, rideMessage: any) => {
  try {
    const User = require('../models/User').default;
    const drivers = await User.find({ role: 'rider', vehicleType, isOnline: true });
    
    let messages = [];
    for (let driver of drivers) {
      if (!driver.expoPushToken) continue;
      if (!Expo.isExpoPushToken(driver.expoPushToken)) continue;
      
      messages.push({
        to: driver.expoPushToken,
        sound: 'default',
        title: 'New Ride Request! 🚗',
        body: `A customer is requesting a ${vehicleType} nearby. Tap to accept!`,
        data: { rideId: rideMessage._id },
      });
    }

    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (err) {
    console.error("Push notification error:", err);
  }
};

import { Request, Response } from 'express';
import Ride from '../models/Ride';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middlewares/authMiddleware';

// Helper to generate a 4 digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Mock fare calculator
const calculateFare = (vehicleType: string) => {
  const baseFares: any = { bike: 40, auto: 80, car: 150, scooter: 30 };
  return baseFares[vehicleType] || 100;
};

// Customer requests a ride
export const requestRide = async (req: AuthRequest, res: Response) => {
  const { pickupLocation, dropoffLocation, pickupAddress, dropoffAddress, vehicleType, fare: requestedFare } = req.body;

  try {
    const vType = vehicleType || 'bike';
    const otp = generateOTP();
    const fare = requestedFare || calculateFare(vType);

    const ride = new Ride({
      customer: req.user._id,
      pickupLocation,
      dropoffLocation,
      pickupAddress: pickupAddress || 'Customer Pickup',
      dropoffAddress: dropoffAddress || 'Destination',
      vehicleType: vType,
      fare,
      otp,
      status: 'requested'
    });

    await ride.save();
    const populatedRide = await Ride.findById(ride._id).populate('customer', 'name phone rating');

    // Broadcast the ride request to all online riders matching the vehicle type AND all online riders
    const io = req.app.get('io');
    if (io) {
      io.to(`online_riders_${vType}`).emit('newRideRequest', populatedRide);
      io.to('online_riders').emit('newRideRequest', populatedRide);
      console.log(`[Ride Dispatch] Broadcasted ride ${ride._id} to online riders`);
    }

    res.status(201).json(populatedRide);
  } catch (error) {
    res.status(500).json({ message: 'Error requesting ride', error });
  }
};

// Rider accepts a ride
export const acceptRide = async (req: AuthRequest, res: Response) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    if (ride.status !== 'requested') {
      res.status(400).json({ message: 'Ride already accepted or cancelled' });
      return;
    }

    ride.rider = req.user._id;
    ride.status = 'accepted';
    await ride.save();

    const updatedRide = await Ride.findById(ride._id)
      .populate('customer', 'name phone rating')
      .populate('rider', 'name phone rating vehicleDetails vehicleType');

    // Notify customer in real-time
    const io = req.app.get('io');
    if (io && updatedRide && updatedRide.customer) {
      const customerId = (updatedRide.customer as any)._id 
        ? (updatedRide.customer as any)._id.toString() 
        : updatedRide.customer.toString();
      io.to(customerId).emit('rideStatusUpdate', updatedRide);
      console.log(`[Ride Socket] Emitted rideStatusUpdate (accepted) to customer ${customerId}`);
    }

    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting ride', error });
  }
};

// Rider marks arrived
export const arriveRide = async (req: AuthRequest, res: Response) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }
    
    ride.status = 'arrived';
    await ride.save();

    const updatedRide = await Ride.findById(ride._id)
      .populate('customer', 'name phone rating')
      .populate('rider', 'name phone rating vehicleDetails vehicleType');

    const io = req.app.get('io');
    if (io && updatedRide && updatedRide.customer) {
      const customerId = (updatedRide.customer as any)._id 
        ? (updatedRide.customer as any)._id.toString() 
        : updatedRide.customer.toString();
      io.to(customerId).emit('rideStatusUpdate', updatedRide);
    }
    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ride status', error });
  }
};

// Rider starts ride with OTP
export const startRide = async (req: AuthRequest, res: Response) => {
  const { otp } = req.body;
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    if (ride.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    ride.status = 'in_progress';
    await ride.save();

    const updatedRide = await Ride.findById(ride._id)
      .populate('customer', 'name phone rating')
      .populate('rider', 'name phone rating vehicleDetails vehicleType');

    const io = req.app.get('io');
    if (io && updatedRide && updatedRide.customer) {
      const customerId = (updatedRide.customer as any)._id 
        ? (updatedRide.customer as any)._id.toString() 
        : updatedRide.customer.toString();
      io.to(customerId).emit('rideStatusUpdate', updatedRide);
    }
    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: 'Error starting ride', error });
  }
};

// Rider completes ride
export const completeRide = async (req: AuthRequest, res: Response) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    ride.status = 'completed';
    await ride.save();

    const updatedRide = await Ride.findById(ride._id)
      .populate('customer', 'name phone rating')
      .populate('rider', 'name phone rating vehicleDetails vehicleType');

    // 1. Calculate Rider Earnings (80% net fare)
    const totalFare = updatedRide?.fare || 100;
    const riderEarnings = totalFare * 0.8;

    // 2. Add to Rider's Wallet
    const riderId = (updatedRide?.rider as any)?._id || updatedRide?.rider;
    const rider = await User.findById(riderId);
    if (rider) {
      rider.walletBalance = (rider.walletBalance || 0) + riderEarnings;
      await rider.save();

      // 3. Create Transaction Record
      await Transaction.create({
        user: rider._id,
        amount: riderEarnings,
        type: 'credit',
        description: `Ride Earnings #${ride._id.toString().substring(18)} (${updatedRide?.pickupAddress || 'Pickup'} ➔ ${updatedRide?.dropoffAddress || 'Dropoff'})`,
        ride: ride._id
      });
    }

    // 4. Notify Customer in real-time
    const io = req.app.get('io');
    if (io && updatedRide && updatedRide.customer) {
      const customerId = (updatedRide.customer as any)._id 
        ? (updatedRide.customer as any)._id.toString() 
        : updatedRide.customer.toString();
      io.to(customerId).emit('rideStatusUpdate', updatedRide);
    }
    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: 'Error completing ride', error });
  }
};

// Cancel Ride (Customer or Rider)
export const cancelRide = async (req: AuthRequest, res: Response) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    ride.status = 'cancelled';
    await ride.save();

    const updatedRide = await Ride.findById(ride._id)
      .populate('customer', 'name phone rating')
      .populate('rider', 'name phone rating vehicleDetails vehicleType');

    const io = req.app.get('io');
    if (io) {
      if (updatedRide?.customer) {
        const customerId = (updatedRide.customer as any)._id 
          ? (updatedRide.customer as any)._id.toString() 
          : updatedRide.customer.toString();
        io.to(customerId).emit('rideStatusUpdate', updatedRide);
        io.to(customerId).emit('rideCancelled', { rideId: ride._id });
      }
      if (updatedRide?.rider) {
        const riderId = (updatedRide.rider as any)._id 
          ? (updatedRide.rider as any)._id.toString() 
          : updatedRide.rider.toString();
        io.to(riderId).emit('rideStatusUpdate', updatedRide);
        io.to(riderId).emit('rideCancelled', { rideId: ride._id });
      }
      // Notify online riders pool to clear the incoming request
      io.to('online_riders').emit('rideCancelled', { rideId: ride._id });
      io.to(`online_riders_${ride.vehicleType}`).emit('rideCancelled', { rideId: ride._id });
    }

    res.json({ message: 'Ride cancelled successfully', ride: updatedRide });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling ride', error });
  }
};

export const updateRideStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }
    ride.status = status;
    await ride.save();

    const updatedRide = await Ride.findById(ride._id)
      .populate('customer', 'name phone rating')
      .populate('rider', 'name phone rating vehicleDetails vehicleType');

    const io = req.app.get('io');
    if (io && updatedRide && updatedRide.customer) {
      const customerId = (updatedRide.customer as any)._id 
        ? (updatedRide.customer as any)._id.toString() 
        : updatedRide.customer.toString();
      io.to(customerId).emit('rideStatusUpdate', updatedRide);
    }
    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ride status', error });
  }
};

export const getRideHistory = async (req: AuthRequest, res: Response) => {
  try {
    const rides = await Ride.find({ 
      $or: [{ customer: req.user._id }, { rider: req.user._id }]
    }).sort({ createdAt: -1 }).limit(50);
    
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ride history', error });
  }
};

export const getActiveRide = async (req: AuthRequest, res: Response) => {
  try {
    const activeRide = await Ride.findOne({
      customer: req.user._id,
      status: { $in: ['requested', 'accepted', 'arrived', 'in_progress'] }
    }).sort({ createdAt: -1 }).populate('rider', 'name phone rating profilePic');
    
    res.json(activeRide); // Returns null if no active ride
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active ride', error });
  }
};

