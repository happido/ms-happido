import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const r = await mongoose.connection.collection('restaurants').find({}).toArray();
  console.log(JSON.stringify(r, null, 2));
  process.exit(0);
});
