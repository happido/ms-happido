import express from 'express';
import { acceptOrder, declineOrder, testDispatch } from '../controllers/dispatchController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

// Routes for riders to respond to pings
router.post('/accept', protect, restrictTo('rider'), acceptOrder);
router.post('/decline', protect, restrictTo('rider'), declineOrder);

// Dev testing endpoint
router.post('/test', testDispatch);

export default router;
