import mongoose from 'mongoose';

export interface IOtp extends mongoose.Document {
  phone: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true,
    index: true
  },
  otp: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 300 // Document automatically deleted by MongoDB after 5 minutes (300 seconds)
  }
});

export default mongoose.model<IOtp>('Otp', otpSchema);
