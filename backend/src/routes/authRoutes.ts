import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, checkUserExists, sendPhoneOtp, verifyRider, verifyRestaurant, getMe } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Strict OTP rate limiter: 5 OTP requests per 10 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many OTP requests. Please wait 10 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send-otp', otpLimiter, sendPhoneOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/check-exists', checkUserExists);
router.post('/verify-rider', protect, verifyRider);
router.post('/verify-restaurant', protect, verifyRestaurant);
router.get('/me', protect, getMe);
import { savePushToken, updateKitchenOperations, updateProfilePhoto, updateLocation } from '../controllers/authController';
router.put('/push-token', protect, savePushToken);
router.put('/me/operations', protect, updateKitchenOperations);
router.put('/me/profile-photo', protect, updateProfilePhoto);
router.put('/me/location', protect, updateLocation);

export default router;
