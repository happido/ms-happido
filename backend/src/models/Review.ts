import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Restaurant Rating (1-5)
  foodRating: { type: Number, required: true, min: 1, max: 5 },
  // Delivery Rating (1-5)
  deliveryRating: { type: Number, min: 1, max: 5 },
  // Overall experience text
  comment: { type: String, maxlength: 500 },
  // Photo reviews (like Zomato)
  photoUrls: [{ type: String }],
  // Tags for quick feedback
  tags: [{ type: String }], // e.g., ['Great Packaging', 'Tasty Food', 'Quick Delivery']
  
  // Restaurant's reply
  restaurantReply: { type: String, maxlength: 300 },
  restaurantRepliedAt: { type: Date },
  
  // Visibility
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

// Prevent duplicate reviews per order
reviewSchema.index({ order: 1, customer: 1 }, { unique: true });
// For fetching all reviews of a restaurant
reviewSchema.index({ restaurant: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
