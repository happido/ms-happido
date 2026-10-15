import express from 'express';
import { getDashboardStats, getPendingKYC, approveKYC } from '../controllers/adminController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/kyc/pending', getPendingKYC);
router.put('/kyc/:id/approve', approveKYC);

export default router;
