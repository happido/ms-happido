import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { getCart, StoredCart } from '@/utils/cartHelper';

interface GlobalCartBannerProps {
  cartCount: number;
  hasBottomNav?: boolean;
}

export default function GlobalCartBanner({ cartCount, hasBottomNav = true }: GlobalCartBannerProps) {
  const router = useRouter();
  const [cartData, setCartData] = useState<StoredCart | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      if (cartCount > 0) {
        const cart = await getCart();
        setCartData(cart);
        if (cart && cart.items) {
          const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          setTotalPrice(total);
        }
      } else {
        setCartData(null);
        setTotalPrice(0);
      }
    };
    fetchCart();
  }, [cartCount]);

  if (cartCount === 0 || !cartData) {
    return null;
  }

  return (
    <Animated.View entering={SlideInDown.duration(300)} exiting={SlideOutDown.duration(300)} style={[styles.container, { bottom: hasBottomNav ? (Platform.OS === 'web' ? 70 : 85) : 20 }]}>
      <TouchableOpacity style={styles.banner} onPress={() => router.push('/cart')} activeOpacity={0.9}>
        <View style={styles.leftInfo}>
          <Text style={styles.itemsText}>{cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}</Text>
          <View style={styles.dot} />
          <Text style={styles.priceText}>₹{totalPrice}</Text>
        </View>
        
        <View style={styles.rightInfo}>
          <View style={{ marginRight: 8 }}>
            <Text style={styles.restaurantName} numberOfLines={1}>From {cartData.restaurantName}</Text>
            <Text style={styles.viewCartText}>View Cart</Text>
          </View>
          <Ionicons name="cart" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
  },
  banner: {
    backgroundColor: '#EA580C', // Theme Orange
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
    opacity: 0.6,
    marginHorizontal: 8,
  },
  priceText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantName: {
    color: '#FFEDD5',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 2,
    maxWidth: 100,
  },
  viewCartText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
});
