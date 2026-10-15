const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://superadmin:SuperPassword123@cluster0.38phht1.mongodb.net/mshappido?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log(users.map(u => ({ email: u.email, role: u.role, _id: u._id })));
    process.exit(0);
  });
