import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVeg?: boolean;
  isQuick49Item?: boolean;
}

export interface StoredCart {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
}

const CART_STORAGE_KEY = 'happido_customer_cart';

export async function getCart(): Promise<StoredCart | null> {
  try {
    const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.log('Error reading cart from storage:', e);
    return null;
  }
}

export async function saveCart(cart: StoredCart): Promise<void> {
  try {
    if (!cart.items || cart.items.length === 0) {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (e) {
    console.log('Error saving cart to storage:', e);
  }
}

export async function clearCart(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  } catch (e) {
    console.log('Error clearing cart:', e);
  }
}

export async function getCartItemCount(): Promise<number> {
  try {
    const cart = await getCart();
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  } catch {
    return 0;
  }
}

export async function addToCart(item: CartItem, restaurantId = '654321', restaurantName = 'Happido Kitchen'): Promise<number> {
  try {
    let cart = await getCart();
    if (!cart) {
      cart = { restaurantId, restaurantName, items: [] };
    }
    const existingIndex = cart.items.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += 1;
    } else {
      cart.items.push({ ...item, quantity: 1 });
    }
    await saveCart(cart);
    return cart.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  } catch {
    return 0;
  }
}

export async function addMultipleToCart(
  newItems: CartItem[],
  restaurantId = '654321',
  restaurantName = 'Happido Kitchen'
): Promise<number> {
  try {
    let cart = await getCart();
    if (!cart) {
      cart = { restaurantId, restaurantName, items: [] };
    }
    for (const item of newItems) {
      const existingIndex = cart.items.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += item.quantity || 1;
      } else {
        cart.items.push({ ...item, quantity: item.quantity || 1 });
      }
    }
    await saveCart(cart);
    return cart.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  } catch {
    return 0;
  }
}

