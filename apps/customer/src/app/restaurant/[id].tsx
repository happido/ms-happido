import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import api from '../../utils/api';
import { getDishImageUrl } from '../../utils/foodImages';
import { getCart, saveCart, clearCart } from '../../utils/cartHelper';
import CustomAlertModal, { CustomAlertConfig } from '../../components/CustomAlertModal';
import { useGlobalState } from '@/context/GlobalContext';

const DEFAULT_INDIAN_MENU = [
  { id: '1', name: 'Hyderabadi Chicken Dum Biryani', price: 280, desc: 'Aromatic basmati rice cooked with tender chicken and authentic spices', category: 'Biryani', isVeg: false, isAvailable: true, imageUrl: getDishImageUrl('Hyderabadi Chicken Dum Biryani', 'Biryani') },
  { id: '2', name: 'Paneer Butter Masala', price: 240, desc: 'Fresh cottage cheese in rich and creamy tomato butter gravy', category: 'Main Course', isVeg: true, isAvailable: true, imageUrl: getDishImageUrl('Paneer Butter Masala', 'Main Course') },
  { id: '3', name: 'Butter Garlic Naan', price: 55, desc: 'Clay oven baked flatbread with roasted garlic and butter', category: 'Breads', isVeg: true, isAvailable: true, imageUrl: getDishImageUrl('Butter Garlic Naan', 'Breads') },
  { id: '4', name: 'Chicken 65 Andhra Spicy', price: 220, desc: 'Crispy fried chicken chunks tossed with curry leaves and green chilies', category: 'Starters', isVeg: false, isAvailable: true, imageUrl: getDishImageUrl('Chicken 65 Andhra Spicy', 'Starters') },
  { id: '5', name: 'Gulab Jamun (2 Pcs)', price: 80, desc: 'Warm khoya dumplings soaked in cardamom rose syrup', category: 'Desserts', isVeg: true, isAvailable: true, imageUrl: getDishImageUrl('Gulab Jamun', 'Desserts') },
];

