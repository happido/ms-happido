const fs = require('fs');

const path = 'src/controllers/restaurantController.ts';
let content = fs.readFileSync(path, 'utf8');

// We need to extract the search and veg query params in getDynamicFeed
const newVars = `    const tab = (req.query.tab as string) || 'ALL';
    const search = (req.query.search as string) || '';
    const veg = req.query.veg === 'true';`;

content = content.replace("const tab = (req.query.tab as string) || 'ALL';", newVars);

// Then we find the Restaurant list items and filter them
const oldRestaurantsList = `        items: [
          { id: 'r1', name: 'Kadapa Biryani House', rating: 4.8, ratingCount: '4K+', time: '15-20 mins', cuisine: 'Biryani, Andhra', distance: '1.2 km', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', offer: '60% OFF', suboffer: 'UPTO ₹120' },
          { id: 'r2', name: 'Sri Lakshmi Dosa', rating: 4.5, ratingCount: '890', time: '25-30 mins', cuisine: 'South Indian, Tiffins', distance: '3.4 km', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80', offer: 'FREE ITEM', suboffer: 'ON ORDERS > ₹400' },
          { id: 'r3', name: 'Rayalaseema Ruchulu', rating: 4.6, ratingCount: '2K+', time: '20-25 mins', cuisine: 'Andhra, Meals, Non-Veg', distance: '2.8 km', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80', offer: '20% OFF', suboffer: 'UPTO ₹50' }
        ]`;

const newRestaurantsList = `        items: [
          { id: 'r1', name: 'Kadapa Biryani House', rating: 4.8, ratingCount: '4K+', time: '15-20 mins', cuisine: 'Biryani, Andhra', isVeg: false, distance: '1.2 km', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', offer: '60% OFF', suboffer: 'UPTO ₹120' },
          { id: 'r2', name: 'Sri Lakshmi Dosa', rating: 4.5, ratingCount: '890', time: '25-30 mins', cuisine: 'South Indian, Tiffins', isVeg: true, distance: '3.4 km', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80', offer: 'FREE ITEM', suboffer: 'ON ORDERS > ₹400' },
          { id: 'r3', name: 'Rayalaseema Ruchulu', rating: 4.6, ratingCount: '2K+', time: '20-25 mins', cuisine: 'Andhra, Meals, Non-Veg', isVeg: false, distance: '2.8 km', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80', offer: '20% OFF', suboffer: 'UPTO ₹50' },
          { id: 'r4', name: 'Pure Veg Udupi', rating: 4.9, ratingCount: '1K+', time: '10-15 mins', cuisine: 'South Indian, Pure Veg', isVeg: true, distance: '0.5 km', image: 'https://images.unsplash.com/photo-1610192244261-3f33de715812?w=600&q=80', offer: '10% OFF', suboffer: 'UPTO ₹40' }
        ].filter(r => {
          if (veg && !r.isVeg) return false;
          if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.cuisine.toLowerCase().includes(search.toLowerCase())) return false;
          return true;
        })`;

content = content.replace(oldRestaurantsList, newRestaurantsList);

fs.writeFileSync(path, content);
