import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, required: true, default: 40 },
  grandTotal: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'ready_for_pickup', 'arrived_at_restaurant', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  deliveryAddress: { type: String },
  distanceKm: { type: Number, default: 0 },
  otp: { type: String },
  pickupOtp: { type: String },
  paymentMethod: { type: String, enum: ['card', 'upi', 'cash'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  // Cancellation tracking
  cancelledBy: { type: String, enum: ['customer', 'restaurant', 'rider', 'system'] },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  // Refund tracking
  refundAmount: { type: Number, default: 0 },
  refundStatus: { type: String, enum: ['none', 'pending', 'completed'], default: 'none' },
  // 20-min delivery flag
  isRush20Min: { type: Boolean, default: false },
}, { timestamps: true });

orderSchema.index({ deliveryLocation: '2dsphere' });

export default mongoose.model('Order', orderSchema);

