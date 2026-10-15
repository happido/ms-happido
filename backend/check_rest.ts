import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const rests = await User.find({ role: 'restaurant' });
  console.log('Found', rests.length, 'restaurants');
  if (rests.length > 0) {
    console.log(rests[0].restaurantName);
  }
  process.exit(0);
}
run();
