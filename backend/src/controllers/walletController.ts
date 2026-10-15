import { Request, Response } from 'express';
import User from '../models/User';
import RiderProfile from '../models/RiderProfile';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getWalletBalance = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Fetch last 50 transactions
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('ride', 'pickupLocation dropoffLocation fare');

    let profile: any = {};
    if (user.role === 'rider') {
      profile = await RiderProfile.findOne({ userId: user._id }) || {};
    }

    res.json({
      balance: user.walletBalance || 0,
      vehicleType: profile.vehicleType || 'bike',
      dailyPassActiveUntil: profile.dailyPassActiveUntil || null,
      autoRenewPass: profile.autoRenewPass || false,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const withdrawFunds = async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' }); return;
    }

    if ((user.walletBalance || 0) < amount) {
      res.status(400).json({ message: 'Insufficient balance' }); return;
    }

    user.walletBalance = (user.walletBalance || 0) - amount;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      amount,
      type: 'debit',
      description: 'Withdrawal to Bank Account'
    });

    res.json({
      message: 'Withdrawal successful',
      balance: user.walletBalance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const buyDailyPass = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' }); return;
    }

    if ((user.walletBalance || 0) < 30) {
      res.status(400).json({ message: 'Insufficient balance to buy pass. Please add funds.' }); return;
    }

    // Deduct 30
    user.walletBalance = (user.walletBalance || 0) - 30;
    
    // Set expiry to today at 11:59:59 PM
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const profile = await RiderProfile.findOneAndUpdate(
      { userId: user._id }, 
      { dailyPassActiveUntil: endOfDay }, 
      { new: true }
    );

    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      amount: 30,
      type: 'debit',
      description: 'Daily Pass (₹30) - 0% Commission'
    });

    res.json({
      message: 'Daily Pass Activated!',
      balance: user.walletBalance,
      dailyPassActiveUntil: profile?.dailyPassActiveUntil,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addFunds = async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' }); return;
    }

    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      amount,
      type: 'credit',
      description: 'Added Funds via UPI'
    });

    res.json({
      message: 'Funds added successfully',
      balance: user.walletBalance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const toggleAutoPay = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await RiderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Rider profile not found' }); return;
    }

    profile.autoRenewPass = !profile.autoRenewPass;
    await profile.save();

    res.json({
      message: profile.autoRenewPass ? 'AutoPay Enabled' : 'AutoPay Disabled',
      autoRenewPass: profile.autoRenewPass
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
