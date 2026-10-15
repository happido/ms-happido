import express from 'express';
import { requestRide, acceptRide, updateRideStatus, arriveRide, startRide, completeRide, getRideHistory, cancelRide, getActiveRide } from '../controllers/rideController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/request', protect, restrictTo('customer', 'restaurant'), requestRide);
router.get('/history', protect, getRideHistory);
router.get('/active', protect, restrictTo('customer', 'restaurant'), getActiveRide);
router.put('/:id/accept', protect, restrictTo('rider'), acceptRide);
router.put('/:id/arrive', protect, restrictTo('rider'), arriveRide);
router.put('/:id/start', protect, restrictTo('rider'), startRide);
router.put('/:id/complete', protect, restrictTo('rider'), completeRide);
router.put('/:id/cancel', protect, cancelRide);
router.post('/:id/cancel', protect, cancelRide);
router.put('/:id/status', protect, updateRideStatus);

export default router;
