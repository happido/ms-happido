const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect('mongodb+srv://superadmin:SuperPassword123@cluster0.38phht1.mongodb.net/mshappido?retryWrites=true&w=majority&appName=Cluster0').then(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Ms12345', salt);
  const db = mongoose.connection.db;
  await db.collection('users').updateOne({ email: 'happido@gmail.com', role: 'restaurant' }, { $set: { password: hashedPassword } });
  console.log("Password reset successfully for happido@gmail.com");
  process.exit(0);
});
