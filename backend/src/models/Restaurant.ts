import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  rating: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: false }, // Must be approved first
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  menu: [{
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true },
    category: { type: String, default: 'General' },
    isVeg: { type: Boolean, default: true },
    isRecommended: { type: Boolean, default: false }
  }],
  operations: {
    isOnline: { type: Boolean, default: false },
    defaultPrepTime: { type: Number, default: 20 },
    autoAcceptOrders: { type: Boolean, default: false },
    isPureVeg: { type: Boolean, default: false },
    isRushMode: { type: Boolean, default: false },
    operatingHours: {
      openTime: { type: String, default: '10:00 AM' },
      closeTime: { type: String, default: '10:00 PM' },
      daysOff: { type: [String], default: [] }
    }
  },
  documents: {
    fssaiNumber: { type: String },
    fssaiUrl: { type: String },
    gstNumber: { type: String },
    gstUrl: { type: String },
    panNumber: { type: String },
    panUrl: { type: String },
    cancelledChequeUrl: { type: String }
  },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountHolderName: { type: String }
  },
  adSettings: {
    isBoostActive: { type: Boolean, default: false }
  },
  promotions: [{
    code: { type: String, required: true },
    title: { type: String, required: true },
    discount: { type: String, required: true },
    minOrder: { type: Number, required: true },
    ordersDriven: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tag: { type: String, default: 'Promotion' },
    startDate: { type: String },
    endDate: { type: String }
  }]
}, { timestamps: true });

restaurantSchema.index({ location: '2dsphere' });

export default mongoose.model('Restaurant', restaurantSchema);
