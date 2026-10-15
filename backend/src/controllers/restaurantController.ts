
import { Request, Response } from 'express';
import User from '../models/User';
import Restaurant from '../models/Restaurant';

// ... other methods ...

export const registerRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantData = req.body;
    if (!restaurantData.restaurantName || !restaurantData.phone) {
      return res.status(400).json({ message: 'Restaurant name and phone are required' });
    }

    res.status(400).json({ message: 'Please use the main authentication endpoint for registration' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering restaurant', error: error.message });
  }
};

const isRestaurantClosed = (operations: any): boolean => {
  if (!operations?.operatingHours) return false;
  
  const { openTime, closeTime, daysOff } = operations.operatingHours;
  
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  
  if (daysOff && daysOff.includes(currentDay)) {
    return true;
  }
  
  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;
    return hours * 60 + (minutes || 0);
  };
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMins = parseTime(openTime || '10:00 AM');
  const closeMins = parseTime(closeTime || '10:00 PM');
  
  if (closeMins < openMins) {
    if (currentMinutes >= openMins || currentMinutes <= closeMins) return false;
  } else {
    if (currentMinutes >= openMins && currentMinutes <= closeMins) return false;
  }
  
  return true;
};

export const getDynamicFeed = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const tab = (req.query.tab as string) || 'ALL';
    const search = (req.query.search as string) || '';
    const veg = req.query.veg === 'true';
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : null;
    const sort = (req.query.sort as string) || 'relevance';
    const filters = (req.query.filter as string) ? (req.query.filter as string).split(',') : [];

    const widgets = [];

    // 1. Theme Header (Dark Purple for modern look)
    widgets.push({
      id: 'header_1',
      type: 'theme_header',
      backgroundColor: '#FFFFFF',
      bannerText: 'FOODIE VERSE',
    });

    if ((tab === 'ALL' || tab === 'OFFERS') && !search && !maxPrice) {
      // 2. Tall Offers List (Horizontal scroll of deals overlapping header)
      widgets.push({
        id: 'tall_offers_1',
        type: 'tall_offers_list',
        items: [
          { id: 't1', title: 'Deal\nFeast', subtitle: 'GET\n70%\nOFF', bgColor: '#EA580C', image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80' },
          { id: 't2', title: 'Get A\nFree Treat', subtitle: 'CUPCAKES', bgColor: '#F97316', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80' },
          { id: 't3', title: 'Flat ₹200 OFF\n& More', subtitle: 'CASHBACK', bgColor: '#FB923C', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' }
        ]
      });
    }

    if (tab === 'ALL' && !search && !maxPrice) {
      // 3. Circular Categories (Horizontal scroll)
      widgets.push({
        id: 'circular_categories_1',
        type: 'circular_categories',
        items: [
          { id: 'c1', title: 'Biryani', image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&q=80' },
          { id: 'c2', title: 'Dosa', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80' },
          { id: 'c3', title: 'Idli', image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&q=80' },
          { id: 'c4', title: 'Meals', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80' },
          { id: 'c5', title: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' }
        ]
      });
    }

    // 4. Filter Pills
    if (!search) {
      widgets.push({
        id: 'filter_pills_1',
        type: 'filter_pills',
        items: ['Filter', 'Sort by']
      });
    }

    // Fetch actual restaurants from DB based on location
    const query: any = {};
    if (!isNaN(lat) && !isNaN(lng)) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 3000 // 3km strict radius for 20-min delivery
        }
      };
    }
    const restaurants = await Restaurant.find(query).limit(10);
    
    const placeholderImages = [
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&auto=format&fit=crop&q=80'
    ];

    const restaurantItems = restaurants.map((r, index) => {
      const distance = (1.2 + (index * 0.7)).toFixed(1);
      
      const hasVeg = r.menu?.some((item: any) => item.isVeg || item.type === 'Pure Veg') || false;
      const isPureVeg = r.menu?.every((item: any) => item.isVeg || item.type === 'Pure Veg') || false;
      let cuisine = r.name?.includes('Biryani') ? 'Biryani' : 'North Indian';
      if (isPureVeg) cuisine = 'Pure Veg';

      const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const activePromo = r.promotions?.find((p: any) => {
        if (!p.isActive) return false;
        if (p.startDate && p.startDate > today) return false;
        if (p.endDate && p.endDate < today) return false;
        return true;
      });

      const offerStr = activePromo ? activePromo.discount.replace(' up to ', '\nUPTO ') : (tab === 'OFFERS' ? 'FLAT ₹150 OFF' : '');
      const promoTag = activePromo ? activePromo.tag : '';

      return {
        id: r._id,
        name: r.name,
        rating: (4.0 + (index % 10) * 0.1).toFixed(1), // Dynamic rating between 4.0 and 4.9
        ratingCount: Math.floor(Math.random() * 500) + 50,
        time: `${(r.operations?.defaultPrepTime || 20) + (r.operations?.isRushMode ? 15 : 0) + Math.ceil(parseFloat(distance) * 5)} mins`,
        isClosed: isRestaurantClosed(r.operations),
        distance: distance, // Keep as number for sorting
        distanceStr: `${distance} km`,
        cuisine: cuisine,
        offer: offerStr,
        promoTag: promoTag,
        originalPrice: '₹300',
        discountPrice: 99 + (index * 20), // Dynamic price for sorting
        image: r.imageUrl || placeholderImages[index % placeholderImages.length],
        isVeg: hasVeg
      };
    }).filter(r => {
      if (veg && !r.isVeg) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.cuisine.toLowerCase().includes(search.toLowerCase())) return false;
      
      // Apply filters
      if (filters.length > 0) {
        const ratingFilters = filters.filter(f => f.startsWith('Ratings'));
        const cuisineFilters = filters.filter(f => !f.startsWith('Ratings'));
        
        if (ratingFilters.length > 0) {
          const minRating = parseFloat(ratingFilters[0].replace('Ratings ', '').replace('+', ''));
          if (parseFloat(r.rating) < minRating) return false;
        }
        
        if (cuisineFilters.length > 0) {
          if (!cuisineFilters.includes(r.cuisine) && !cuisineFilters.some(f => r.cuisine.includes(f))) {
            return false;
          }
        }
      }
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      switch (sort) {
        case 'rating': return parseFloat(b.rating) - parseFloat(a.rating);
        case 'time': return parseFloat(a.distance as string) - parseFloat(b.distance as string);
        case 'cost_asc': return a.discountPrice - b.discountPrice;
        case 'cost_desc': return b.discountPrice - a.discountPrice;
        case 'relevance':
        default:
          return 0; // Keep original order
      }
    }).map(r => ({
      ...r,
      distance: r.distanceStr,
      discountPrice: `₹${r.discountPrice}`
    }));

    if (maxPrice) {
      const dishItems: any[] = [];
      
      // Get the IDs of restaurants that survived the filter
      const validRestaurantIds = new Set(restaurantItems.map(ri => ri.id.toString()));
      
      restaurants.forEach(r => {
        if (!validRestaurantIds.has(r._id.toString())) return;
        
        if (veg && r.menu?.every((m: any) => !m.isVeg && m.type !== 'Pure Veg')) return;
        r.menu?.forEach((item: any) => {
          // If maxPrice is 49, specifically filter for Quick49 items
          const isValidPrice = maxPrice === 49 ? item.isQuick49Item : item.price <= maxPrice;

          if (isValidPrice) {
            if (veg && !item.isVeg && item.type !== 'Pure Veg') return;
            dishItems.push({
              id: item._id?.toString() || Math.random().toString(),
              name: item.name || item.itemName,
              price: item.price,
              image: item.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80`,
              restaurantName: r.name,
              restaurantId: r._id,
              isVeg: item.isVeg || item.type === 'Pure Veg',
              isQuick49Item: item.isQuick49Item
            });
          }
        });
      });
      
      if (dishItems.length > 0) {
        widgets.push({
          id: `dish_grid_1`,
          type: 'dish_grid',
          title: maxPrice === 49 ? `₹49 Quick Store (20 Min)` : `Everything Under ₹${maxPrice}`,
          subtitle: maxPrice === 49 ? 'Instant delivery within 3km' : 'Steal deals near you',
          items: dishItems.sort(() => 0.5 - Math.random()).slice(0, 15) // Shuffle and limit
        });
      }
    } else if (restaurantItems.length > 0) {
      if (tab === 'OFFERS' || tab === 'STORE') {
        widgets.push({
          id: `restaurants_horizontal_${tab}`,
          type: 'restaurant_horizontal_list',
          title: tab === 'STORE' ? 'Premium Stores Near You' : 'Mega Discounts',
          items: restaurantItems.slice(0, 5)
        });
      }

      widgets.push({
        id: `restaurants_vertical_${tab}`,
        type: 'restaurant_vertical_list',
        title: search ? 'Search Results' : 'Restaurants to explore',
        subtitle: search ? `Showing results for "${search}"` : 'Featured Restaurants',
        items: restaurantItems
      });
    }

    res.json(widgets);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching feed', error: error.message });
  }
};


export const getQuick49Items = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Valid lat and lng are required' });
    }

    // 1. Find restaurants within strict 3km radius
    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 3000 // 3km strict radius for Quick49 delivery
        }
      }
    });

    // 2. Filter for items marked as isQuick49Item
    const quickItems: any[] = [];
    restaurants.forEach(r => {
      if (r.menu) {
        r.menu.forEach((item: any) => {
          if (item.isQuick49Item && item.isAvailable) {
            quickItems.push({
              id: item._id?.toString() || Math.random().toString(),
              name: item.name || item.itemName,
              price: item.price,
              image: item.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80`,
              restaurantName: r.name,
              restaurantId: r._id,
              isVeg: item.isVeg || item.type === 'Pure Veg'
            });
          }
        });
      }
    });

    res.json(quickItems);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching quick 49 items', error: error.message });
  }
};

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    
    const query: any = {};
    if (!isNaN(lat) && !isNaN(lng)) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 3000 // 3km max radius
        }
      };
    }
    const restaurants = await Restaurant.find(query);
    res.json(restaurants);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
  }
};

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching restaurant details', error: error.message });
  }
};

