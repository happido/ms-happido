const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/happido')
  .then(async () => {
    try {
      const db = mongoose.connection.db;
      const rest = await db.collection('restaurants').findOne({});
      if (rest) {
        if (!rest.menu || rest.menu.length === 0) {
          const DEFAULT_MENU_ITEMS = [
            { _id: new mongoose.Types.ObjectId(), name: 'Hyderabadi Chicken Biryani', category: 'Biryani', price: 280, isAvailable: true, isVeg: false, description: 'Aromatic basmati rice cooked with tender chicken and authentic spices.', isRecommended: false },
            { _id: new mongoose.Types.ObjectId(), name: 'Mutton Dum Biryani', category: 'Biryani', price: 380, isAvailable: true, isVeg: false, description: 'Slow cooked tender mutton with saffron infused long grain rice.', isRecommended: false },
            { _id: new mongoose.Types.ObjectId(), name: 'Paneer Butter Masala', category: 'Main Course', price: 240, isAvailable: true, isVeg: true, description: 'Fresh cottage cheese cubes in rich and creamy tomato butter gravy.', isRecommended: false },
            { _id: new mongoose.Types.ObjectId(), name: 'Butter Naan', category: 'Breads', price: 45, isAvailable: true, isVeg: true, description: 'Traditional clay oven baked flatbread with melted butter.', isRecommended: false },
            { _id: new mongoose.Types.ObjectId(), name: 'Chicken 65 (Dry)', category: 'Starters', price: 220, isAvailable: false, isVeg: false, description: 'Deep fried spicy chicken chunks tossed in South Indian spices and curry leaves.', isRecommended: false },
            { _id: new mongoose.Types.ObjectId(), name: 'Ghee Roast Dosa', category: 'Breakfast', price: 90, isAvailable: true, isVeg: true, description: 'Crispy golden crepe roasted in pure desi ghee served with chutneys.', isRecommended: false }
          ];
          await db.collection('restaurants').updateOne({ _id: rest._id }, { $set: { menu: DEFAULT_MENU_ITEMS } });
          console.log("Seeded default menu to DB!");
        } else {
          console.log("Menu already exists in DB, length:", rest.menu.length);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      process.exit(0);
    }
  });
