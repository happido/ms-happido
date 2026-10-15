const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/happido')
  .then(async () => {
    const db = mongoose.connection.db;
    const rest = await db.collection('restaurants').findOne({});
    console.log("Restaurant menu length:", rest.menu ? rest.menu.length : 0);
    process.exit(0);
  });