export const getMyMenu = async (req: any, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json(restaurant.menu || []);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
};

export const addMenuItem = async (req: any, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    restaurant.menu.push(req.body);
    await restaurant.save();
    res.status(201).json({ message: 'Item added', menu: restaurant.menu });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding item', error: error.message });
  }
};

export const bulkAddMenuItems = async (req: any, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    restaurant.menu.push(...req.body.items);
    await restaurant.save();
    res.status(201).json({ message: 'Items added bulk', menu: restaurant.menu });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding items', error: error.message });
  }
};

export const updateMenuItem = async (req: any, res: Response) => {
  try {
    const updateFields: any = {};
    if (req.body.name) updateFields['menu.$.name'] = req.body.name;
    if (req.body.description !== undefined) updateFields['menu.$.description'] = req.body.description;
    if (req.body.price !== undefined) updateFields['menu.$.price'] = req.body.price;
    if (req.body.imageUrl !== undefined) updateFields['menu.$.imageUrl'] = req.body.imageUrl;
    if (req.body.isAvailable !== undefined) updateFields['menu.$.isAvailable'] = req.body.isAvailable;
    if (req.body.category) updateFields['menu.$.category'] = req.body.category;
    if (req.body.isVeg !== undefined) updateFields['menu.$.isVeg'] = req.body.isVeg;
    if (req.body.isRecommended !== undefined) updateFields['menu.$.isRecommended'] = req.body.isRecommended;

    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id, 'menu._id': req.params.itemId },
      { $set: updateFields },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item updated', menu: restaurant.menu });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};

export const deleteMenuItem = async (req: any, res: Response) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id },
      { $pull: { menu: { _id: req.params.itemId } } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Item deleted', menu: restaurant.menu });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};

export const updateAdSettings = async (req: any, res: Response) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id },
      { $set: { adSettings: req.body } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Ads settings updated', adSettings: restaurant.adSettings });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating ads', error: error.message });
  }
};

