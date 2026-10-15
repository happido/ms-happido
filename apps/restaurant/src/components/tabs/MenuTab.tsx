import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { getDishImageUrl } from '../../utils/foodImages';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  isVeg: boolean;
  isRecommended?: boolean;
  description?: string;
  imageUrl?: string;
}

export const CATEGORIES = [
  'Combos & Thalis',
  'Biryani',
  'Starters',
  'Main Course',
  'Breads',
  'Breakfast',
  'Desserts',
  'Beverages',
  'Soups',
];

export interface ComboPreset {
  id: string;
  title: string;
  badge: string;
  items: string[];
  mrp: number;
  comboPrice: number;
  isVeg: boolean;
  tag: string;
  gradient: [string, string];
  imageUrl?: string;
}

export const COMBO_PRESETS: ComboPreset[] = [
  {
    id: 'c1',
    title: 'Hyderabadi Biryani Mega Feast Combo',
    badge: 'BESTSELLER',
    items: ['1x Hyderabadi Chicken Dum Biryani', '1x Mirchi Ka Salan & Raita', '1x Thums Up (750ml)'],
    mrp: 410,
    comboPrice: 349,
    isVeg: false,
    tag: 'Save ₹61 (15% OFF)',
    gradient: ['#F97316', '#D4AF37'],
  },
  {
    id: 'c2',
    title: 'North Indian Deluxe Thali Combo',
    badge: 'POPULAR',
    items: ['1x Paneer Butter Masala', '2x Butter Naan', '1x Dal Makhani', '1x Gulab Jamun (2 pcs)'],
    mrp: 460,
    comboPrice: 389,
    isVeg: true,
    tag: 'Save ₹71 (16% OFF)',
    gradient: ['#10B981', '#059669'],
  },
  {
    id: 'c3',
    title: 'South Indian Royal Breakfast Combo',
    badge: 'MORNING HIT',
    items: ['2x Ghee Podi Masala Dosa', '2x Steamed Idli', '1x Medu Vada', '1x Filter Coffee'],
    mrp: 260,
    comboPrice: 219,
    isVeg: true,
    tag: 'Save ₹41 (16% OFF)',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    id: 'c4',
    title: 'Weekend Fast Food Snack Combo',
    badge: 'PARTY PACK',
    items: ['1x Crispy Zinger Chicken Burger', '1x Peri Peri Fries (Large)', '1x Cold Beverage'],
    mrp: 330,
    comboPrice: 279,
    isVeg: false,
    tag: 'Save ₹51 (15% OFF)',
    gradient: ['#DB2777', '#BE185D'],
  },
];

export interface BulkPreset {
  id: string;
  title: string;
  cuisine: string;
  icon: any;
  gradient: [string, string];
  tag: string;
  items: Array<{
    itemName: string;
    price: number;
    category: string;
    isVeg: boolean;
    description: string;
  }>;
}

