import cron from 'node-cron';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Restaurant from '../models/Restaurant';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { sendPushNotification } from './pushNotificationService';

export const initCronJobs = (io: any) => {
  console.log('⏳ Initializing Background Cron Jobs...');

  // Run every 1 minute
  cron.schedule('* * * * *', async () => {
    try {
      // Find all unstarted orders
      const pendingOrders = await Order.find({ status: { $in: ['pending', 'accepted'] } }).populate('restaurant');
      const now = new Date().getTime();

      for (const order of pendingOrders) {
        const createdAt = new Date(order.createdAt).getTime();
        const diffMinutes = (now - createdAt) / 60000;

        // Dynamic Timeout Rules:
        // Rush Orders (20 min SLA): Max 3 minutes to accept
        // Standard Orders: Max 7 minutes to accept
        const timeoutThreshold = order.isRush20Min ? 3 : 7;

        if (diffMinutes >= timeoutThreshold) {
          console.log(`[CRON] Auto-cancelling ignored order ${order._id}. Age: ${Math.floor(diffMinutes)}m`);

          // 1. Process Refund
          let refundAmount = order.grandTotal || 0;
          await Order.updateOne(
            { _id: order._id },
            { 
              $set: {
                status: 'cancelled',
                cancelledBy: 'system',
                cancellationReason: 'Restaurant unresponsive to new order',
                cancelledAt: new Date(),
                refundAmount: refundAmount,
                refundStatus: 'completed'
              }
            }
          );

          // Credit Customer Wallet
          const customer = await User.findById(order.customer);
          if (customer) {
            const newBalance = (customer.walletBalance || 0) + refundAmount;
            await User.updateOne(
              { _id: customer._id },
              { $set: { walletBalance: newBalance } }
            );

            const TransactionModel = require('../models/Transaction').default || Transaction;
            await TransactionModel.create({
              user: order.customer,
              amount: refundAmount,
              type: 'credit',
              description: `Refund for unaccepted order #${order._id.toString().slice(-6)}`,
              order: order._id,
            });
            
            // Notify Customer via Push
            if (customer.expoPushToken) {
              await sendPushNotification(
                customer.expoPushToken,
                'Order Cancelled & Refunded',
                'The restaurant was too busy to accept your order. We have fully refunded ₹' + refundAmount + ' to your wallet.',
                { type: 'ORDER_CANCELLED', orderId: order._id }
              );
            }
          }

          // 2. Put Restaurant Offline
          const restaurant = await Restaurant.findById(order.restaurant);
          if (restaurant) {
            await Restaurant.updateOne(
              { _id: restaurant._id },
              { $set: { 'operations.isOnline': false } }
            );

            // Notify Restaurant Owner via Push
            const owner = await User.findById(restaurant.owner);
            if (owner && owner.expoPushToken) {
              await sendPushNotification(
                owner.expoPushToken,
                'Store Auto-Paused 🔴',
                `You missed an order! We've temporarily paused your store to protect customers. Go online when you're ready.`,
                { type: 'STORE_PAUSED' }
              );
            }
          }

          // 3. Emit WebSockets for Real-time App Updates
          if (io) {
            const populatedOrder = await Order.findById(order._id)
              .populate('customer', 'name phone')
              .populate('restaurant', 'name location');
              
            if (populatedOrder) {
               // Update Customer UI
               const customerId = populatedOrder.customer?._id || populatedOrder.customer;
               if (customerId) {
                 io.to(customerId.toString()).emit('orderCancelled', populatedOrder);
               }
               // Update Restaurant UI
               const restaurantId = populatedOrder.restaurant?._id || populatedOrder.restaurant;
               if (restaurantId) {
                 io.to(restaurantId.toString()).emit('orderCancelled', populatedOrder);
                 // Tell Restaurant app that they are now offline
                 io.to(restaurantId.toString()).emit('storeStatusChanged', { isOnline: false });
               }
            }
          }
        }
      }
    } catch (error) {
      console.error('[CRON] Error sweeping pending orders:', error);
    }
  });
};
