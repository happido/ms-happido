const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://superadmin:SuperPassword123@cluster0.38phht1.mongodb.net/mshappido').then(async () => {
  const users = mongoose.connection.collection('users');
  const user = await users.findOne({ email: 'mahe@rider.com' });
  console.log("User details:", user);
  process.exit(0);
});
