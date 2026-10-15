import express from 'express';
import { createOrder, getRestaurantOrders, getCustomerOrders, updateOrderStatus, requestDeliveryRider, getOrderById, verifyDeliveryOtp, verifyPickupOtp } from '../controllers/orderController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Customer creates an order
router.post('/', protect, createOrder);

// Customer gets their orders
router.get('/customer', protect, getCustomerOrders);

// Restaurant gets their incoming orders
router.get('/restaurant', protect, getRestaurantOrders);

// Get single order by ID
router.get('/:id', protect, getOrderById);

// Restaurant broadcasts the order to riders
router.post('/:id/request-rider', protect, requestDeliveryRider);

// Restaurant/Rider updates the order status
router.put('/:id/status', protect, updateOrderStatus);
// Verify OTPs
router.post('/:id/verify-pickup', protect, verifyPickupOtp);
router.post('/:id/verify-delivery', protect, verifyDeliveryOtp);

export default router;