export const BULK_PRESETS: BulkPreset[] = [
  {
    id: 'biryani_delights',
    title: 'Hyderabadi Biryani & Kebabs',
    cuisine: 'Mughlai & Andhra',
    icon: 'flame',
    gradient: ['#F97316', '#D4AF37'],
    tag: '8 Bestsellers',
    items: [
      { itemName: 'Hyderabadi Chicken Dum Biryani', price: 290, category: 'Biryani', isVeg: false, description: 'Long grain aromatic basmati rice layered with spiced marinated chicken and saffron.' },
      { itemName: 'Special Mutton Dum Biryani', price: 380, category: 'Biryani', isVeg: false, description: 'Tender slow cooked mutton pieces infused with whole garam masala and mint.' },
      { itemName: 'Shahi Paneer Dum Biryani', price: 240, category: 'Biryani', isVeg: true, description: 'Fragrant basmati rice cooked with fresh paneer cubes and caramelized onions.' },
      { itemName: 'Chicken 65 Andhra Spicy (Dry)', price: 230, category: 'Starters', isVeg: false, description: 'Crispy fried chicken chunks tossed with curry leaves, crushed pepper & green chilies.' },
      { itemName: 'Paneer 65 Crispy Fry', price: 210, category: 'Starters', isVeg: true, description: 'Golden batter fried cottage cheese cubes tossed in spicy yogurt tempering.' },
      { itemName: 'Apollo Fish Tikka', price: 290, category: 'Starters', isVeg: false, description: 'Boneless fish fillets marinated in spiced red masala and pan-fried to perfection.' },
      { itemName: 'Double Ka Meetha', price: 110, category: 'Desserts', isVeg: true, description: 'Classic Hyderabadi bread pudding soaked in saffron cardamom rabri.' },
      { itemName: 'Mirchi Ka Salan & Mint Raita', price: 50, category: 'Starters', isVeg: true, description: 'Authentic peanut sesame coconut curry paired with cool whipped mint yogurt.' },
    ],
  },
  {
    id: 'south_indian',
    title: 'South Indian Tiffin & Traditional Meals',
    cuisine: 'Andhra & Tamil Nadu',
    icon: 'sunny',
    gradient: ['#10B981', '#059669'],
    tag: '8 Bestsellers',
    items: [
      { itemName: 'Ghee Podi Masala Dosa', price: 110, category: 'Breakfast', isVeg: true, description: 'Crispy golden dosa roasted in desi ghee, dusted with spicy gun powder & potato masala.' },
      { itemName: 'Steamed Button Ghee Idli (4 Pcs)', price: 75, category: 'Breakfast', isVeg: true, description: 'Melt-in-mouth soft rice cakes topped with melted ghee, served with sambar & 3 chutneys.' },
      { itemName: 'Medu Vada Crispy (2 Pcs)', price: 70, category: 'Breakfast', isVeg: true, description: 'Crispy deep fried lentil donuts with crushed peppercorns and curry leaves.' },
      { itemName: 'Andhra Chicken Curry (Kodi Kura)', price: 260, category: 'Main Course', isVeg: false, description: 'Homestyle spicy Andhra country chicken curry made with poppy seeds and roasted spices.' },
      { itemName: 'Gongura Mutton Curry', price: 350, category: 'Main Course', isVeg: false, description: 'Traditional Andhra delicacy of tender mutton simmered in tangy sorrel leaves.' },
      { itemName: 'South Indian Deluxe Veg Thali', price: 180, category: 'Main Course', isVeg: true, description: 'Rice, Sambar, Rasam, 2 Sabzi, Curd, Papad, Pickle and sweet of the day.' },
      { itemName: 'Filter Coffee Tumbler', price: 45, category: 'Beverages', isVeg: true, description: 'Freshly brewed aromatic chicory blend frothed with thick full-cream milk.' },
      { itemName: 'Chilled Sweet Lassi', price: 65, category: 'Beverages', isVeg: true, description: 'Thick whipped yogurt beverage with crushed cardamom and malai.' },
    ],
  },
  {
    id: 'north_indian',
    title: 'North Indian Curries & Tandoor Breads',
    cuisine: 'Punjabi & Mughlai',
    icon: 'restaurant',
    gradient: ['#8B5CF6', '#7C3AED'],
    tag: '8 Bestsellers',
    items: [
      { itemName: 'Butter Chicken (Murgh Makhani)', price: 320, category: 'Main Course', isVeg: false, description: 'Shredded tandoori chicken cooked in silky smooth tomato, butter and cashew gravy.' },
      { itemName: 'Paneer Butter Masala', price: 250, category: 'Main Course', isVeg: true, description: 'Succulent cottage cheese cubes simmered in velvety butter gravy with kasuri methi.' },
      { itemName: 'Dal Makhani Slow-Cooked', price: 200, category: 'Main Course', isVeg: true, description: 'Black lentils & kidney beans slow cooked overnight on charcoal with rich white butter.' },
      { itemName: 'Tandoori Chicken Half (4 Pcs)', price: 260, category: 'Starters', isVeg: false, description: 'Clay oven roasted chicken legs steeped in hung curd, Kashmiri deggi mirch and spices.' },
      { itemName: 'Paneer Tikka Angara', price: 230, category: 'Starters', isVeg: true, description: 'Smoky grilled paneer cubes, capsicum and onions marinated in mustard oil marinade.' },
      { itemName: 'Garlic Butter Naan', price: 60, category: 'Breads', isVeg: true, description: 'Hand-stretched leavened tandoor bread brushed with melted butter and roasted garlic.' },
      { itemName: 'Tandoori Roti (Butter)', price: 30, category: 'Breads', isVeg: true, description: 'Whole wheat flatbread cooked in clay tandoor oven.' },
      { itemName: 'Gulab Jamun (2 Pcs)', price: 80, category: 'Desserts', isVeg: true, description: 'Hot khoya dumplings soaked in rose water and cardamom sugar syrup.' },
    ],
  },
  {
    id: 'cafe_fastfood',
    title: 'Burgers, Pizza & Cafe Shakes',
    cuisine: 'Fast Food & Snacks',
    icon: 'pizza',
    gradient: ['#EC4899', '#DB2777'],
    tag: '8 Bestsellers',
    items: [
      { itemName: 'Crispy Zinger Chicken Burger', price: 180, category: 'Starters', isVeg: false, description: 'Spicy crunchy fried chicken fillet topped with thousand island mayo & shredded lettuce.' },
      { itemName: 'Veggie Supreme Cheese Burger', price: 140, category: 'Starters', isVeg: true, description: 'Herb spiced vegetable patty layered with cheddar cheese slice and garlic sauce.' },
      { itemName: 'Peri Peri French Fries (Large)', price: 110, category: 'Starters', isVeg: true, description: 'Golden crispy potato fries tossed with zesty African bird’s eye chili seasoning.' },
      { itemName: 'Classic Margherita Cheese Pizza', price: 260, category: 'Main Course', isVeg: true, description: 'San Marzano herb tomato sauce topped with 100% mozzarella cheese and basil.' },
      { itemName: 'BBQ Chicken Loaded Pizza', price: 340, category: 'Main Course', isVeg: false, description: 'Smoky BBQ chicken chunks, caramelized onions, jalapeños and melted cheese blend.' },
      { itemName: 'Belgian Chocolate Thickshake', price: 130, category: 'Beverages', isVeg: true, description: 'Creamy thick shake made with rich Belgian dark chocolate gelato.' },
      { itemName: 'Cold Coffee with Choco Ice Cream', price: 120, category: 'Beverages', isVeg: true, description: 'Blended espresso cold milk topped with a scoop of vanilla cream & cocoa powder.' },
      { itemName: 'Sizzling Chocolate Brownie', price: 150, category: 'Desserts', isVeg: true, description: 'Warm fudgy walnut brownie served with vanilla scoop and hot chocolate fudge.' },
    ],
  },
  {
    id: 'indo_chinese',
    title: 'Indo-Chinese & Asian Wok',
    cuisine: 'Asian Street Food',
    icon: 'flame',
    gradient: ['#EF4444', '#B91C1C'],
    tag: '6 Bestsellers',
    items: [
      { itemName: 'Veg Hakka Noodles', price: 160, category: 'Main Course', isVeg: true, description: 'Wok tossed noodles with crunchy cabbage, bell peppers and scallions.' },
      { itemName: 'Chilli Chicken Dry', price: 230, category: 'Starters', isVeg: false, description: 'Crispy chicken bites tossed with green chilies, garlic and dark soy.' },
      { itemName: 'Veg Manchurian Gravy', price: 190, category: 'Main Course', isVeg: true, description: 'Fried vegetable dumplings in savory coriander garlic sauce.' },
      { itemName: 'Egg Fried Rice', price: 180, category: 'Main Course', isVeg: false, description: 'Aromatic wok tossed rice with scrambled farm eggs and spring onions.' },
      { itemName: 'Steamed Chicken Momos (6 Pcs)', price: 150, category: 'Starters', isVeg: false, description: 'Juicy Himalayan dumplings with spicy red sesame chutney.' },
      { itemName: 'Paneer Chilli Gravy', price: 220, category: 'Main Course', isVeg: true, description: 'Cottage cheese cubes tossed in spicy soy-garlic gravy.' },
    ],
  },
  {
    id: 'bakery_cafe',
    title: 'Artisan Bakery & Desserts',
    cuisine: 'Bakery & Cafe',
    icon: 'cafe',
    gradient: ['#D97706', '#92400E'],
    tag: '6 Bestsellers',
    items: [
      { itemName: 'Butter Croissant Flaky', price: 120, category: 'Starters', isVeg: true, description: 'Golden French laminated pastry baked with pure butter.' },
      { itemName: 'Red Velvet Cream Cheese Pastry', price: 140, category: 'Desserts', isVeg: true, description: 'Moist cocoa crimson sponge layered with vanilla cream cheese frosting.' },
      { itemName: 'New York Baked Cheesecake', price: 180, category: 'Desserts', isVeg: true, description: 'Dense rich cheesecake slice on buttery graham cracker crust.' },
      { itemName: 'Iced Spanish Latte', price: 160, category: 'Beverages', isVeg: true, description: 'Double shot espresso sweetened with condensed milk over ice.' },
      { itemName: 'Double Choco Chip Muffin', price: 95, category: 'Desserts', isVeg: true, description: 'Soft chocolate sponge studded with dark Belgian chocolate chunks.' },
      { itemName: 'Grilled Cheese Corn Panini', price: 170, category: 'Starters', isVeg: true, description: 'Pressed sourdough bread with melted mozzarella, cheddar and sweet corn.' },
    ],
  },
];

export interface QuickBatchRow {
  id: string;
  name: string;
  category: string;
  price: string;
  isVeg: boolean;
}

