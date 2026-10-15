const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/happido').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({ email: 'happido@gmail.com' }).toArray();
  console.log("Users:", users);
  process.exit(0);
});
