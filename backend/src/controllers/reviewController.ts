import { Response } from 'express';
import Review from '../models/Review';
import Order from '../models/Order';
import Restaurant from '../models/Restaurant';
import { AuthRequest } from '../middlewares/authMiddleware';

// Customer submits a review after delivery
export const createReview = async (req: AuthRequest, res: Response) => {
  const { orderId, foodRating, deliveryRating, comment, tags, photoUrls } = req.body;

  if (!orderId || !foodRating) {
    return res.status(400).json({ message: 'Order ID and food rating are required.' });
  }

  if (foodRating < 1 || foodRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    // Verify the order exists and belongs to this customer
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only review your own orders.' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'You can only review delivered orders.' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ order: orderId, customer: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this order.' });
    }

    const review = await Review.create({
      order: orderId,
      customer: req.user._id,
      restaurant: order.restaurant,
      rider: order.rider,
      foodRating,
      deliveryRating: deliveryRating || undefined,
      comment: comment || '',
      tags: tags || [],
      photoUrls: photoUrls || [],
    });

    // Update restaurant's average rating
    const allReviews = await Review.find({ restaurant: order.restaurant, isVisible: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.foodRating, 0) / allReviews.length;
    await Restaurant.findByIdAndUpdate(order.restaurant, { 
      rating: parseFloat(avgRating.toFixed(1)) 
    });

    res.status(201).json({ message: 'Review submitted successfully!', review });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate review.' });
    }
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Get all reviews for a restaurant
export const getRestaurantReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const reviews = await Review.find({ restaurant: restaurantId, isVisible: true })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Review.countDocuments({ restaurant: restaurantId, isVisible: true });
    const avgRating = await Review.aggregate([
      { $match: { restaurant: restaurantId, isVisible: true } },
      { $group: { _id: null, avg: { $avg: '$foodRating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: {
        averageRating: avgRating[0]?.avg?.toFixed(1) || '0.0',
        totalReviews: avgRating[0]?.count || 0,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Restaurant owner replies to a review
export const replyToReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!reply || reply.length > 300) {
      return res.status(400).json({ message: 'Reply is required and must be under 300 characters.' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Verify the restaurant owner
    const restaurant = await Restaurant.findById(review.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the restaurant owner can reply.' });
    }

    review.restaurantReply = reply;
    review.restaurantRepliedAt = new Date();
    await review.save();

    res.json({ message: 'Reply added successfully.', review });
  } catch (error: any) {
    res.status(500).json({ message: 'Error replying to review', error: error.message });
  }
};
