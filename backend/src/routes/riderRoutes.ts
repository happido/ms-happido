import express from 'express';
import { getRiderMetrics, setTargetDestination, handleBackgroundLocation } from '../controllers/riderController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply auth middleware to all routes here if needed, but assuming protect is available
router.use(protect);

router.get('/metrics', getRiderMetrics);
router.post('/destination', setTargetDestination);
router.post('/background-location', handleBackgroundLocation);

export default router;
