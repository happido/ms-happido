require('dotenv').config();
const mongoose = require('mongoose');
const Ride = require('./src/models/Ride').default;

async function forceAccept() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  
  const rides = await Ride.find({ status: 'requested' });
  if (rides.length > 0) {
    const ride = rides[0];
    ride.status = 'accepted';
    // Use an arbitrary rider ID for testing if needed
    // ride.rider = "some_rider_id"; 
    await ride.save();
    console.log('Ride forcefully accepted:', ride._id);
  } else {
    console.log('No requested rides found.');
  }
  process.exit(0);
}

forceAccept();
