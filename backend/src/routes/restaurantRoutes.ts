import express from 'express';
import {
  getRestaurants,
  getRestaurantById,
  getMyMenu,
  addMenuItem,
  bulkAddMenuItems,
  updateMenuItem,
  deleteMenuItem,
  getDynamicFeed,
  getQuick49Items,
  updateAdSettings,
  addPromotion,
  updatePromotion,
  deletePromotion,
} from '../controllers/restaurantController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Restaurant Owner Menu Management
router.get('/menu', protect, getMyMenu);
router.post('/menu', protect, addMenuItem);
router.post('/menu/bulk', protect, bulkAddMenuItems);
router.put('/menu/:itemId', protect, updateMenuItem);
router.delete('/menu/:itemId', protect, deleteMenuItem);

// Marketing Management
router.put('/marketing/boost', protect, updateAdSettings);
router.post('/marketing/promotions', protect, addPromotion);
router.put('/marketing/promotions/:promoId', protect, updatePromotion);
router.delete('/marketing/promotions/:promoId', protect, deletePromotion);

// Public / Customer Restaurant routes
router.get('/feed', getDynamicFeed);
router.get('/quick49', protect, getQuick49Items);
router.get('/', protect, getRestaurants);
router.get('/:id', protect, getRestaurantById);

export default router;
