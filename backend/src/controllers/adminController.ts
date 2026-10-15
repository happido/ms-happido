import { Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Ride from '../models/Ride';
import BloodRequest from '../models/BloodRequest';
import Restaurant from '../models/Restaurant';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalRiders = await User.countDocuments({ role: 'rider' });
    const totalRestaurants = await User.countDocuments({ role: 'restaurant' });

    const totalOrders = await Order.countDocuments();
    const totalRides = await Ride.countDocuments();
    const totalBloodRequests = await BloodRequest.countDocuments();

    // Latest activity
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name').populate('restaurant', 'name');
    const recentRides = await Ride.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name').populate('rider', 'name');

    res.json({
      stats: {
        totalUsers,
        totalCustomers,
        totalRiders,
        totalRestaurants,
        totalOrders,
        totalRides,
        totalBloodRequests
      },
      recentOrders,
      recentRides
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats', error });
  }
};

// Get all users pending KYC verification (Riders & Restaurants)
export const getPendingKYC = async (req: Request, res: Response) => {
  try {
    const pendingUsers = await User.find({ 
      role: { $in: ['rider', 'restaurant'] }, 
      isVerified: false,
      onboardingStatus: 'pending_verification'
    }).select('-password');
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending KYC', error });
  }
};

// Approve KYC for a rider or restaurant
export const approveKYC = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    user.isVerified = true;
    user.onboardingStatus = 'verified';
    await user.save();

    // If it's a restaurant, activate their public restaurant profile
    if (user.role === 'restaurant') {
      const existingRestaurant = await Restaurant.findOne({ owner: user._id });
      if (existingRestaurant) {
        existingRestaurant.isOpen = true;
        await existingRestaurant.save();
      } else {
        await Restaurant.create({
          owner: user._id,
          name: user.name, // Fallback to user.name
          location: { type: 'Point', coordinates: [0, 0] },
          isOpen: true
        });
      }
    }
    
    res.json({ message: 'User KYC Approved', user });
  } catch (error) {
    res.status(500).json({ message: 'Error approving KYC', error });
  }
};
