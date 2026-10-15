const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/happido');
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);
async function run() {
  const rests = await User.find({ role: 'restaurant' }).lean();
  let found = false;
  rests.forEach(r => {
    if (r.menu) {
      r.menu.forEach(m => {
        if (m.name && m.name.toLowerCase().includes('mushroom')) {
          console.log(`Found ${m.name} in ${r.restaurantName}`);
          found = true;
        }
        if (m.itemName && m.itemName.toLowerCase().includes('mushroom')) {
          console.log(`Found ${m.itemName} in ${r.restaurantName}`);
          found = true;
        }
      });
    }
  });
  if (!found) console.log("Not found in any menu.");
  process.exit(0);
}
run();
