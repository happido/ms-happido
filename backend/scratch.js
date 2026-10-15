const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://developer:1P41CAtT5Z4yX24Y@cluster0.38phht1.mongodb.net/happido?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const count = await db.collection('restaurants').countDocuments();
  console.log("Total restaurants:", count);
  const sample = await db.collection('restaurants').findOne({});
  console.log(JSON.stringify(sample, null, 2));
  process.exit(0);
});
