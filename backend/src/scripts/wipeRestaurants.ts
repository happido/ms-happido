import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

const RestaurantSchema = new mongoose.Schema({}, { strict: false });
const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

async function wipeDatabase() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/happido';
    console.log('Connecting to database...');
    await mongoose.connect(uri);

    console.log('Finding all restaurants...');
    const restaurants = await Restaurant.find({});
    
    let deletedUsers = 0;
    for (const r of restaurants) {
      if (r.owner) {
        await User.findByIdAndDelete(r.owner);
        deletedUsers++;
      }
    }

    const resResult = await Restaurant.deleteMany({});
    
    console.log(`✅ Database Wiped Successfully!`);
    console.log(`- Deleted ${resResult.deletedCount} Restaurants`);
    console.log(`- Deleted ${deletedUsers} Restaurant Owner Accounts`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error wiping database:', error);
    process.exit(1);
  }
}

wipeDatabase();
