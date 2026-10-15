import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  description: { type: String, required: true },
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
