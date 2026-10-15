import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  hospitalName: { type: String, required: true },
  urgencyLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'high' 
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled', 'cancelled'],
    default: 'open'
  },
  acceptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

bloodRequestSchema.index({ location: '2dsphere' });

export default mongoose.model('BloodRequest', bloodRequestSchema);
