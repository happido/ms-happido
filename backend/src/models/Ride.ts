import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  dropoffLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  pickupAddress: { type: String, default: 'Pickup Location' },
  dropoffAddress: { type: String, default: 'Dropoff Destination' },
  fare: { type: Number },
  vehicleType: { type: String, enum: ['bike', 'auto', 'car', 'scooter'], default: 'bike' },
  otp: { type: String },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'],
    default: 'requested'
  }
}, { timestamps: true });

rideSchema.index({ pickupLocation: '2dsphere' });

export default mongoose.model('Ride', rideSchema);
