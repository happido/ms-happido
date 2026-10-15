const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/happido')
  .then(async () => {
    const db = mongoose.connection.db;
    const rest = await db.collection('restaurants').findOne({});
    console.log(JSON.stringify({
       imageUrl: rest.imageUrl,
       documents: rest.documents
    }, null, 2));
    process.exit(0);
  });
