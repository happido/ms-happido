import { Request, Response } from 'express';
import User from '../models/User';
import RiderProfile from '../models/RiderProfile';

export const getRiderMetrics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    const profile = await RiderProfile.findOne({ userId });
    
    if (!user || !profile) {
      return res.status(404).json({ error: 'User or Rider Profile not found' });
    }

    // Default quests if none exist
    const quests = profile.quests || {
      ridesCompleted: 3,
      targetRides: 5,
      bonus: 200
    };

    res.json({
      rating: profile.rating || 4.9,
      acceptanceRate: profile.acceptanceRate || 95,
      targetDestination: profile.targetDestination || null,
      vehicleType: profile.vehicleType || 'bike',
      dailyPassActiveUntil: profile.dailyPassActiveUntil || null,
      autoRenewPass: profile.autoRenewPass || false,
      walletBalance: user.walletBalance || 0,
      quests
    });
  } catch (error) {
    console.error('Error fetching rider metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setTargetDestination = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const { coordinates, address } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const update = {
      targetDestination: {
        type: 'Point',
        coordinates,
        address
      }
    };

    const profile = await RiderProfile.findOneAndUpdate({ userId }, update, { new: true });
    res.json({ message: 'Destination updated successfully', targetDestination: profile?.targetDestination });
  } catch (error) {
    console.error('Error setting destination:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleBackgroundLocation = async (req: Request, res: Response) => {
  try {
    const { riderId, location, targetCustomerId } = req.body;
    if (!riderId || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const io = req.app.get('io');
    if (io) {
      // Simulate what the socket listener does but for background REST updates
      if (targetCustomerId) {
        io.to(targetCustomerId).emit('riderLocationUpdate', { riderId, location });
      }
      io.to('admin_room').emit('riderLocationUpdate', { riderId, location });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling background location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
