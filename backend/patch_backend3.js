const fs = require('fs');

const oldContent = fs.readFileSync('src/controllers/restaurantController.ts', 'utf8');

const additionalMethods = `

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await User.find({ role: 'restaurant', isVerified: true }).select('-password');
    res.json(restaurants);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
  }
};

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const restaurant = await User.findById(req.params.id).select('-password');
    if (!restaurant || restaurant.role !== 'restaurant') {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching restaurant details', error: error.message });
  }
};

export const getMyMenu = async (req: any, res: Response) => {
  try {
    const restaurant = await User.findById(req.user._id);
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json(restaurant.menu || []);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
};

export const addMenuItem = async (req: any, res: Response) => {
  try {
    const restaurant = await User.findById(req.user._id);
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
    const restaurant = await User.findById(req.user._id);
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    restaurant.menu = [...(restaurant.menu || []), ...req.body.items];
    await restaurant.save();
    res.status(201).json({ message: 'Items added bulk', menu: restaurant.menu });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding items', error: error.message });
  }
};

export const updateMenuItem = async (req: any, res: Response) => {
  try {
    const restaurant = await User.findOneAndUpdate(
      { _id: req.user._id, 'menu._id': req.params.itemId },
      { $set: { 'menu.$': req.body } },
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
    const restaurant = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { menu: { _id: req.params.itemId } } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Item deleted', menu: restaurant.menu });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};
`;

let newContent = oldContent.replace(`import { User } from '../models/User';`, `import User from '../models/User';`);
newContent = newContent.replace(`import { Item } from '../models/Item';\n`, '');

fs.writeFileSync('src/controllers/restaurantController.ts', newContent + additionalMethods);
