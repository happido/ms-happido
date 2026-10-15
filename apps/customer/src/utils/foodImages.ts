// Curated, high-resolution food image registry for Indian and international dishes

export const DEFAULT_FOOD_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

export const CUISINE_PHOTO_KEYWORDS: Array<{ keywords: string[]; url: string }> = [
  // Biryani & Rice
  {
    keywords: ['chicken dum biryani', 'chicken biryani', 'hyderabadi biryani'],
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['mutton biryani', 'gosht biryani'],
    url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['paneer biryani', 'veg biryani', 'pulao', 'fried rice'],
    url: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80',
  },

  // Curries & Gravies
  {
    keywords: ['butter chicken', 'murgh makhani', 'chicken curry', 'kodi kura'],
    url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['paneer butter masala', 'shahi paneer', 'kadai paneer', 'paneer'],
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['dal makhani', 'dal tadka', 'dal', 'lentil'],
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['mutton curry', 'rogan josh', 'gongura mutton'],
    url: 'https://images.unsplash.com/photo-1545247181-516773cae7be?w=600&auto=format&fit=crop&q=80',
  },

  // Starters & Kebabs
  {
    keywords: ['chicken 65', 'chilli chicken', 'crispy chicken'],
    url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['tandoori chicken', 'chicken tikka', 'kebab'],
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['paneer tikka', 'paneer 65'],
    url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['fish', 'apollo fish', 'prawn'],
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
  },

  // Breads
  {
    keywords: ['naan', 'garlic naan', 'butter naan', 'roti', 'paratha', 'kulcha', 'bread'],
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },

  // South Indian
  {
    keywords: ['dosa', 'masala dosa', 'ghee podi'],
    url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['idli', 'vada', 'sambar', 'tiffin', 'breakfast'],
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },

  // Fast Food & Pizza
  {
    keywords: ['pizza', 'margherita', 'bbq chicken pizza'],
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['burger', 'zinger', 'cheese burger'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['fries', 'peri peri fries', 'french fries'],
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['sandwich', 'panini', 'wrap'],
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
  },

  // Asian / Indo-Chinese
  {
    keywords: ['noodles', 'hakka', 'chowmein', 'ramen'],
    url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['momo', 'dumpling', 'dim sum'],
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['manchurian'],
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80',
  },

  // Bakery & Desserts
  {
    keywords: ['gulab jamun', 'sweet', 'double ka meetha', 'rasgulla', 'halwa'],
    url: 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['croissant', 'bakery', 'puff'],
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['cake', 'pastry', 'cheesecake', 'red velvet'],
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['brownie', 'muffin', 'waffle', 'chocolate'],
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
  },

  // Beverages & Shakes
  {
    keywords: ['coffee', 'latte', 'cappuccino', 'cold coffee'],
    url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['shake', 'thickshake', 'smoothie'],
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['lassi', 'mango lassi'],
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['tea', 'chai', 'filter coffee'],
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  },

  // Thali / Combos
  {
    keywords: ['thali', 'combo', 'feast', 'meal'],
    url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
  },
  // Soups
  {
    keywords: ['soup', 'shorba', 'hot & sour', 'manchow', 'sweet corn'],
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
  },
];

export const CATEGORY_FALLBACKS: Record<string, string> = {
  'Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  'Main Course': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
  'Starters': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  'Breads': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'Breakfast': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
  'Desserts': 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=600&auto=format&fit=crop&q=80',
  'Beverages': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
  'Combos & Thalis': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
  'Soups': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
};

/**
 * Resolves a food image URL:
 * 1. Returns explicitUrl if provided and valid.
 * 2. Matches keywords in dishName.
 * 3. Falls back to category image.
 * 4. Falls back to default food image.
 */
export function getDishImageUrl(dishName?: string, category?: string, explicitUrl?: string): string {
  if (explicitUrl && explicitUrl.trim().startsWith('http')) {
    return explicitUrl.trim();
  }

  const nameLower = (dishName || '').toLowerCase();
  for (const entry of CUISINE_PHOTO_KEYWORDS) {
    for (const kw of entry.keywords) {
      if (nameLower.includes(kw)) {
        return entry.url;
      }
    }
  }

  if (category && CATEGORY_FALLBACKS[category]) {
    return CATEGORY_FALLBACKS[category];
  }

  return DEFAULT_FOOD_IMAGE;
}
