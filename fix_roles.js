const mongoose = require('mongoose');
const User = require('./backend/src/models/User').default;

mongoose.connect('mongodb://localhost:27017/mshappido') // Assuming standard local DB name based on connectDB
  .then(async () => {
    const res = await mongoose.connection.collection('users').updateMany({}, { $set: { role: 'restaurant' } });
    console.log('Updated users to restaurant role:', res.modifiedCount);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
