import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db';
import Restaurant from './src/models/Restaurant';

dotenv.config();

const run = async () => {
  await connectDB();
  const res = await Restaurant.updateMany(
    {}, 
    { $set: { "location.coordinates": [78.8242, 14.4673] } }
  );
  console.log('Updated restaurants:', res);
  process.exit(0);
};
run();
