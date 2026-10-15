const fs = require('fs');

const path = 'src/controllers/restaurantController.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace Circular Categories
const oldCategories = `      widgets.push({
        id: 'circular_categories_1',
        type: 'circular_categories',
        items: [
          { id: 'c1', title: 'Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' },
          { id: 'c2', title: 'Shawarma', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&q=80' },
          { id: 'c3', title: 'Ice Cream', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80' },
          { id: 'c4', title: 'Dosa', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=600&q=80' },
          { id: 'c5', title: 'Cakes', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80' }
        ]
      });`;

const newCategories = `      widgets.push({
        id: 'circular_categories_1',
        type: 'circular_categories',
        items: [
          { id: 'c1', title: 'Biryani', image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&q=80' },
          { id: 'c2', title: 'Dosa', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80' },
          { id: 'c3', title: 'Idli', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=400&q=80' },
          { id: 'c4', title: 'Meals', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80' },
          { id: 'c5', title: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' }
        ]
      });`;

content = content.replace(oldCategories, newCategories);

// Let's also update the Restaurant mock data
const oldRestaurants = `      widgets.push({
        id: 'restaurant_vertical_list_1',
        type: 'restaurant_vertical_list',
        title: 'Restaurants to explore',
        subtitle: 'Featured Restaurants',
        items: [
          { id: 'r1', name: 'Happido Burgers', rating: 4.5, ratingCount: '143', time: '15-20 mins', cuisine: 'Burgers, American', distance: '1.2 km', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', offer: '60% OFF', suboffer: 'UPTO ₹120' },
          { id: 'r2', name: 'Pizza Palace', rating: 4.2, ratingCount: '89', time: '25-30 mins', cuisine: 'Italian, Pizzas', distance: '3.4 km', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80', offer: 'FREE ITEM', suboffer: 'ON ORDERS > ₹400' },
          { id: 'r3', name: 'Healthy Salads Co.', rating: 4.8, ratingCount: '210', time: '10-15 mins', cuisine: 'Healthy, Salads', distance: '0.8 km', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', offer: '20% OFF', suboffer: 'UPTO ₹50' }
        ]
      });`;

const newRestaurants = `      widgets.push({
        id: 'restaurant_vertical_list_1',
        type: 'restaurant_vertical_list',
        title: 'Top Restaurants in Kadapa',
        subtitle: 'Handpicked local favorites',
        items: [
          { id: 'r1', name: 'Kadapa Biryani House', rating: 4.8, ratingCount: '4K+', time: '15-20 mins', cuisine: 'Biryani, Andhra', distance: '1.2 km', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', offer: '60% OFF', suboffer: 'UPTO ₹120' },
          { id: 'r2', name: 'Sri Lakshmi Dosa', rating: 4.5, ratingCount: '890', time: '25-30 mins', cuisine: 'South Indian, Tiffins', distance: '3.4 km', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80', offer: 'FREE ITEM', suboffer: 'ON ORDERS > ₹400' },
          { id: 'r3', name: 'Rayalaseema Ruchulu', rating: 4.6, ratingCount: '2K+', time: '20-25 mins', cuisine: 'Andhra, Meals, Non-Veg', distance: '2.8 km', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80', offer: '20% OFF', suboffer: 'UPTO ₹50' }
        ]
      });`;

content = content.replace(oldRestaurants, newRestaurants);

fs.writeFileSync(path, content);
