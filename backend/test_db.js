const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/happido')
  .then(async () => {
    const db = mongoose.connection.db;
    const items = await db.collection('restaurants').findOne({});
    console.log(JSON.stringify(items.menu.map(i => ({ name: i.name, isRecommended: i.isRecommended })), null, 2));
    process.exit(0);
  });
