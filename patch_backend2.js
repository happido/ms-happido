const fs = require('fs');

const content = `
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Item } from '../models/Item';

// ... other methods ...

export const registerRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantData = req.body;
    // Basic validation
    if (!restaurantData.restaurantName || !restaurantData.phone) {
      return res.status(400).json({ message: 'Restaurant name and phone are required' });
    }

    // Set role to restaurant
    restaurantData.role = 'restaurant';
    
    // In a real app we'd hash the password, check if phone exists, etc.
    const newRestaurant = new User(restaurantData);
    await newRestaurant.save();

    res.status(201).json({ message: 'Restaurant registered successfully', restaurant: newRestaurant });
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering restaurant', error: error.message });
  }
};

export const getDynamicFeed = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const tab = (req.query.tab as string) || 'ALL';

    const widgets = [];

    // 1. Theme Header (Dark Purple for modern look)
    widgets.push({
      id: 'header_1',
      type: 'theme_header',
      backgroundColor: '#2D003E',
      bannerText: 'FOODIE VERSE',
    });

    if (tab === 'ALL' || tab === 'OFFERS') {
      // 2. Tall Offers List (Horizontal scroll of deals overlapping header)
      widgets.push({
        id: 'tall_offers_1',
        type: 'tall_offers_list',
        items: [
          { id: 't1', title: 'Deal\\nFeast', subtitle: 'GET\\n70%\\nOFF', bgColor: '#7E22CE', image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80' },
          { id: 't2', title: 'Get A\\nFree Treat', subtitle: 'CUPCAKES', bgColor: '#9333EA', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80' },
          { id: 't3', title: 'Flat ₹200 OFF\\n& More', subtitle: 'CASHBACK', bgColor: '#6B21A8', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' }
        ]
      });
    }

    if (tab === 'ALL') {
      // 3. Circular Categories (Horizontal scroll)
      widgets.push({
        id: 'circular_categories_1',
        type: 'circular_categories',
        items: [
          { id: 'c1', title: 'Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' },
          { id: 'c2', title: 'Shawarma', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&q=80' },
          { id: 'c3', title: 'Ice Cream', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80' },
          { id: 'c4', title: 'Dosa', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=600&q=80' },
          { id: 'c5', title: 'Cakes', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80' }
        ]
      });
    }

    // 4. Filter Pills
    widgets.push({
      id: 'filter_pills_1',
      type: 'filter_pills',
      items: ['Filter', 'Sort by', '99 Store', 'Bolt 15', 'Top Rated']
    });

    // Fetch actual restaurants from DB
    const restaurants = await User.find({ role: 'restaurant' }).limit(10);
    
    const placeholderImages = [
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&auto=format&fit=crop&q=80'
    ];

    const restaurantItems = restaurants.map((r, index) => {
      const distance = (1.2 + (index * 0.7)).toFixed(1);
      return {
        id: r._id,
        name: r.restaurantName || r.name,
        rating: '4.5',
        ratingCount: Math.floor(Math.random() * 500) + 50,
        time: tab === 'BOLT' ? '10 mins' : '15-20 mins',
        distance: \`\${distance} km\`,
        cuisine: r.restaurantName?.includes('Biryani') ? 'Biryani' : 'North Indian',
        offer: tab === 'OFFERS' ? 'FLAT ₹150 OFF' : '60% OFF\\nUPTO ₹120',
        originalPrice: '₹300',
        discountPrice: '₹99',
        image: r.documents?.profilePhotoUrl || placeholderImages[index % placeholderImages.length]
      };
    });

    if (restaurantItems.length > 0) {
      if (tab === 'OFFERS' || tab === 'STORE') {
        widgets.push({
          id: \`restaurants_horizontal_\${tab}\`,
          type: 'restaurant_horizontal_list',
          title: tab === 'STORE' ? 'Premium Stores Near You' : 'Mega Discounts',
          items: restaurantItems.slice(0, 5)
        });
      }

      widgets.push({
        id: \`restaurants_vertical_\${tab}\`,
        type: 'restaurant_vertical_list',
        title: 'Restaurants to explore',
        subtitle: 'Featured Restaurants',
        items: restaurantItems
      });
    }

    res.json(widgets);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching feed', error: error.message });
  }
};
`;

const file = fs.readFileSync('backend/src/controllers/restaurantController.ts', 'utf8');
const beforeGetDynamicFeed = file.substring(0, file.indexOf('export const registerRestaurant'));
fs.writeFileSync('backend/src/controllers/restaurantController.ts', beforeGetDynamicFeed + content);
