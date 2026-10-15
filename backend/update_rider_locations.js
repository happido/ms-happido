const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function updateRiderLocations() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const RiderProfile = require('./src/models/RiderProfile').default;
    
    // Set all riders to Hyderabad Center (same as Dispatch Engine fallback)
    const hyderabadLocation = {
      type: 'Point',
      coordinates: [78.4867, 17.3850] // [longitude, latitude]
    };

    const result = await RiderProfile.updateMany(
      {}, 
      { $set: { location: hyderabadLocation } }
    );

    console.log(`Successfully updated ${result.modifiedCount} rider profiles to Hyderabad testing coordinates.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

updateRiderLocations();
