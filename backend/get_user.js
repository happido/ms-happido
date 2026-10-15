const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://shameem099:R0H2lQv6xQ35yHjI@cluster0.o5h63t5.mongodb.net/happido");

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const run = async () => {
  const users = await User.find({});
  console.log("All users in DB:");
  users.forEach(u => console.log(u.email, u.phone, u.role));
  process.exit(0);
};

run();
