import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User';
import connectDB from './config/db';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany(); // Clear existing users

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('MS123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@happido.com',
        password: adminPassword,
        role: 'admin',
        phone: '1234567890'
      },
      {
        name: 'Customer Jane',
        email: 'customer@happido.com',
        password: password,
        role: 'customer',
        phone: '1112223333',
        bloodGroup: 'O+'
      },
      {
        name: 'Rider Mike',
        email: 'rider@happido.com',
        password: password,
        role: 'rider',
        phone: '4445556666',
        vehicleDetails: 'Honda Activa - MH 12 AB 1234'
      },
      {
        name: 'Happido Burgers Owner',
        email: 'restaurant@happido.com',
        password: password,
        role: 'restaurant',
        phone: '7778889999',
        restaurantName: 'Happido Burgers'
      }
    ];

    await User.insertMany(users);
    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();
