import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
});
const User = mongoose.model('User', userSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/happido');
  const users = await User.find({}, 'name email role');
  console.log('--- USERS IN DB ---');
  console.table(users.map(u => ({ email: u.email, role: u.role, name: u.name })));
  process.exit(0);
}
check();
