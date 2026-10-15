require('dotenv').config();
const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    const db = client.db('mshappido');
    const users = db.collection('users');
    const allRiders = await users.find({ role: 'rider' }).toArray();
    console.log('Riders found:');
    allRiders.forEach(r => console.log(`Email: ${r.email}, Phone: ${r.phone}`));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
