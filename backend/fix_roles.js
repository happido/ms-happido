require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const res = await mongoose.connection.collection('users').updateMany({}, { $set: { role: 'restaurant' } });
    console.log('Updated users to restaurant role:', res.modifiedCount);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
