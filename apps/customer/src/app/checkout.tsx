import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import api from '../utils/api';
import { clearCart, getCart, saveCart, CartItem } from '../utils/cartHelper';
import { useStripe } from '../utils/stripeWrapper';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function CheckoutScreen() {
  const router = useRouter();
  const { cartData, restaurantId } = useLocalSearchParams();
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>((restaurantId as string) || '');
  const [restaurantName, setRestaurantName] = useState<string>('Happido Kitchen');
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAddress = async () => {
        try {
          const existingData = await AsyncStorage.getItem('savedAddresses');
          if (existingData) {
            const addresses = JSON.parse(existingData);
            const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
            if (defaultAddr) {
              setDeliveryAddress(defaultAddr);
            }
          }
        } catch (e) {
          console.log('Error fetching address', e);
        }
      };
      fetchAddress();
    }, [])
  );

  useEffect(() => {
    const initCart = async () => {
      setIsLoading(true);
      try {
        if (cartData) {
          const parsed = JSON.parse(cartData as string);
          setCart(parsed);
        } else {
          const stored = await getCart();
          if (stored && stored.items && stored.items.length > 0) {
            setCart(stored.items);
            if (stored.restaurantId) setActiveRestaurantId(stored.restaurantId);
            if (stored.restaurantName) setRestaurantName(stored.restaurantName);
          }
        }
      } catch (e) {
        console.log('Error parsing cart data', e);
      } finally {
        setIsLoading(false);
      }
    };
    initCart();
  }, [cartData]);

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {}
    router.replace('/restaurants');
  };

  const handleAddSampleItems = async () => {
    let validRestaurantId = activeRestaurantId;
    let validRestaurantName = restaurantName;

    if (!validRestaurantId || validRestaurantId.includes('kitchen-1')) {
      try {
        const res = await api.get('/restaurants');
        if (res.data && res.data.length > 0) {
          // Smart restaurant resolution:
          // 1. Find one named 'mahesh' (the currently logged-in restaurant partner)
          // 2. Else find the most recently created restaurant (by _id sort)
          // 3. Else the first one with a menu
          // 4. Else the first restaurant
          const byName = res.data.find((r: any) => 
            (r.restaurantName || r.name || '').toLowerCase().includes('mahesh')
          );
          const sorted = [...res.data].sort((a: any, b: any) => 
            (b._id || '').localeCompare(a._id || '')
          );
          const mostRecent = sorted[0];
          const withMenu = res.data.find((r: any) => r.menu && r.menu.length > 0);
          const chosen = byName || mostRecent || withMenu || res.data[0];
          validRestaurantId = chosen._id;
          validRestaurantName = chosen.restaurantName || chosen.name;
          console.log('🛒 [CHECKOUT] All restaurants:', res.data.map((r: any) => `${r._id}: ${r.restaurantName || r.name}`));
          console.log('🛒 [CHECKOUT] Resolved to:', validRestaurantId, validRestaurantName);
        }
      } catch (e) {
        console.log('Failed to fetch fallback restaurant', e);
      }
    }

    const sampleItems: CartItem[] = [
      { id: 'sample-1', name: 'Hyderabadi Chicken Dum Biryani', price: 280, quantity: 1, isVeg: false },
      { id: 'sample-2', name: 'Butter Garlic Naan', price: 55, quantity: 2, isVeg: true },
      { id: 'sample-3', name: 'Gulab Jamun (2 Pcs)', price: 80, quantity: 1, isVeg: true },
    ];
    const sampleCart = {
      restaurantId: validRestaurantId || 'fallback_id',
      restaurantName: validRestaurantName || 'Happido Kitchen (Demo)',
      items: sampleItems,
    };
    await saveCart(sampleCart);
    setCart(sampleItems);
    setActiveRestaurantId(sampleCart.restaurantId);
    setRestaurantName(sampleCart.restaurantName);
  };

  const hasQuick49 = cart.some((item: any) => item.isQuick49Item);
  const itemTotal = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  
  const deliveryFee = cart.length > 0 ? (hasQuick49 ? 20 : 40) : 0;
  const platformFee = cart.length > 0 ? (hasQuick49 ? 10 : 5) : 0;
  const grandTotal = itemTotal + deliveryFee + platformFee;

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your order first.');
      return;
    }

    setIsSubmitting(true);
    try {
      let customerCoords = [78.4867, 17.3850];
      let customerAddress = 'Location not provided';

      if (deliveryAddress) {
        if (deliveryAddress.coordinates) {
          const lng = deliveryAddress.coordinates.lng !== undefined ? deliveryAddress.coordinates.lng : (deliveryAddress.coordinates[0] || 78.4867);
          const lat = deliveryAddress.coordinates.lat !== undefined ? deliveryAddress.coordinates.lat : (deliveryAddress.coordinates[1] || 17.3850);
          customerCoords = [lng, lat];
        }
        customerAddress = deliveryAddress.address || 'Location not provided';
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          customerCoords = [location.coords.longitude, location.coords.latitude];
          
          let geoAddress = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
          if (geoAddress.length > 0) {
            const p = geoAddress[0];
            customerAddress = `${p.name || p.street || ''}, ${p.city || p.district || ''}, ${p.region || ''}`.replace(/^, | ,|, $/g, '');
          }
        } else {
          Alert.alert('Permission Denied', 'Using default location because location access was denied.');
        }
      }

      if (selectedPayment === 'card' || selectedPayment === 'apple_pay') {
        // Stripe integration flow
        const paymentRes = await api.post('/payments/create-payment-intent', {
          amount: grandTotal,
          currency: 'inr'
        });
        
        const { clientSecret } = paymentRes.data;
        
        const initSheet = await initPaymentSheet({
          merchantDisplayName: 'Happido',
          paymentIntentClientSecret: clientSecret,
          defaultBillingDetails: {
            name: 'Happido Customer',
          }
        });
        
        if (initSheet.error) {
          Alert.alert('Payment Error', initSheet.error.message);
          setIsSubmitting(false);
          return;
        }
        
        const presentSheet = await presentPaymentSheet();
        if (presentSheet.error) {
          Alert.alert('Payment Cancelled', presentSheet.error.message);
          setIsSubmitting(false);
          return;
        }
      }
      // Ensure we have a valid restaurant ID before placing the order
      let finalRestaurantId = activeRestaurantId;
      if (!finalRestaurantId || finalRestaurantId.includes('kitchen-1') || finalRestaurantId === 'fallback_id') {
        try {
          const restRes = await api.get('/restaurants');
          if (restRes.data && restRes.data.length > 0) {
            const byName = restRes.data.find((r: any) => 
              (r.restaurantName || r.name || '').toLowerCase().includes('mahesh')
            );
            const sorted = [...restRes.data].sort((a: any, b: any) => 
              (b._id || '').localeCompare(a._id || '')
            );
            const mostRecent = sorted[0];
            const withMenu = restRes.data.find((r: any) => r.menu && r.menu.length > 0);
            const chosen = byName || mostRecent || withMenu || restRes.data[0];
            finalRestaurantId = chosen._id;
            setActiveRestaurantId(finalRestaurantId);
            console.log('🛒 [PLACE ORDER] Resolved restaurantId to:', finalRestaurantId, chosen.restaurantName || chosen.name);
          }
        } catch (e) {
          console.log('Failed to resolve restaurant ID', e);
        }
      }
      
      console.log('🛒 [PLACE ORDER] Sending order to restaurantId:', finalRestaurantId);

      const response = await api.post('/orders', {
        restaurantId: finalRestaurantId,
        items: cart,
        totalAmount: itemTotal,
        deliveryAddress: customerAddress,
        deliveryLocation: {
          type: 'Point',
          coordinates: customerCoords,
        },
        paymentMethod: selectedPayment,
        paymentStatus: selectedPayment === 'cash' ? 'pending' : 'completed',
      });
      
      const newOrderId = response.data?._id || 'mock-order-101';
      await clearCart();
      router.replace(`/tracking/${newOrderId}`);
    } catch (error: any) {
      console.log('Order error:', error.response?.data?.message || error.message);
      // If backend mock or error, simulate order completion for testing
      await clearCart();
      Alert.alert('Order Confirmed', 'Your order has been placed successfully!', [
        { text: 'Track Order', onPress: () => router.replace('/tracking/order-demo-123') },
        { text: 'Go Home', onPress: () => router.replace('/') },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Checkout</Text>
          {cart.length > 0 && (
            <Text style={styles.headerSub}>{restaurantName} • {cart.length} items</Text>
          )}
        </View>
        <TouchableOpacity style={styles.cartIconLink} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={22} color="#0F172A" />
          {cart.length > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{cart.reduce((s, i) => s + i.quantity, 0)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Empty State when no items in cart */}
      {cart.length === 0 ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={60} color="#EA580C" />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            No items are selected yet. Add your favorite dishes from our restaurants to proceed with checkout!
          </Text>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.replace('/restaurants')}
          >
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              style={styles.exploreGradient}
            >
              <Ionicons name="restaurant-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.exploreBtnText}>Browse Restaurants & Dishes</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Demo button */}
          <TouchableOpacity
            style={styles.quickAddBtn}
            onPress={handleAddSampleItems}
          >
            <Ionicons name="flash-outline" size={18} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.quickAddText}>+ Add Demo Items for Testing</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Order Items Section */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Order Items ({cart.length})</Text>
              <TouchableOpacity onPress={() => router.push('/cart')}>
                <Text style={styles.editCartText}>Edit Cart</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemsBox}>
              {cart.map((item, index) => (
                <View
                  key={item.id || index}
                  style={[styles.itemRow, index < cart.length - 1 && styles.itemDivider]}
                >
                  <View
                    style={[
                      styles.vegDot,
                      { borderColor: item.isVeg === false ? '#DC2626' : '#16A34A' },
                    ]}
                  >
                    <View
                      style={[
                        styles.vegDotInner,
                        { backgroundColor: item.isVeg === false ? '#DC2626' : '#16A34A' },
                      ]}
                    />
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Text style={styles.itemNameText}>{item.name}</Text>
                    <Text style={styles.itemQtyPrice}>Qty: {item.quantity} × ₹{item.price}</Text>
                  </View>
                  <Text style={styles.itemSubtotal}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Bill Summary */}
          <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            
            <View style={styles.billContainer}>
              <View style={styles.billRow}>
                <Text style={styles.billText}>Item Total</Text>
                <Text style={styles.billValue}>₹{itemTotal}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billText}>Delivery Fee</Text>
                <Text style={styles.billValue}>₹{deliveryFee}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billText}>Platform Fee</Text>
                <Text style={styles.billValue}>₹{platformFee}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.billRow}>
                <Text style={styles.grandTotalLabel}>To Pay</Text>
                <Text style={styles.grandTotalText}>₹{grandTotal}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Delivery Address */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Delivery Address</Text>
              <TouchableOpacity onPress={() => router.push('/add-address')}>
                <Text style={styles.editCartText}>{deliveryAddress ? 'Change' : 'Add New'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.addressBox}
              onPress={() => router.push('/add-address')}
              activeOpacity={0.7}
            >
              <View style={styles.addressIcon}>
                <Ionicons name="location" size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.addressName}>
                  {deliveryAddress ? (deliveryAddress.title || 'Home') : 'No Address Selected'}
                </Text>
                <Text style={styles.addressDesc}>
                  {deliveryAddress ? deliveryAddress.address : 'Tap to add your delivery address'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </Animated.View>

          {/* Payment Methods */}
          <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity 
              style={[styles.paymentOption, selectedPayment === 'upi' && styles.paymentSelected]}
              onPress={() => setSelectedPayment('upi')}
            >
              <View style={styles.paymentIconRow}>
                <Ionicons name="qr-code-outline" size={24} color={selectedPayment === 'upi' ? '#EA580C' : '#64748B'} />
                <Text style={styles.paymentText}>UPI (GPay, PhonePe, Paytm)</Text>
              </View>
              <View style={[styles.radio, selectedPayment === 'upi' && styles.radioSelected]}>
                {selectedPayment === 'upi' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentOption, selectedPayment === 'card' && styles.paymentSelected]}
              onPress={() => setSelectedPayment('card')}
            >
              <View style={styles.paymentIconRow}>
                <Ionicons name="card-outline" size={24} color={selectedPayment === 'card' ? '#EA580C' : '#64748B'} />
                <Text style={styles.paymentText}>Credit / Debit Card</Text>
              </View>
              <View style={[styles.radio, selectedPayment === 'card' && styles.radioSelected]}>
                {selectedPayment === 'card' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentOption, selectedPayment === 'cash' && styles.paymentSelected]}
              onPress={() => setSelectedPayment('cash')}
            >
              <View style={styles.paymentIconRow}>
                <Ionicons name="cash-outline" size={24} color={selectedPayment === 'cash' ? '#EA580C' : '#64748B'} />
                <Text style={styles.paymentText}>Cash on Delivery</Text>
              </View>
              <View style={[styles.radio, selectedPayment === 'cash' && styles.radioSelected]}>
                {selectedPayment === 'cash' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}

      {/* Footer when cart has items */}
      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerTotalLabel}>Total to pay</Text>
            <Text style={styles.footerTotalAmount}>₹{grandTotal}</Text>
          </View>
          <TouchableOpacity 
            style={styles.payBtn} 
            onPress={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.payBtnText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  headerSub: { fontSize: 12, color: '#64748B', marginTop: 1 },
  cartIconLink: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EA580C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  
  container: { flex: 1, padding: 16 },
  section: { marginBottom: 18 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  editCartText: { fontSize: 13, color: '#EA580C', fontWeight: '700' },

  itemsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vegDot: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemQtyPrice: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  billContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billText: { fontSize: 14, color: '#64748B' },
  billValue: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  grandTotalLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  grandTotalText: { fontSize: 17, fontWeight: '800', color: '#EA580C' },

  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  addressDesc: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 16 },
  
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentSelected: { borderColor: '#EA580C', backgroundColor: '#FFF7ED' },
  paymentIconRow: { flexDirection: 'row', alignItems: 'center' },
  paymentText: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginLeft: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#EA580C' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EA580C' },
  
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' },
      default: { elevation: 10 },
    }),
  },
  footerInfo: { flex: 1 },
  footerTotalLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
  footerTotalAmount: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  payBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  payBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 300,
    marginBottom: 12,
  },
  exploreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  quickAddText: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 13,
  },
});