export const addPromotion = async (req: any, res: Response) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id },
      { $push: { promotions: req.body } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Promotion added', promotions: restaurant.promotions });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding promotion', error: error.message });
  }
};

export const updatePromotion = async (req: any, res: Response) => {
  try {
    const updateFields: any = {};
    if (req.body.code !== undefined) updateFields['promotions.$.code'] = req.body.code;
    if (req.body.title !== undefined) updateFields['promotions.$.title'] = req.body.title;
    if (req.body.discount !== undefined) updateFields['promotions.$.discount'] = req.body.discount;
    if (req.body.minOrder !== undefined) updateFields['promotions.$.minOrder'] = req.body.minOrder;
    if (req.body.isActive !== undefined) updateFields['promotions.$.isActive'] = req.body.isActive;
    if (req.body.tag !== undefined) updateFields['promotions.$.tag'] = req.body.tag;
    if (req.body.startDate !== undefined) updateFields['promotions.$.startDate'] = req.body.startDate;
    if (req.body.endDate !== undefined) updateFields['promotions.$.endDate'] = req.body.endDate;

    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id, 'promotions._id': req.params.promoId },
      { $set: updateFields },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Promotion not found' });
    res.json({ message: 'Promotion updated', promotions: restaurant.promotions });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating promotion', error: error.message });
  }
};

export const deletePromotion = async (req: any, res: Response) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id },
      { $pull: { promotions: { _id: req.params.promoId } } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Promotion deleted', promotions: restaurant.promotions });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting promotion', error: error.message });
  }
};
