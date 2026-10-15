const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://superadmin:SuperPassword123@cluster0.38phht1.mongodb.net/mshappido?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    try {
      const db = mongoose.connection.db;
      const rest = await db.collection('restaurants').findOne({});
      if (!rest) return;
      
      const images = {
        'Hyderabadi Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
        'Mutton Dum Biryani': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=800&auto=format&fit=crop',
        'Paneer Butter Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?q=80&w=800&auto=format&fit=crop',
        'Butter Naan': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=800&auto=format&fit=crop',
        'Chicken 65 (Dry)': 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?q=80&w=800&auto=format&fit=crop',
        'Ghee Roast Dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800&auto=format&fit=crop'
      };

      const updatedMenu = rest.menu.map(item => {
        if (images[item.name]) {
          item.imageUrl = images[item.name];
        }
        return item;
      });

      await db.collection('restaurants').updateOne({ _id: rest._id }, { $set: { menu: updatedMenu } });
      console.log('Images added to menu items!');
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  });