export default function RestaurantMenuScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { setCartCount } = useGlobalState();
  const [restaurantName, setRestaurantName] = useState('Happido Kitchen');
  const [menuList, setMenuList] = useState<any[]>(DEFAULT_INDIAN_MENU);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [cart, setCart] = useState<{ id: string, name: string, price: number, quantity: number, isVeg?: boolean }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customAlert, setCustomAlert] = useState<CustomAlertConfig | null>(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (!id) return;
      try {
        const storedCart = await getCart();
        if (storedCart && storedCart.restaurantId === id) {
          const items = storedCart.items || [];
          setCart(items);
          setCartCount(items.reduce((s: number, i: any) => s + i.quantity, 0));
        }

        const res = await api.get(`/restaurants/${id}`);
        if (res.data) {
          if (res.data.name) setRestaurantName(res.data.name);
          if (res.data.menu && res.data.menu.length > 0) {
            setMenuList(
              res.data.menu
                .filter((m: any) => (m.name || m.itemName) && m.price > 0)
                .map((m: any) => ({
                  id: m._id,
                  name: m.name || m.itemName,
                  price: m.price,
                desc: m.description || m.desc || '',
                category: m.category || 'Main Course',
                isVeg: m.isVeg !== false,
                isAvailable: m.isAvailable !== false,
                isQuick49Item: m.isQuick49Item === true,
                imageUrl: getDishImageUrl(m.name || m.itemName, m.category, m.imageUrl),
              }))
            );
          }
        }
      } catch (err) {
        console.log('Error fetching restaurant menu:', err);
      } finally {
        setIsLoadingMenu(false);
      }
    };
    fetchRestaurantDetails();
  }, [id]);

  const addToCart = async (item: any) => {
    if (item.isAvailable === false) {
      Alert.alert('Item Sold Out', 'Sorry, this dish is currently out of stock.');
      return;
    }

    const storedCart = await getCart();
    
    // Check if cart has items from a DIFFERENT restaurant
    if (storedCart && storedCart.items && storedCart.items.length > 0 && storedCart.restaurantId !== id) {
      setCustomAlert({
        visible: true,
        title: 'Replace cart item?',
        message: `Your cart contains dishes from ${storedCart.restaurantName || 'another restaurant'}. Do you want to discard the selection and add dishes from ${restaurantName}?`,
        type: 'confirm',
        confirmText: 'Replace',
        onConfirm: () => {
          setCustomAlert(null);
          const newCart = [{ ...item, quantity: 1 }];
          setCart(newCart);
          setCartCount(1);
          saveCart({
            restaurantId: id as string,
            restaurantName: restaurantName,
            items: newCart,
          });
        },
        onCancel: () => setCustomAlert(null)
      });
      return;
    }

    // Normal add to cart logic (same restaurant or empty cart)
    setCart(prev => {
      let updated: typeof prev;
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        updated = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      setCartCount(updated.reduce((s, i) => s + i.quantity, 0));
      saveCart({
        restaurantId: id as string,
        restaurantName: restaurantName,
        items: updated,
      });
      return updated;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      let updated: typeof prev;
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) {
        updated = prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      } else {
        updated = prev.filter(i => i.id !== itemId);
      }
      setCartCount(updated.reduce((s, i) => s + i.quantity, 0));
      saveCart({
        restaurantId: id as string,
        restaurantName: restaurantName,
        items: updated,
      });
      return updated;
    });
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first.');
      return;
    }

    router.push({
      pathname: '/cart',
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const recommendedItems = menuList.filter(item => item.isRecommended).slice(0, 5);

  const renderRecommendedSection = () => {
    if (recommendedItems.length === 0) return null;

    return (
      <View style={styles.recommendedSection}>
        <View style={styles.recommendedHeader}>
          <Text style={styles.recommendedTitle}>Must Try</Text>
          <Ionicons name="sparkles" size={16} color="#EA580C" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedScroll}>
          {recommendedItems.map(item => {
            const inCart = cart.find((i) => i.id === item.id);
            const dishImg = item.imageUrl || getDishImageUrl(item.name, item.category);

            return (
              <View key={item.id} style={styles.recommendedCard}>
                <Image source={{ uri: dishImg }} style={styles.recommendedImg} resizeMode="cover" />
                <View style={styles.recommendedInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={[styles.vegDot, { borderColor: item.isVeg ? '#059669' : '#DC2626', width: 10, height: 10, borderRadius: 2, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }]}>
                      <View style={[styles.vegDotInner, { backgroundColor: item.isVeg ? '#059669' : '#DC2626', width: 4, height: 4, borderRadius: 2 }]} />
                    </View>
                    <Text style={styles.recommendedName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text style={styles.recommendedPrice}>₹{item.price}</Text>
                </View>
                
                <View style={styles.recActionWrapper}>
                  {item.isAvailable === false ? (
                     <View style={[styles.disabledAddBtn, { paddingHorizontal: 12, paddingVertical: 4 }]}><Text style={styles.disabledAddText}>Sold</Text></View>
                  ) : inCart ? (
                    <View style={styles.floatingQtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                        <Ionicons name="remove" size={14} color="#EA580C" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{inCart.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                        <Ionicons name="add" size={14} color="#EA580C" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.floatingAddBtn} onPress={() => addToCart(item)}>
                      <Text style={styles.floatingAddText}>ADD</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/restaurants')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{restaurantName}</Text>
          <Text style={styles.subtitle}>Fresh & authentic dishes delivered hot</Text>
        </View>
        <TouchableOpacity style={styles.cartIconBtn} onPress={() => router.push('/cart')}>
          <Ionicons name="cart" size={22} color="#EA580C" />
          {cartItemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isLoadingMenu ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={{ marginTop: 10, color: '#6B7280', fontSize: 13 }}>Loading dishes...</Text>
        </View>
      ) : (
        <FlatList
          data={menuList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          ListHeaderComponent={renderRecommendedSection}
          renderItem={({ item }) => {
            const inCart = cart.find((i) => i.id === item.id);
            const dishImg = item.imageUrl || getDishImageUrl(item.name, item.category);

            return (
              <View style={[styles.menuItem, item.isAvailable === false && { opacity: 0.6 }]}>
                {/* Left Side: Dish Details */}
                <View style={styles.menuInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
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
                    <Text style={styles.menuName} numberOfLines={2}>{item.name}</Text>
                  </View>

                  <Text style={styles.menuPrice}>₹{item.price}</Text>

                  {item.desc ? (
                    <Text style={styles.menuDesc} numberOfLines={2}>
                      {item.desc}
                    </Text>
                  ) : null}

                  {item.isAvailable === false && (
                    <Text style={styles.soldOutBadge}>Sold Out Today</Text>
                  )}
                </View>

                {/* Right Side: High-Res Food Photo with Floating ADD button */}
                <View style={styles.imageActionWrapper}>
                  <Image
                    source={{ uri: dishImg }}
                    style={styles.dishImage}
                    resizeMode="cover"
                  />

                  {item.isAvailable === false ? (
                    <View style={styles.disabledAddBtn}>
                      <Text style={styles.disabledAddText}>Unavailable</Text>
                    </View>
                  ) : inCart ? (
                    <View style={styles.floatingQtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                        <Ionicons name="remove" size={14} color="#EA580C" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{inCart.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                        <Ionicons name="add" size={14} color="#EA580C" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.floatingAddBtn} onPress={() => addToCart(item)}>
                      <Text style={styles.floatingAddText}>ADD</Text>
                      <Text style={styles.floatingAddPlus}>+</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {cart.length > 0 && (
        <View style={styles.cartContainerWrapper}>
          <View style={styles.cartContainer}>
            <View>
              <Text style={styles.cartTitle}>
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} added
              </Text>
              <Text style={styles.cartTotal}>₹{total}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={placeOrder}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.checkoutContent}>
                  <Text style={styles.checkoutText}>View Cart</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <CustomAlertModal config={customAlert} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuInfo: {
    flex: 1,
    paddingRight: 8,
  },
  menuName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  menuDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  menuPrice: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '900',
    marginTop: 2,
  },
  imageActionWrapper: {
    width: 108,
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 14,
  },
  dishImage: {
    width: 104,
    height: 92,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingAddText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  floatingAddPlus: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
    marginLeft: 2,
  },
  floatingQtyRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EA580C',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cartContainerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  cartContainer: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 12,
  },
  cartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cartTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  checkoutButton: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  checkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vegDot: {
    width: 13,
    height: 13,
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
  soldOutBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  disabledAddBtn: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disabledAddText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  qtyBtn: {
    padding: 5,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
    paddingHorizontal: 8,
  },
  cartIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  recommendedSection: {
    marginBottom: 24,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  recommendedScroll: {
    paddingRight: 16,
  },
  recommendedCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'visible',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    paddingBottom: 14,
    marginRight: 12,
  },
  recommendedImg: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#F1F5F9',
  },
  recommendedInfo: {
    padding: 10,
    paddingBottom: 16,
  },
  recommendedName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  recommendedPrice: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '900',
    marginTop: 4,
  },
  recActionWrapper: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