export const SAMPLE_BULK_CSV = `Hyderabadi Chicken Dum Biryani, 280, Non-Veg, Biryani, Tender chicken with long grain basmati rice & saffron
Special Mutton Dum Biryani, 380, Non-Veg, Biryani, Slow cooked tender mutton with whole spices
Paneer Butter Masala, 240, Veg, Main Course, Fresh cottage cheese in rich tomato butter gravy
Dal Makhani, 190, Veg, Main Course, Slow-cooked black lentils with white butter
Chicken 65 Andhra Style, 230, Non-Veg, Starters, Crispy fried chicken chunks with curry leaves
Paneer Tikka Angara, 220, Veg, Starters, Charcoal grilled spiced cottage cheese
Butter Garlic Naan, 55, Veg, Breads, Clay oven baked flatbread with roasted garlic & butter
Tandoori Roti, 30, Veg, Breads, Traditional whole wheat tandoor roti
Gulab Jamun (2 Pcs), 80, Veg, Desserts, Warm khoya dumplings in cardamom rose syrup
Double Ka Meetha, 110, Veg, Desserts, Classic Hyderabadi bread pudding with saffron rabri
Thick Mango Lassi, 75, Veg, Beverages, Chilled whipped yogurt with sweet Alphonso mango pulp
South Indian Filter Coffee, 45, Veg, Beverages, Freshly brewed chicory coffee with frothy milk`;

export const parseBulkCsv = (text: string) => {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const items: Array<{
    itemName: string;
    category: string;
    price: number;
    isVeg: boolean;
    description: string;
    isAvailable: boolean;
    imageUrl?: string;
  }> = [];

  for (const line of lines) {
    if (line.toLowerCase().startsWith('name') || line.toLowerCase().startsWith('item name')) {
      continue;
    }
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length >= 3) {
      const itemName = parts[0];
      const category = parts[1] || 'Main Course';
      const price = Number(parts[2]?.replace(/[^0-9.]/g, '')) || 0;
      const typeStr = (parts[3] || '').toLowerCase();
      const isVeg = !(typeStr.includes('non') || typeStr.includes('chicken') || typeStr.includes('mutton') || typeStr.includes('fish') || typeStr.includes('seafood') || typeStr.includes('egg'));
      const description = parts[4] || '';
      const isAvailable = (parts[5] || '').toLowerCase() === 'no' ? false : true;
      const imageUrl = parts[6] || undefined;

      if (itemName && price > 0) {
        items.push({ itemName, category, price, isVeg, description, isAvailable, imageUrl });
      }
    }
  }
  return items;
};

interface Props {
  menuItems: MenuItem[];
  onToggleStock: (id: string, currentAvailable: boolean) => void;
  onDeleteDish: (id: string, name: string) => void;
  onAddNewDish: (dish: any) => Promise<void>;
  onEditDish?: (id: string, dish: any) => Promise<void>;
  onBulkImport: (items: any[], replace: boolean) => Promise<void>;
  initialSubView?: 'list' | 'combos' | 'add' | 'bulk';
  restaurantName?: string;
  restaurantImageUrl?: string;
}

