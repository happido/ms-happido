import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import connectDB from './src/config/db';

dotenv.config();

const run = async () => {
  await connectDB();
  const users = await User.find({});
  console.log("All users in DB:", users.map(u => ({email: u.email, phone: u.phone, role: u.role})));
  process.exit(0);
};

run();
