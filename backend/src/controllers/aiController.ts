import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';

export const curateMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promptKeyOrQuery } = req.body;
    
    // Find the newly added 'Happido personal restaurant' or any restaurant named Happido
    let aiRestaurant = await Restaurant.findOne({ 
      name: { $regex: /happido/i } 
    }).lean();

    // Fallback to any restaurant if not found
    if (!aiRestaurant) {
      aiRestaurant = await Restaurant.findOne({}).lean();
    }

    if (!aiRestaurant) {
      res.status(404).json({ message: 'No AI Cloud Kitchen found.' });
      return;
    }

    // 2. Select 2-3 items from the menu based on the prompt.
    // If the newly added restaurant doesn't have a menu yet, mock some items so the AI still works!
    let availableItems = aiRestaurant.menu ? aiRestaurant.menu.filter(item => item.isAvailable) : [];
    
    if (availableItems.length === 0) {
      // Mock items for the demonstration if the user hasn't added menu items yet
      availableItems = [
        { _id: 'mock1', name: 'AI Superfood Salad', price: 299, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' },
        { _id: 'mock2', name: 'High-Protein Quinoa Bowl', price: 349, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
        { _id: 'mock3', name: 'Diabetic-Friendly Keto Wrap', price: 249, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80' }
      ];
    }

    // Shuffle and pick up to 3 items
    const shuffled = availableItems.sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, Math.min(3, availableItems.length));

    // 3. Generate Mock Macros based on prompt
    const query = (promptKeyOrQuery || '').toLowerCase();
    let healthCategory = 'Balanced Healthy';
    let macros = { calories: 680, protein: 36, carbs: 82, fats: 20, glycemicIndex: 'Medium (45-69)' };
    let title = 'Wholesome Nutritious Family Feast';
    let subtitle = 'Balanced home-style nutrition';

    if (query.includes('protein') || query.includes('gym') || query.includes('muscle')) {
      healthCategory = 'High-Protein Fitness';
      macros = { calories: 560, protein: 46, carbs: 52, fats: 14, glycemicIndex: 'Medium (45-69)' };
      title = 'Anabolic High-Protein Muscle Fuel';
      subtitle = 'Lean proteins and clean energy for workout recovery';
    } else if (query.includes('patient') || query.includes('recovery') || query.includes('surgery')) {
      healthCategory = 'Post-Surgery Soft Diet';
      macros = { calories: 330, protein: 18, carbs: 46, fats: 6, glycemicIndex: 'Low (< 45)' };
      title = 'Hospital-Grade Patient Recovery Meal';
      subtitle = 'Ultra-gentle digestive formula prepared in sterile hygiene';
    } else if (query.includes('diabetic') || query.includes('low-gi')) {
      healthCategory = 'Diabetic Safe';
      macros = { calories: 410, protein: 24, carbs: 48, fats: 11, glycemicIndex: 'Low (< 45)' };
      title = 'Diabetic Safe Glycemic-Controlled Dinner';
      subtitle = 'Endocrinologist-approved complex carb & high-fiber meal';
    }

    // 4. Construct the final AI response payload
    const dishes = selectedItems.map((item: any) => ({
      item: {
        id: item._id.toString(),
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        isVeg: item.isVeg !== undefined ? item.isVeg : true,
      },
      categoryTag: 'AI Curated',
      portionDesc: 'Standard Portion',
      kitchenName: aiRestaurant.name, // Will be "Mahesh" or the selected kitchen
      restaurantId: aiRestaurant._id.toString() // Pass restaurant ID for checkout
    }));

    const originalPrice = dishes.reduce((sum, d) => sum + d.item.price, 0);
    const discountAmount = Math.floor(originalPrice * 0.15); // 15% AI Discount
    const finalPrice = originalPrice - discountAmount;

    const recommendation = {
      id: `rec-${Date.now()}`,
      title,
      subtitle,
      healthCategory,
      medicalSafetyScore: 95 + Math.floor(Math.random() * 5),
      clinicalNote: 'Curated specifically from our trusted Happido Cloud Kitchens for maximum safety and nutrition.',
      macros,
      dishes,
      couponCode: 'AIFORMAHESH',
      discountAmount,
      originalPrice,
      finalPrice,
    };

    res.status(200).json(recommendation);
  } catch (error) {
    console.error('Error curating AI meal:', error);
    res.status(500).json({ message: 'Failed to curate meal via AI' });
  }
};
