import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User';
import CustomerProfile from '../models/CustomerProfile';
import RiderProfile from '../models/RiderProfile';
import Restaurant from '../models/Restaurant';
import connectDB from '../config/db';

dotenv.config();

const KADAPA_BASE_LAT = 14.4673;
const KADAPA_BASE_LNG = 78.8242;

// Helper to generate a random coordinate near Kadapa
const getRandomCoordinate = () => {
  const latDelta = (Math.random() - 0.5) * 0.02; // ~2km spread
  const lngDelta = (Math.random() - 0.5) * 0.02;
  return [KADAPA_BASE_LNG + lngDelta, KADAPA_BASE_LAT + latDelta];
};

const runSeed = async () => {
  try {
    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    console.log('Clearing old test entities...');
    await User.deleteMany({ email: { $regex: 'test.*@happido\\.com' } });
    
    // Also delete restaurants owned by these test users
    await Restaurant.deleteMany({ name: { $regex: 'Test Restaurant' } });

    console.log('Seeding 5 Customers...');
    for (let i = 1; i <= 5; i++) {
      const customerUser = await User.create({
        name: `Test Customer ${i}`,
        email: `testcustomer${i}@happido.com`,
        password: passwordHash,
        phone: `900000000${i}`,
        role: 'customer',
        isVerified: true
      });
      await CustomerProfile.create({
        userId: customerUser._id,
        bloodGroup: 'O+'
      });
    }

    console.log('Seeding 5 Riders...');
    const vehicleTypes = ['bike', 'auto', 'car', 'scooter', 'auto'];
    for (let i = 1; i <= 5; i++) {
      const riderUser = await User.create({
        name: `Test Captain ${i}`,
        email: `testrider${i}@happido.com`,
        password: passwordHash,
        phone: `800000000${i}`,
        role: 'rider',
        isVerified: true
      });
      await RiderProfile.create({
        userId: riderUser._id,
        isOnline: true,
        vehicleType: vehicleTypes[i - 1] as 'bike' | 'auto' | 'car' | 'scooter',
        vehicleDetails: `AP04 AB 123${i}`,
        location: { type: 'Point', coordinates: getRandomCoordinate() }
      });
    }

    console.log('Seeding 5 Restaurants...');
    for (let i = 1; i <= 5; i++) {
      const restaurantUser = await User.create({
        name: `Test Restaurant Owner ${i}`,
        email: `testrestaurant${i}@happido.com`,
        password: passwordHash,
        phone: `700000000${i}`,
        role: 'restaurant',
        isVerified: true
      });

      await Restaurant.create({
        owner: restaurantUser._id,
        name: `Test Restaurant ${i}`,
        description: `Delicious local food from kitchen ${i}`,
        isOpen: true,
        rating: 4.5,
        location: { type: 'Point', coordinates: getRandomCoordinate() },
        menu: [
          { name: `Kadapa Special Biryani`, price: 250, isAvailable: true },
          { name: `Chicken 65`, price: 150, isAvailable: true }
        ]
      });
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
