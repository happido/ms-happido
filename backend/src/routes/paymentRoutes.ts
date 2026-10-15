import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);

export default router;
