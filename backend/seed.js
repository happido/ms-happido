require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models/userModel'); // assuming it's exported from userModel

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/MS_Happido_DB').then(async () => {
  const users = await User.find({ role: 'restaurant' });
  console.log(users.map(u => u.restaurantName || u.name));
  process.exit(0);
});
