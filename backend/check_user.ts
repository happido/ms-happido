import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || '')
  .then(async () => {
    console.log('Connected');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const user = await User.findOne({ email: 'happiido@gmail.com' });
    console.log('Found user:', user);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
