require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/MS_Happido_DB').then(async () => {
  console.log('Connected to MongoDB.');
  
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  await User.deleteMany({ role: 'restaurant' });
  console.log('Cleared existing restaurants.');

  // Base Kadapa Coordinates
  const baseLng = 78.8242;
  const baseLat = 14.4673;

  const kadapaRestaurants = [
    {
      restaurantName: 'Kadapa Biryani House',
      phone: '+919999999991',
      role: 'restaurant',
      isVerified: true,
      email: 'biryani@kadapa.com',
      location: { type: 'Point', coordinates: [baseLng + 0.001, baseLat + 0.001] }, // ~150m away
      documents: { profilePhotoUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80' },
      menu: [
        { name: 'Chicken Dum Biryani', price: 250, type: 'Non-Veg', category: 'Biryani' },
        { name: 'Mutton Biryani', price: 350, type: 'Non-Veg', category: 'Biryani' }
      ]
    },
    {
      restaurantName: 'Sri Lakshmi Dosa',
      phone: '+919999999992',
      role: 'restaurant',
      isVerified: true,
      email: 'dosa@kadapa.com',
      location: { type: 'Point', coordinates: [baseLng - 0.002, baseLat + 0.005] }, // ~600m away
      documents: { profilePhotoUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80' },
      menu: [
        { name: 'Masala Dosa', price: 60, type: 'Pure Veg', category: 'Dosa' },
        { name: 'Idli Sambar', price: 40, type: 'Pure Veg', category: 'Idli' },
        { name: 'Onion Dosa', price: 70, type: 'Pure Veg', category: 'Dosa' }
      ]
    },
    {
      restaurantName: 'Rayalaseema Ruchulu',
      phone: '+919999999993',
      role: 'restaurant',
      isVerified: true,
      email: 'ruchulu@kadapa.com',
      location: { type: 'Point', coordinates: [baseLng + 0.015, baseLat - 0.010] }, // ~2km away
      documents: { profilePhotoUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80' },
      menu: [
        { name: 'Andhra Meals', price: 120, type: 'Pure Veg', category: 'Meals' },
        { name: 'Chicken Fry Piece Biryani', price: 280, type: 'Non-Veg', category: 'Biryani' }
      ]
    },
    {
      restaurantName: 'Pure Veg Udupi',
      phone: '+919999999994',
      role: 'restaurant',
      isVerified: true,
      email: 'udupi@kadapa.com',
      location: { type: 'Point', coordinates: [baseLng - 0.008, baseLat - 0.008] }, // ~1.2km away
      documents: { profilePhotoUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80' },
      menu: [
        { name: 'Idli', price: 35, type: 'Pure Veg', category: 'Idli' },
        { name: 'Vada', price: 40, type: 'Pure Veg', category: 'Snacks' },
        { name: 'Puri', price: 50, type: 'Pure Veg', category: 'Snacks' }
      ]
    },
    {
      restaurantName: 'Snack Station',
      phone: '+919999999995',
      role: 'restaurant',
      isVerified: true,
      email: 'snacks@kadapa.com',
      location: { type: 'Point', coordinates: [baseLng + 0.005, baseLat + 0.002] }, // ~500m away
      documents: { profilePhotoUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
      menu: [
        { name: 'Samosa', price: 20, type: 'Pure Veg', category: 'Snacks' },
        { name: 'Mirchi Bajji', price: 30, type: 'Pure Veg', category: 'Snacks' }
      ]
    },
    {
      restaurantName: 'Far Away Pizza',
      phone: '+919999999996',
      role: 'restaurant',
      isVerified: true,
      email: 'pizza@faraway.com',
      location: { type: 'Point', coordinates: [baseLng + 0.08, baseLat + 0.08] }, // ~10km away! Should be hidden!
      documents: { profilePhotoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' },
      menu: [
        { name: 'Margherita Pizza', price: 200, type: 'Pure Veg', category: 'Pizza' }
      ]
    }
  ];

  await User.insertMany(kadapaRestaurants);
  console.log('Successfully seeded Kadapa restaurants with coordinates!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
