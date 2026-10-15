import mongoose from 'mongoose';

const riderProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  isOnline: { type: Boolean, default: false },
  vehicleDetails: { type: String },
  vehicleType: { type: String, enum: ['bike', 'auto', 'car', 'scooter'] },
  dailyPassActiveUntil: { type: Date },
  autoRenewPass: { type: Boolean, default: false },
  rating: { type: Number, default: 5.0 },
  acceptanceRate: { type: Number, default: 100 },
  targetDestination: { type: Object },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  quests: {
    ridesCompleted: { type: Number, default: 0 },
    targetRides: { type: Number, default: 5 },
    bonus: { type: Number, default: 150 }
  },
  documents: {
    profilePhotoUrl: { type: String },
    licenseUrl: { type: String },
    rcUrl: { type: String },
    aadharNumber: { type: String },
    aadharUrl: { type: String },
    riderPanNumber: { type: String },
    riderPanUrl: { type: String },
  },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountHolderName: { type: String }
  }
}, { timestamps: true });

riderProfileSchema.index({ location: '2dsphere' });

export default mongoose.model('RiderProfile', riderProfileSchema);
