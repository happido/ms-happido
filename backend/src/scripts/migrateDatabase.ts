import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import CustomerProfile from '../models/CustomerProfile';
import RiderProfile from '../models/RiderProfile';
import Restaurant from '../models/Restaurant';

dotenv.config();

const migrateDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/happido');
    console.log('Connected to MongoDB. Starting migration...');

    const users = await User.find().lean();
    console.log(`Found ${users.length} users to process.`);

    for (const user of users) {
      if (user.role === 'customer') {
        const exists = await CustomerProfile.findOne({ userId: user._id });
        if (!exists) {
          await CustomerProfile.create({
            userId: user._id,
            bloodGroup: (user as any).bloodGroup || null,
          });
          console.log(`Created CustomerProfile for ${user.name}`);
        }
      } else if (user.role === 'rider') {
        const exists = await RiderProfile.findOne({ userId: user._id });
        if (!exists) {
            const rawTarget = (user as any).targetDestination;
            const rawLoc = (user as any).location;
            
            await RiderProfile.create({
            userId: user._id,
            vehicleDetails: (user as any).vehicleDetails || null,
            vehicleType: (user as any).vehicleType || 'bike',
            isOnline: (user as any).isOnline || false,
            rating: (user as any).rating || 5.0,
            acceptanceRate: (user as any).acceptanceRate || 100,
            targetDestination: { 
              type: 'Point', 
              coordinates: (rawTarget && rawTarget.coordinates && rawTarget.coordinates.length === 2) ? rawTarget.coordinates : [0, 0] 
            },
            location: { 
              type: 'Point', 
              coordinates: (rawLoc && rawLoc.coordinates && rawLoc.coordinates.length === 2) ? rawLoc.coordinates : [0, 0] 
            },
            quests: (user as any).quests || {},
            documents: (user as any).documents || {},
            bankDetails: (user as any).bankDetails || {},
            dailyPassActiveUntil: (user as any).dailyPassActiveUntil || null,
            autoRenewPass: (user as any).autoRenewPass || false,
          });
          console.log(`Created RiderProfile for ${user.name}`);
        }
      } else if (user.role === 'restaurant') {
        const exists = await Restaurant.findOne({ owner: user._id });
        const rawLoc = (user as any).location;
        if (!exists) {
          await Restaurant.create({
            owner: user._id,
            name: (user as any).restaurantName || user.name,
            location: { 
              type: 'Point', 
              coordinates: (rawLoc && rawLoc.coordinates && rawLoc.coordinates.length === 2) ? rawLoc.coordinates : [0, 0] 
            },
            menu: (user as any).menu || [],
            operations: (user as any).operations || {},
            documents: (user as any).documents || {},
            bankDetails: (user as any).bankDetails || {},
          });
          console.log(`Created Restaurant for ${user.name}`);
        }
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateDatabase();
