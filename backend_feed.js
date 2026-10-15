const fs = require('fs');

// 1. Update Controller
const controllerFile = '/Users/apple/MS Happido/backend/src/controllers/restaurantController.ts';
let controllerContent = fs.readFileSync(controllerFile, 'utf8');

const feedController = `
export const getDynamicFeed = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    // Build the dynamic widget array
    const widgets = [];

    // 1. Theme Header
    widgets.push({
      id: 'header_1',
      type: 'theme_header',
      title: 'Ganesh Chaturthi',
      backgroundColor: '#8E0038',
    });

    // 2. Quick Categories (Static for now, but easily updatable in DB later)
    widgets.push({
      id: 'categories_1',
      type: 'quick_categories',
      items: [
        { id: 'c1', title: 'Festive\\nSweets', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=600&auto=format&fit=crop&q=80' },
        { id: 'c2', title: 'Get\\n70% OFF', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80' },
        { id: 'c3', title: 'Pure-Veg\\nDelights', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
        { id: 'c4', title: 'Delightful\\nOffers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' }
      ]
    });

    // Fetch actual restaurants from DB
    const restaurants = await User.find({ role: 'restaurant' }).limit(10);
    
    // Map to widget format
    const fastDeliveryItems = restaurants.map(r => ({
      id: r._id,
      name: r.restaurantName || r.name,
      rating: '4.5',
      time: '15-20 mins',
      cuisine: r.restaurantName?.includes('Biryani') ? 'Biryani' : 'North Indian',
      offer: '60% OFF\\nUPTO ₹120',
      image: r.documents?.profilePhotoUrl || 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80'
    }));

    // 3. Fast Delivery List
    if (fastDeliveryItems.length > 0) {
      widgets.push({
        id: 'restaurants_1',
        type: 'restaurant_horizontal_list',
        title: 'Fast delivery',
        items: fastDeliveryItems
      });
    }

    res.json(widgets);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching feed', error: error.message });
  }
};
`;

if (!controllerContent.includes('getDynamicFeed')) {
  controllerContent = controllerContent + "\n" + feedController;
  fs.writeFileSync(controllerFile, controllerContent);
}

// 2. Update Routes
const routesFile = '/Users/apple/MS Happido/backend/src/routes/restaurantRoutes.ts';
let routesContent = fs.readFileSync(routesFile, 'utf8');

if (!routesContent.includes('/feed')) {
  routesContent = routesContent.replace("import { getRestaurants, getRestaurantById", "import { getRestaurants, getRestaurantById, getDynamicFeed");
  routesContent = routesContent.replace("router.get('/', getRestaurants);", "router.get('/feed', getDynamicFeed);\nrouter.get('/', getRestaurants);");
  fs.writeFileSync(routesFile, routesContent);
}

console.log('Backend feed created');
