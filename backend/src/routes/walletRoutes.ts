import express from 'express';
import { getWalletBalance, withdrawFunds, buyDailyPass, addFunds, toggleAutoPay } from '../controllers/walletController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', protect, getWalletBalance);
router.post('/withdraw', protect, withdrawFunds);
router.post('/buy-pass', protect, buyDailyPass);
router.post('/add-funds', protect, addFunds);
router.post('/autopay', protect, toggleAutoPay);

export default router;
