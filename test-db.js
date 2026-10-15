const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/happido');
const User = require('./backend/src/models/User').default;
const RiderProfile = require('./backend/src/models/RiderProfile').default;
async function run() {
  const riders = await User.find({ role: 'rider' });
  console.log("Riders:", riders.map(r => ({ email: r.email, id: r._id })));
  process.exit(0);
}
run();
