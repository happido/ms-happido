require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function run() {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    const db = client.db('mshappido');
    const users = db.collection('users');
    
    // Hash the password they are trying to use
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Ms12345', salt);
    
    // Upsert the exact user they want to log in with
    await users.updateOne(
      { email: 'mahe@rider.com' },
      { 
        $set: { 
          email: 'mahe@rider.com', 
          password: hashedPassword,
          role: 'rider',
          name: 'Mahe',
          phone: '9898989899'
        } 
      },
      { upsert: true }
    );
    console.log('Fixed user in DB. They can now login with mahe@rider.com / Ms12345');
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
