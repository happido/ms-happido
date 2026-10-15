import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'rider', 'restaurant', 'admin'], 
    default: 'customer' 
  },
  phone: { type: String, unique: true, sparse: true },
  expoPushToken: { type: String },
  isVerified: { type: Boolean, default: false },
  onboardingStatus: { 
    type: String, 
    enum: ['incomplete', 'pending_verification', 'verified', 'rejected'],
    default: 'incomplete'
  },
  walletBalance: { type: Number, default: 0 },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  bloodDonationOptIn: { type: Boolean, default: false }
}, { timestamps: true });

// Global uniqueness applied on email and phone directly
userSchema.index({ bloodGroup: 1, bloodDonationOptIn: 1 }); // Index for fast emergency broadcast queries

export default mongoose.model('User', userSchema);
