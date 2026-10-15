import mongoose from 'mongoose';

const customerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  savedAddresses: [{
    type: { type: String, enum: ['home', 'work', 'other'], default: 'other' },
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] } // [longitude, latitude]
    }
  }]
}, { timestamps: true });

customerProfileSchema.index({ 'savedAddresses.location': '2dsphere' });

export default mongoose.model('CustomerProfile', customerProfileSchema);