export default function MenuTab({
  menuItems,
  onToggleStock,
  onDeleteDish,
  onAddNewDish,
  onEditDish,
  onBulkImport,
  initialSubView = 'list',
  restaurantName = 'Happido Kitchen (You)',
  restaurantImageUrl,
}: Props) {
  const [subView, setSubView] = useState<'list' | 'add' | 'preview'>(initialSubView === 'add' ? 'add' : 'list');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Dish state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [isVeg, setIsVeg] = useState(true);
  const [desc, setDesc] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);

  // Combos state
  const [comboLoadingId, setComboLoadingId] = useState<string | null>(null);
  const [customComboName, setCustomComboName] = useState('');
  const [customComboItems, setCustomComboItems] = useState('');
  const [customComboPrice, setCustomComboPrice] = useState('');
  const [customComboVeg, setCustomComboVeg] = useState(true);

  // Bulk Studio State
  const [addMode, setAddMode] = useState<'single' | 'upload' | 'scan'>('single');
  const [scanImageUri, setScanImageUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [batchRows, setBatchRows] = useState<QuickBatchRow[]>([
    { id: '1', name: '', category: 'Main Course', price: '', isVeg: true },
    { id: '2', name: '', category: 'Starters', price: '', isVeg: false },
    { id: '3', name: '', category: 'Beverages', price: '', isVeg: true },
    { id: '4', name: '', category: 'Desserts', price: '', isVeg: true },
  ]);
  const [bulkCsv, setBulkCsv] = useState('');
  const [bulkReplace, setBulkReplace] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [selectedCuisineFilter, setSelectedCuisineFilter] = useState('All');
  const [presetItemToggles, setPresetItemToggles] = useState<{ [key: string]: boolean }>({});
  const [presetCustomPrices, setPresetCustomPrices] = useState<{ [key: string]: string }>({});

  const handleEditDishClick = (dish: MenuItem) => {
    setEditingDishId(dish.id);
    setName(dish.name);
    setPrice(dish.price.toString());
    setCategory(dish.category);
    setIsVeg(dish.isVeg);
    setIsRecommended(dish.isRecommended || false);
    setDesc(dish.description || '');
    setCustomImageUrl(dish.imageUrl || '');
    setAddMode('single');
    setSubView('add');
  };

  const handleImportCombo = async (combo: ComboPreset) => {
    setComboLoadingId(combo.id);
    try {
      await onAddNewDish({
        itemName: combo.title,
        price: combo.comboPrice,
        category: 'Combos & Thalis',
        isVeg: combo.isVeg,
        description: combo.items.join(' • '),
        imageUrl: combo.imageUrl || getDishImageUrl(combo.title, 'Combos & Thalis'),
        isAvailable: true,
      });
      Alert.alert('Combo Added! 🎉', `"${combo.title}" is now published to your Happido menu.`);
    } catch (e) {
    } finally {
      setComboLoadingId(null);
    }
  };

  const handleCreateCustomCombo = async () => {
    if (!customComboName.trim() || !customComboPrice) {
      Alert.alert('Required Fields', 'Please enter Combo Name and Price.');
      return;
    }
    try {
      await onAddNewDish({
        itemName: customComboName.trim(),
        price: Number(customComboPrice),
        category: 'Combos & Thalis',
        isVeg: customComboVeg,
        description: customComboItems.trim() || 'Special Chef Combo Pack',
        imageUrl: getDishImageUrl(customComboName.trim(), 'Combos & Thalis'),
        isAvailable: true,
      });
      setCustomComboName('');
      setCustomComboItems('');
      setCustomComboPrice('');
      Alert.alert('Custom Combo Live! 🍱', 'Your custom meal combo is now active on Happido.');
      setSubView('list');
    } catch (e) {}
  };

  const handleAddSubmit = async () => {
    if (!name.trim() || !price) {
      Alert.alert('Required Fields', 'Please enter Dish Name and Price.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingDishId && onEditDish) {
        await onEditDish(editingDishId, {
          itemName: name.trim(),
          price: Number(price),
          category,
          isVeg,
          description: desc.trim(),
          imageUrl: customImageUrl.trim() || undefined,
          isAvailable: true,
          isRecommended,
        });
        setEditingDishId(null);
      } else {
        await onAddNewDish({
          itemName: name.trim(),
          price: Number(price),
          category,
          isVeg,
          description: desc.trim(),
          imageUrl: customImageUrl.trim() || undefined,
          isAvailable: true,
          isRecommended,
        });
        Alert.alert('Dish Added! 🎉', `"${name.trim()}" is now live on your Happido menu.`);
      }
      
      setName('');
      setPrice('');
      setCategory('Main Course');
      setIsVeg(true);
      setIsRecommended(false);
      setDesc('');
      setCustomImageUrl('');
      setSubView('list');
    } catch (e: any) {
      console.log('Save Dish Error:', e);
      Alert.alert('Error', e?.response?.data?.message || e.message || 'Failed to save dish');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Table Row Handlers
  const handleAddBatchRow = () => {
    const newId = (Date.now() + Math.random()).toString();
    setBatchRows((prev) => [
      ...prev,
      { id: newId, name: '', category: 'Main Course', price: '', isVeg: true },
    ]);
  };

  const handleUpdateBatchRow = (id: string, field: keyof QuickBatchRow, value: any) => {
    setBatchRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveBatchRow = (id: string) => {
    if (batchRows.length <= 1) {
      setBatchRows([{ id: '1', name: '', category: 'Main Course', price: '', isVeg: true }]);
      return;
    }
    setBatchRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearEmptyRows = () => {
    const valid = batchRows.filter((r) => r.name.trim() !== '');
    if (valid.length === 0) {
      setBatchRows([{ id: '1', name: '', category: 'Main Course', price: '', isVeg: true }]);
    } else {
      setBatchRows(valid);
    }
  };

  const handleSaveBatchRows = async () => {
    const validRows = batchRows.filter((r) => r.name.trim() && Number(r.price) > 0);
    if (validRows.length === 0) {
      Alert.alert('No Valid Dishes', 'Please fill in at least one dish name and price before saving.');
      return;
    }
    const formatted = validRows.map((r) => ({
      itemName: r.name.trim(),
      price: Number(r.price),
      category: r.category || 'Main Course',
      isVeg: r.isVeg,
      description: `${r.isVeg ? 'Vegetarian' : 'Non-Veg'} ${r.category} specialty`,
      imageUrl: getDishImageUrl(r.name.trim(), r.category),
      isAvailable: true,
    }));
    setIsBulkLoading(true);
    try {
      await onBulkImport(formatted, bulkReplace);
      Alert.alert('Menu Updated! 🎉', `Successfully added ${formatted.length} dishes to your catalog.`);
      setBatchRows([
        { id: '1', name: '', category: 'Main Course', price: '', isVeg: true },
        { id: '2', name: '', category: 'Starters', price: '', isVeg: false },
        { id: '3', name: '', category: 'Beverages', price: '', isVeg: true },
        { id: '4', name: '', category: 'Desserts', price: '', isVeg: true },
      ]);
      setSubView('list');
    } catch (e) {
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent = `Dish Name, Price, Food Type, Category, Description
Butter Chicken Masala, 320, Non-Veg, Main Course, Rich cashew tomato gravy with tandoori chicken
Paneer Butter Masala, 250, Veg, Main Course, Fresh cottage cheese cubes in silky makhani gravy
Dal Makhani, 200, Veg, Main Course, Slow-cooked black lentils with white butter
Garlic Naan, 60, Veg, Breads, Crispy tandoor baked leavened bread with roasted garlic
Gulab Jamun (2 Pcs), 80, Veg, Desserts, Soft milk dumplings in warm rose cardamom syrup
Iced Cold Coffee, 120, Veg, Beverages, Chilled espresso with creamy milk
`;
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Happido_Menu_Template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      Alert.alert('Template Downloaded! 📥', 'Happido_Menu_Template.csv saved to your Downloads. Open in Excel or Google Sheets.');
    } else {
      Alert.alert('Happido Template Format', 'CSV Columns: Dish Name, Price, Veg/Non-Veg, Category, Description');
    }
  };

  const handleCustomImport = async () => {
    const parsed = parseBulkCsv(bulkCsv).map((it) => ({
      ...it,
      imageUrl: it.imageUrl || getDishImageUrl(it.itemName, it.category),
    }));
    if (parsed.length === 0) {
      Alert.alert('Invalid Data', 'Please check the CSV format.');
      return;
    }
    setIsBulkLoading(true);
    try {
      await onBulkImport(parsed, bulkReplace);
      Alert.alert('CSV Imported! 🎉', `Successfully imported ${parsed.length} dishes from CSV.`);
      setSubView('list');
    } catch (e) {
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleTogglePresetItem = (presetId: string, idx: number) => {
    const key = `${presetId}_${idx}`;
    setPresetItemToggles((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const handlePresetPriceChange = (presetId: string, idx: number, val: string) => {
    const key = `${presetId}_${idx}`;
    setPresetCustomPrices((prev) => ({
      ...prev,
      [key]: val.replace(/[^0-9]/g, ''),
    }));
  };

  const handlePickCsvFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        if (file.file) {
          const text = await file.file.text();
          setBulkCsv(text);
        } else {
          const response = await fetch(file.uri);
          const text = await response.text();
          setBulkCsv(text);
        }
      }
    } catch (e) {
      console.log('Error picking file', e);
      Alert.alert('Upload Failed', 'Failed to read the file. Please try pasting the text instead.');
    }
  };

  const handleScanMenu = async (source: 'camera' | 'gallery') => {
    try {
      let result;
      if (source === 'camera') {
        if (Platform.OS === 'web') {
          Alert.alert('Web Browser Detected', 'On desktop web, this opens your file picker. On a real iPhone or Android, this will directly open the Camera app!');
        } else {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Needed', 'Please grant camera permissions to scan your menu.');
            return;
          }
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setScanImageUri(result.assets[0].uri);
        setIsScanning(true);
        // Mock AI Scan Delay
        setTimeout(() => {
          setIsScanning(false);
          // Mock data returned from AI
          const mockAiParsedCsv = `Chicken Tikka Pizza, Main Course, 350, Non-Veg, Smoky chicken tikka chunks with mozzarella, Yes,
Garlic Bread with Cheese, Starters, 150, Veg, Toasted French bread with garlic butter and cheddar, Yes,
Mutton Biryani Special, Biryani, 420, Non-Veg, Slow cooked fragrant biryani, Yes,
Paneer Tikka, Starters, 280, Veg, Charcoal grilled cottage cheese, Yes,`;
          setBulkCsv(mockAiParsedCsv);
          Alert.alert('Scan Complete!', 'AI successfully extracted 4 dishes from your menu photo.');
        }, 3000);
      }
    } catch (e) {
      console.log('Error picking image', e);
      Alert.alert('Error', 'Failed to open image picker.');
    }
  };

  const handleDishPhotoSelect = async (source: 'camera' | 'gallery') => {
    try {
      let result;
      if (source === 'camera') {
        if (Platform.OS === 'web') {
          Alert.alert('Web Browser Detected', 'On desktop web, this opens your file picker. On a real iPhone or Android, this will directly open the Camera app!');
        } else {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Needed', 'Please grant camera permissions to take a photo.');
            return;
          }
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCustomImageUrl(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Error picking dish image', e);
      Alert.alert('Error', 'Failed to pick dish image.');
    }
  };

  const handleSelectAllPresetItems = (preset: BulkPreset, selectAll: boolean) => {
    const updates: { [key: string]: boolean } = {};
    preset.items.forEach((_, idx) => {
      updates[`${preset.id}_${idx}`] = selectAll;
    });
    setPresetItemToggles((prev) => ({ ...prev, ...updates }));
  };

  const handleImportSelectedPreset = async (preset: BulkPreset) => {
    const selectedItems = preset.items
      .map((it, idx) => {
        const toggleKey = `${preset.id}_${idx}`;
        const isSelected = presetItemToggles[toggleKey] !== false;
        const customPriceStr = presetCustomPrices[toggleKey];
        const finalPrice = customPriceStr ? Number(customPriceStr) || it.price : it.price;
        return {
          ...it,
          price: finalPrice,
          imageUrl: (it as any).imageUrl || getDishImageUrl(it.itemName, it.category),
          isSelected,
        };
      })
      .filter((it) => it.isSelected)
      .map(({ isSelected, ...rest }) => rest);


    if (selectedItems.length === 0) {
      Alert.alert('None Selected', 'Please select at least one dish to import.');
      return;
    }

    setIsBulkLoading(true);
    try {
      await onBulkImport(selectedItems, bulkReplace);
      Alert.alert('Pack Imported! 🎉', `Added ${selectedItems.length} dishes from ${preset.title} to your menu.`);
      setSubView('list');
    } catch (e) {
    } finally {
      setIsBulkLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const renderDishRow = (item: MenuItem) => {
    const dishImg = item.imageUrl || getDishImageUrl(item.name, item.category);
    return (
      <View key={item.id} style={styles.dishRow}>
        <Image
          source={{ uri: dishImg }}
          style={styles.dishThumb}
          resizeMode="cover"
        />

        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <View style={styles.dishNameRow}>
            <View
              style={[
                styles.vegDot,
                { borderColor: item.isVeg ? '#059669' : '#DC2626' },
              ]}
            >
              <View
                style={[
                  styles.vegDotInner,
                  { backgroundColor: item.isVeg ? '#059669' : '#DC2626' },
                ]}
              />
            </View>
            <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
          </View>
          <Text style={styles.dishPrice}>
            ₹{item.price} • <Text style={{ color: '#9CA3AF' }}>{item.category}</Text>
          </Text>
          {item.isRecommended ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="star" size={12} color="#EAB308" />
              <Text style={{ fontSize: 10, color: '#EAB308', marginLeft: 4, fontWeight: '700' }}>MUST TRY</Text>
            </View>
          ) : null}
          {item.description ? (
            <Text style={styles.dishDesc} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.dishActions}>
          <View style={{ alignItems: 'flex-end', marginRight: 4 }}>
            <Text style={[styles.stockStatusText, item.isAvailable ? styles.inStock : styles.outStock]}>
              {item.isAvailable ? 'IN STOCK' : 'SOLD OUT'}
            </Text>
            <Switch
              value={item.isAvailable}
              onValueChange={() => onToggleStock(item.id, item.isAvailable)}
              trackColor={{ false: '#FECACA', true: '#A7F3D0' }}
              thumbColor={item.isAvailable ? '#059669' : '#DC2626'}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={[styles.deleteBtn, { backgroundColor: '#F3F4F6' }]}
              onPress={() => handleEditDishClick(item)}
            >
              <Ionicons name="pencil" size={18} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDeleteDish(item.id, item.name)}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 4 Sub-View Navigation Tabs */}
      <View style={styles.subNavBar}>
        <TouchableOpacity
          style={[styles.subNavTab, subView === 'list' && styles.subNavTabActive]}
          onPress={() => setSubView('list')}
        >
          <Ionicons name="restaurant-outline" size={14} color={subView === 'list' ? '#D4AF37' : '#64748B'} />
          <Text style={[styles.subNavText, subView === 'list' && styles.subNavTextActive]}>
            Dishes ({menuItems.length})
          </Text>
        </TouchableOpacity>



        <TouchableOpacity
          style={[styles.subNavTab, subView === 'add' && styles.subNavTabActive]}
          onPress={() => setSubView('add')}
        >
          <Ionicons name="add-circle-outline" size={14} color={subView === 'add' ? '#D4AF37' : '#64748B'} />
          <Text style={[styles.subNavText, subView === 'add' && styles.subNavTextActive]}>
            + Add
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subNavTab, subView === 'preview' && styles.subNavTabActive]}
          onPress={() => setSubView('preview')}
        >
          <Ionicons name="eye-outline" size={14} color={subView === 'preview' ? '#D4AF37' : '#64748B'} />
          <Text style={[styles.subNavText, subView === 'preview' && styles.subNavTextActive]}>
            Preview
          </Text>
        </TouchableOpacity>
      </View>

      {subView === 'list' ? (
        <>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search dishes..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Filter Chips */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['All', ...CATEGORIES].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dishes Feed */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
            {selectedCategory === 'All' ? (
              <>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827', marginVertical: 12, paddingHorizontal: 4 }}>
                  Recommended Items
                </Text>
                
                {filteredItems.filter(i => i.isRecommended).length === 0 ? (
                  <Text style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 10, marginBottom: 20 }}>
                    No items marked as recommended yet. Edit a dish to mark it as recommended.
                  </Text>
                ) : (
                  filteredItems.filter(i => i.isRecommended).map(item => renderDishRow(item))
                )}

                <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827', marginVertical: 12, paddingHorizontal: 4, marginTop: 12 }}>
                  All Other Items
                </Text>
                {filteredItems.filter(i => !i.isRecommended).map(item => renderDishRow(item))}
              </>
            ) : (
              filteredItems.map(item => renderDishRow(item))
            )}
          </ScrollView>
        </>
      ) : subView === 'add' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          {/* Add Sub-Nav with 3 tabs */}
          {!editingDishId ? (
            <View style={styles.bulkSubNav}>
              <TouchableOpacity
                style={[styles.bulkSubNavBtn, addMode === 'single' && styles.bulkSubNavBtnActive]}
                onPress={() => setAddMode('single')}
              >
                <Ionicons name="add-circle-outline" size={14} color={addMode === 'single' ? '#0F172A' : '#6B7280'} />
                <Text style={[styles.bulkSubNavText, addMode === 'single' && styles.bulkSubNavTextActive]}>
                  Single Dish
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bulkSubNavBtn, addMode === 'upload' && styles.bulkSubNavBtnActive]}
                onPress={() => setAddMode('upload')}
              >
                <Ionicons name="document-text-outline" size={14} color={addMode === 'upload' ? '#0F172A' : '#6B7280'} />
                <Text style={[styles.bulkSubNavText, addMode === 'upload' && styles.bulkSubNavTextActive]}>
                  Excel / CSV
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bulkSubNavBtn, addMode === 'scan' && styles.bulkSubNavBtnActive]}
                onPress={() => { setAddMode('scan'); setBulkCsv(''); setScanImageUri(null); }}
              >
                <Ionicons name="scan-outline" size={14} color={addMode === 'scan' ? '#0F172A' : '#6B7280'} />
                <Text style={[styles.bulkSubNavText, addMode === 'scan' && styles.bulkSubNavTextActive]}>
                  AI Scan
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}
              onPress={() => {
                setEditingDishId(null);
                setName('');
                setPrice('');
                setCategory('Main Course');
                setIsVeg(true);
                setIsRecommended(false);
                setDesc('');
                setCustomImageUrl('');
                setSubView('list');
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#64748B" />
              <Text style={{ fontSize: 14, color: '#64748B', marginLeft: 6, fontWeight: '600' }}>Back to Menu</Text>
            </TouchableOpacity>
          )}

          {addMode === 'single' && (
            <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingDishId ? 'Edit Dish' : 'Add New Dish to Menu'}
            </Text>

            {/* Classification */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Classification</Text>
              <View style={styles.vegToggleRow}>
                <TouchableOpacity
                  style={[styles.vegChoiceBtn, isVeg && styles.vegChoiceBtnActive]}
                  onPress={() => setIsVeg(true)}
                >
                  <View style={[styles.vegDot, { borderColor: '#059669' }]}>
                    <View style={[styles.vegDotInner, { backgroundColor: '#059669' }]} />
                  </View>
                  <Text style={[styles.vegChoiceText, isVeg && { color: '#059669', fontWeight: '800' }]}>
                    Pure Veg
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.vegChoiceBtn, !isVeg && styles.nonVegChoiceBtnActive]}
                  onPress={() => setIsVeg(false)}
                >
                  <View style={[styles.vegDot, { borderColor: '#DC2626' }]}>
                    <View style={[styles.vegDotInner, { backgroundColor: '#DC2626' }]} />
                  </View>
                  <Text style={[styles.vegChoiceText, !isVeg && { color: '#DC2626', fontWeight: '800' }]}>
                    Non-Veg
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recommended Toggle */}
            <View style={styles.formGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={[styles.formLabel, { marginBottom: 0 }]}>Mark as Recommended</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                    Highlight this item as a "Must Try" dish. (Max 5 items allowed)
                  </Text>
                </View>
                <Switch
                  value={isRecommended}
                  onValueChange={(val) => {
                    if (val) {
                      const recommendedCount = menuItems.filter(
                        (i) => i.isRecommended && i.id !== editingDishId
                      ).length;
                      if (recommendedCount >= 5) {
                        Alert.alert(
                          'Limit Reached',
                          'You can only highlight a maximum of 5 recommended items. Unmark another item first.'
                        );
                        setIsRecommended(false);
                        return;
                      }
                    }
                    setIsRecommended(val);
                  }}
                  trackColor={{ false: '#E2E8F0', true: '#FEF08A' }}
                  thumbColor={isRecommended ? '#EAB308' : '#94A3B8'}
                />
              </View>
            </View>

            {/* Dish Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Dish Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Hyderabadi Chicken Dum Biryani"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Price */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Price (₹ INR) *</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="280"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ''))}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <TouchableOpacity
                style={[styles.formInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                onPress={() => setIsCategoryPickerVisible(true)}
              >
                <Text style={{ color: '#0F172A', fontSize: 14 }}>{category}</Text>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.formInput, { height: 72, textAlignVertical: 'top' }]}
                placeholder="Spices, serving portion, preparation style..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={desc}
                onChangeText={setDesc}
              />
            </View>

            {/* Dish Photo */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Dish Photo</Text>
              
              {customImageUrl ? (
                <View style={styles.imagePickerCard}>
                  <Image
                    source={{ uri: customImageUrl }}
                    style={styles.imagePickerPreview}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.imagePickerTitle}>Custom Photo Added</Text>
                    <Text style={styles.imagePickerSub}>This image will be shown to customers.</Text>
                    <TouchableOpacity onPress={() => setCustomImageUrl('')} style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 13, color: '#DC2626', fontWeight: '600' }}>Remove Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>
                    Upload an appetizing photo or take a picture right now!
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={[styles.scanActionBtn, { flex: 1 }]} onPress={() => handleDishPhotoSelect('camera')}>
                      <Ionicons name="camera-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.scanActionBtn, { backgroundColor: '#E2E8F0', flex: 1 }]} onPress={() => handleDishPhotoSelect('gallery')}>
                      <Ionicons name="image-outline" size={20} color="#0F172A" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#0F172A', fontWeight: '600' }}>Upload Image</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity style={[styles.submitBtn, { marginTop: 8 }]} onPress={handleAddSubmit} disabled={isSubmitting}>
              <LinearGradient
                colors={['#F97316', '#D4AF37']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitText}>
                      {editingDishId ? 'Save Changes' : 'Publish Dish to Happido'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          )}



          {/* MODE 2: EXCEL / CSV UPLOAD & TEMPLATE */}
          {addMode === 'upload' && (
            <View>
              {/* Template Download Card */}
              <View style={styles.templateCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.templateCardTitle}>📥 Happido Menu CSV Template</Text>
                  <Text style={styles.templateCardSub}>
                    Download our spreadsheet template, edit in Excel/Sheets, and upload below.
                  </Text>
                </View>
                <TouchableOpacity style={styles.templateDownloadBtn} onPress={handleDownloadCsvTemplate}>
                  <Ionicons name="download-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.templateDownloadText}>Download</Text>
                </TouchableOpacity>
              </View>

              {/* Upload Dropzone */}
              <TouchableOpacity style={styles.uploadDropzone} onPress={handlePickCsvFile}>
                <View style={styles.uploadIconCircle}>
                  <Ionicons name="cloud-upload" size={32} color="#D4AF37" />
                </View>
                <Text style={styles.uploadDropzoneTitle}>Tap to Browse & Upload (.csv or .xlsx)</Text>
                <Text style={styles.uploadDropzoneSub}>
                  Ensure your spreadsheet contains exactly these columns:
                </Text>
                
                {/* Columns Chips */}
                <View style={styles.columnsChipsWrapper}>
                  {['Name', 'Category', 'Price', 'Type', 'Description', 'Is Available', 'Image URL'].map((col) => (
                    <View key={col} style={styles.columnChip}>
                      <Text style={styles.columnChipText}>{col}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>



              {/* Live Preview of parsed dishes */}
              {parseBulkCsv(bulkCsv).length > 0 && (
                <View style={styles.previewBox}>
                  <View style={styles.previewHeader}>
                    <Ionicons name="eye-outline" size={14} color="#D4AF37" />
                    <Text style={styles.previewTitle}>
                      Preview ({parseBulkCsv(bulkCsv).length} valid dishes detected)
                    </Text>
                  </View>
                  <View style={styles.previewList}>
                    {parseBulkCsv(bulkCsv).slice(0, 4).map((it, idx) => (
                      <View key={idx} style={styles.previewRow}>
                        <View style={[styles.vegDot, { borderColor: it.isVeg ? '#059669' : '#DC2626' }]}>
                          <View style={[styles.vegDotInner, { backgroundColor: it.isVeg ? '#059669' : '#DC2626' }]} />
                        </View>
                        <Text style={styles.previewItemName} numberOfLines={1}>{it.itemName}</Text>
                        <Text style={styles.previewItemCat}>[{it.category}]</Text>
                        <Text style={styles.previewItemPrice}>₹{it.price}</Text>
                      </View>
                    ))}
                    {parseBulkCsv(bulkCsv).length > 4 && (
                      <Text style={styles.previewMoreText}>
                        + {parseBulkCsv(bulkCsv).length - 4} more dishes ready to upload
                      </Text>
                    )}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCustomImport}
                disabled={isBulkLoading || parseBulkCsv(bulkCsv).length === 0}
              >
                <LinearGradient
                  colors={['#F97316', '#D4AF37']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isBulkLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitText}>
                      Import {parseBulkCsv(bulkCsv).length} Dishes from CSV
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* MODE 3: AI SCAN MENU */}
          {addMode === 'scan' && (
            <View>
              {!scanImageUri ? (
                <View style={[styles.uploadDropzone, { paddingVertical: 32 }]}>
                  <View style={[styles.uploadIconCircle, { backgroundColor: '#F0FDF4', shadowColor: '#22C55E' }]}>
                    <Ionicons name="scan" size={32} color="#16A34A" />
                  </View>
                  <Text style={styles.uploadDropzoneTitle}>Scan Physical Menu</Text>
                  <Text style={[styles.uploadDropzoneSub, { textAlign: 'center', paddingHorizontal: 20 }]}>
                    Take a photo or upload an image of your menu. Our AI will automatically extract dishes, prices, and descriptions!
                  </Text>
                  
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                    <TouchableOpacity style={styles.scanActionBtn} onPress={() => handleScanMenu('camera')}>
                      <Ionicons name="camera" size={18} color="#FFFFFF" />
                      <Text style={styles.scanActionBtnText}>Take Photo</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.scanActionBtn, { backgroundColor: '#E2E8F0' }]} onPress={() => handleScanMenu('gallery')}>
                      <Ionicons name="images" size={18} color="#0F172A" />
                      <Text style={[styles.scanActionBtnText, { color: '#0F172A' }]}>Upload Image</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Image source={{ uri: scanImageUri }} style={{ width: '100%', height: 250, borderRadius: 16, marginBottom: 16 }} resizeMode="cover" />
                  {isScanning ? (
                    <View style={{ alignItems: 'center', gap: 12 }}>
                      <ActivityIndicator size="large" color="#D4AF37" />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#D4AF37' }}>AI is extracting dishes...</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.templateDownloadBtn} onPress={() => { setScanImageUri(null); setBulkCsv(''); }}>
                      <Ionicons name="refresh" size={14} color="#FFFFFF" />
                      <Text style={styles.templateDownloadText}>Scan Another Menu</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Live Preview of parsed dishes from AI */}
              {!isScanning && parseBulkCsv(bulkCsv).length > 0 && (
                <View style={styles.previewBox}>
                  <View style={styles.previewHeader}>
                    <Ionicons name="sparkles" size={14} color="#D4AF37" />
                    <Text style={styles.previewTitle}>
                      AI Extracted ({parseBulkCsv(bulkCsv).length} dishes)
                    </Text>
                  </View>
                  <View style={styles.previewList}>
                    {parseBulkCsv(bulkCsv).slice(0, 4).map((it, idx) => (
                      <View key={idx} style={styles.previewRow}>
                        <View style={[styles.vegDot, { borderColor: it.isVeg ? '#059669' : '#DC2626' }]}>
                          <View style={[styles.vegDotInner, { backgroundColor: it.isVeg ? '#059669' : '#DC2626' }]} />
                        </View>
                        <Text style={styles.previewItemName} numberOfLines={1}>{it.itemName}</Text>
                        <Text style={styles.previewItemCat}>[{it.category}]</Text>
                        <Text style={styles.previewItemPrice}>₹{it.price}</Text>
                      </View>
                    ))}
                    {parseBulkCsv(bulkCsv).length > 4 && (
                      <Text style={styles.previewMoreText}>
                        + {parseBulkCsv(bulkCsv).length - 4} more dishes extracted
                      </Text>
                    )}
                  </View>
                </View>
              )}
              
              {!isScanning && parseBulkCsv(bulkCsv).length > 0 && (
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleCustomImport}
                  disabled={isBulkLoading}
                >
                  <LinearGradient
                    colors={['#F97316', '#D4AF37']}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isBulkLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitText}>
                        Publish Extracted Dishes
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      ) : subView === 'preview' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.previewPhoneContainer}>
            {/* Phone Header Mock */}
            <View style={styles.previewPhoneHeader}>
              <View style={styles.previewPhoneNotch} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Ionicons name="arrow-back" size={20} color="#0F172A" />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Ionicons name="search" size={20} color="#0F172A" />
                  <Ionicons name="share-social" size={20} color="#0F172A" />
                </View>
              </View>
            </View>

            {/* Restaurant Cover Mock */}
            {restaurantImageUrl ? (
              <Image source={{ uri: restaurantImageUrl }} style={styles.previewCoverImage} resizeMode="cover" />
            ) : (
              <LinearGradient colors={['#F1F5F9', '#E2E8F0']} style={styles.previewCoverImage}>
                <Ionicons name="restaurant" size={40} color="#CBD5E1" />
              </LinearGradient>
            )}

            {/* Restaurant Info Mock */}
            <View style={styles.previewRestInfo}>
              <Text style={styles.previewRestName}>{restaurantName}</Text>
              <Text style={styles.previewRestTags}>North Indian • Biryani • Desserts</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Ionicons name="star" size={12} color="#D4AF37" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>4.8</Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>(120+ ratings) • 2.5 km</Text>
              </View>
            </View>

            {/* Dishes Feed Mock */}
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}>
                Recommended ({menuItems.filter(item => item.isRecommended).length > 5 ? 5 : menuItems.filter(item => item.isRecommended).length})
              </Text>
              
              {menuItems.filter(item => item.isRecommended).slice(0, 5).map((item) => (
                <View key={item.id} style={styles.previewDishCard}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={[styles.vegDot, { borderColor: item.isVeg ? '#059669' : '#DC2626', marginBottom: 6 }]}>
                      <View style={[styles.vegDotInner, { backgroundColor: item.isVeg ? '#059669' : '#DC2626' }]} />
                    </View>
                    <Text style={styles.previewDishName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.previewDishPrice}>₹{item.price}</Text>
                    {item.description ? (
                      <Text style={styles.previewDishDesc} numberOfLines={2}>{item.description}</Text>
                    ) : null}
                  </View>
                  <View>
                    <View style={styles.previewDishImageMock}>
                       {item.imageUrl ? (
                         <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
                       ) : (
                         <Ionicons name="fast-food" size={24} color="#94A3B8" />
                       )}
                    </View>
                    <View style={styles.previewAddBtnMock}>
                      <Text style={styles.previewAddBtnTextMock}>ADD</Text>
                    </View>
                  </View>
                </View>
              ))}
              
              {menuItems.filter(item => item.isRecommended).length === 0 && (
                <Text style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 10 }}>
                  No items marked as recommended yet.
                </Text>
              )}

              {menuItems.filter(item => !item.isRecommended).length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}>
                    Full Menu ({menuItems.filter(item => !item.isRecommended).length})
                  </Text>
                  
                  {menuItems.filter(item => !item.isRecommended).map((item) => (
                    <View key={item.id} style={styles.previewDishCard}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <View style={[styles.vegDot, { borderColor: item.isVeg ? '#059669' : '#DC2626', marginBottom: 6 }]}>
                          <View style={[styles.vegDotInner, { backgroundColor: item.isVeg ? '#059669' : '#DC2626' }]} />
                        </View>
                        <Text style={styles.previewDishName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.previewDishPrice}>₹{item.price}</Text>
                        <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{item.category}</Text>
                        {item.description ? (
                          <Text style={styles.previewDishDesc} numberOfLines={2}>{item.description}</Text>
                        ) : null}
                      </View>
                      <View>
                        <View style={styles.previewDishImageMock}>
                           {item.imageUrl ? (
                             <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
                           ) : (
                             <Ionicons name="fast-food" size={24} color="#94A3B8" />
                           )}
                        </View>
                        <View style={[styles.previewAddBtnMock, { opacity: item.isAvailable ? 1 : 0.5 }]}>
                          <Text style={styles.previewAddBtnTextMock}>{item.isAvailable ? 'ADD' : 'SOLD OUT'}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

            </View>
          </View>
        </ScrollView>
      ) : null}

      {/* Category Picker Modal */}
      {Platform.OS === 'web' ? (
        isCategoryPickerVisible && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 20, maxHeight: '70%', width: '100%' }}>
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>Select Category</Text>
                <TouchableOpacity onPress={() => setIsCategoryPickerVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    onPress={() => {
                      setCategory(cat);
                      setIsCategoryPickerVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 15, color: category === cat ? '#EA580C' : '#334155', fontWeight: category === cat ? '700' : '500' }}>
                      {cat}
                    </Text>
                    {category === cat && <Ionicons name="checkmark-circle" size={20} color="#EA580C" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )
      ) : (
        <Modal visible={isCategoryPickerVisible} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '70%', width: '100%' }}>
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>Select Category</Text>
                <TouchableOpacity onPress={() => setIsCategoryPickerVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    onPress={() => {
                      setCategory(cat);
                      setIsCategoryPickerVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 15, color: category === cat ? '#EA580C' : '#334155', fontWeight: category === cat ? '700' : '500' }}>
                      {cat}
                    </Text>
                    {category === cat && <Ionicons name="checkmark-circle" size={20} color="#EA580C" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  subNavBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 10,
  },
  subNavTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  subNavTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subNavText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  subNavTextActive: {
    color: '#D4AF37',
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dishThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  dishNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vegDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDotInner: {
    width: 5,
    height: 5,
    borderRadius: 2,
  },
  dishName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  dishPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    marginTop: 2,
  },
  dishDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  dishActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockStatusText: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  inStock: {
    color: '#059669',
  },
  outStock: {
    color: '#DC2626',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  formScroll: {
    paddingBottom: 110,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  vegToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  vegChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  vegChoiceBtnActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  nonVegChoiceBtnActive: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  vegChoiceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  rupeeSymbol: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D4AF37',
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  imagePickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
  },
  imagePickerPreview: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  imagePickerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  imagePickerSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  imageUrlInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
    color: '#0F172A',
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bulkSubNav: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  bulkSubNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  bulkSubNavBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  bulkSubNavText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  bulkSubNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bulkOptionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  bulkOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  bulkOptionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  bulkInstructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bulkInstructionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 18,
  },
  batchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  batchTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  batchHeadCol: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  batchIndex: {
    width: 20,
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  batchVegBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  batchVegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  batchNameInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  batchCatBadge: {
    width: 96,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batchCatBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  batchPriceInput: {
    width: 66,
    fontSize: 13,
    fontWeight: '800',
    color: '#D4AF37',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: 'center',
  },
  batchDelBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  batchActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FEF08A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addRowBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
  },
  clearRowsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearRowsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  templateCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  templateCardSub: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  templateDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  templateDownloadText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  uploadDropzone: {
    backgroundColor: '#FAFAF9',
    borderWidth: 2,
    borderColor: '#E7E5E4',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  uploadDropzoneTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 8,
  },
  uploadDropzoneSub: {
    fontSize: 12,
    color: '#78716C',
    marginBottom: 16,
  },
  scanActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scanActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  columnsChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  columnChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  columnChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#44403C',
  },
  sampleLink: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
  },
  csvTextInput: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    fontSize: 13,
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    height: 180,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  previewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
  },
  previewList: {
    gap: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  previewItemName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  previewItemCat: {
    fontSize: 10,
    color: '#64748B',
  },
  previewItemPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
  },
  previewMoreText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
    fontStyle: 'italic',
  },
  previewPhoneContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#0F172A',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
    marginHorizontal: 10,
    paddingBottom: 20,
  },
  previewPhoneHeader: {
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  previewPhoneNotch: {
    width: 100,
    height: 20,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    alignSelf: 'center',
    position: 'absolute',
    top: -2,
  },
  previewCoverImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewRestInfo: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  previewRestName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  previewRestTags: {
    fontSize: 12,
    color: '#64748B',
  },
  previewDishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  previewDishName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  previewDishPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  previewDishDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  previewDishImageMock: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewAddBtnMock: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewAddBtnTextMock: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  cuisineFilterScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  cuisineFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cuisineFilterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  cuisineFilterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  cuisineFilterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  presetCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  presetCuisine: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
  },
  presetSelectAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetSelectAllText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  presetItemsBox: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  presetTipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  presetItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    gap: 6,
  },
  presetCheckbox: {
    padding: 2,
  },
  presetItemName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  presetItemCategory: {
    fontSize: 10,
    color: '#94A3B8',
  },
  presetPriceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  presetPriceRupee: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    marginRight: 2,
  },
  presetPriceInput: {
    width: 44,
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    padding: 8,
  },
  presetBottomImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  presetBottomImportText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  comboHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  comboHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  comboPill: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  comboPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  comboHeaderSub: {
    fontSize: 11,
    color: '#7C2D12',
    marginTop: 2,
    lineHeight: 16,
  },
  comboHeaderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  comboSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  comboCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    overflow: 'hidden',
  },
  comboCardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  comboTitleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  comboBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  comboBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  comboTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
  },
  comboBody: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  comboItemsList: {
    gap: 8,
    marginBottom: 16,
  },
  comboItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
  },
  comboItemText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  comboFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  comboPriceText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  comboMrpText: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  comboSavingsBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  comboSavingsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  addComboBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addComboBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  customComboCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
    marginBottom: 20,
  },
  customComboHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  customComboSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
    marginTop: 2,
  },
  comboInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 8,
  },
  publishComboBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 4,
  },
  publishComboText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
