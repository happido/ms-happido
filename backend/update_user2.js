const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://shameem099:R0H2lQv6xQ35yHjI@cluster0.o5h63t5.mongodb.net/happido");

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const run = async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Ms12345', salt);
  
  await User.updateOne(
    { email: 'mahe@mstechhive.com' }, 
    { $set: { phone: '9701800140', password: hash } },
    { upsert: true }
  );
  console.log("Updated user mahe@mstechhive.com phone to 9701800140 and password to Ms12345");
  
  // also create an account with email happiido@gmail.com just in case
  await User.updateOne(
    { email: 'happiido@gmail.com' },
    { $set: { phone: '9701800140', password: hash, role: 'customer' } },
    { upsert: true }
  );
  process.exit(0);
};

run();
