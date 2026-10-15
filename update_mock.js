const fs = require('fs');
const file = '/Users/apple/MS Happido/apps/customer/src/utils/mockSwiggyFeed.ts';
const content = `import { getDishImageUrl } from './foodImages';

export const MOCK_SWIGGY_FEED = [
  {
    id: 'header_1',
    type: 'theme_header',
    title: 'Ganesh Chaturthi',
    backgroundColor: '#8E0038',
  },
  {
    id: 'categories_1',
    type: 'quick_categories',
    items: [
      { id: 'c1', title: 'Festive\\nSweets', image: getDishImageUrl('Sweets', 'Desserts') },
      { id: 'c2', title: 'Get\\n70% OFF', image: getDishImageUrl('Discount', 'Pizza') },
      { id: 'c3', title: 'Pure-Veg\\nDelights', image: getDishImageUrl('Veg', 'Salad') },
      { id: 'c4', title: 'Delightful\\nOffers', image: getDishImageUrl('Offers', 'Burger') }
    ]
  },
  {
    id: 'restaurants_1',
    type: 'restaurant_horizontal_list',
    title: 'Fast delivery',
    items: [
      {
        id: 'r1',
        name: 'Dum Safar Biryani',
        rating: '3.9',
        time: '15-20 mins',
        cuisine: 'Biryani',
        offer: '60% OFF\\nUPTO ₹120',
        image: getDishImageUrl('Safar', 'Biryani')
      },
      {
        id: 'r2',
        name: 'Andhra Spice',
        rating: '4.2',
        time: '25-30 mins',
        cuisine: 'Arabian',
        offer: '70% OFF\\nUPTO ₹140',
        image: getDishImageUrl('Spice', 'Arabian')
      },
      {
        id: 'r3',
        name: 'Barbeque Nation',
        rating: '4.0',
        time: '25-30 mins',
        cuisine: 'North Indian',
        offer: '70% OFF\\nUPTO ₹140',
        image: getDishImageUrl('BBQ', 'North Indian')
      }
    ]
  }
];
`;
fs.writeFileSync(file, content);
console.log('Mock updated');
