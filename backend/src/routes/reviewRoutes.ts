import express from 'express';
import { createReview, getRestaurantReviews, replyToReview } from '../controllers/reviewController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Customer submits a review
router.post('/', protect, createReview);

// Get all reviews for a restaurant (public)
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Restaurant owner replies to a review
router.put('/:reviewId/reply', protect, replyToReview);

export default router;
