import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, Platform, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { getCart, saveCart, clearCart, StoredCart } from '../utils/cartHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import { getDishImageUrl } from '../utils/foodImages';

const ADDRESSES_KEY = 'happido_saved_addresses';

interface SavedAddress {
  id: string;
  title: string;
  type: 'home' | 'work' | 'other';
  address: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export default function CartScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<StoredCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSurging, setIsSurging] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [surgeMessage, setSurgeMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Delivery tip
  const [deliveryTip, setDeliveryTip] = useState(0);
  const tipOptions = [0, 20, 30, 50];

  // Cooking instructions
  const [cookingInstruction, setCookingInstruction] = useState('');
  const [showCookingModal, setShowCookingModal] = useState(false);
  const cookingSuggestions = ['Less spicy', 'Extra spicy', 'No onion no garlic', 'Less oil', 'Extra gravy'];

  // Cutlery
  const [wantCutlery, setWantCutlery] = useState(false);

  useEffect(() => {
    loadCart();
    fetchSurgeStatus();
    loadAddresses();
  }, []);

  const fetchSurgeStatus = async () => {
    try {
      const res = await api.get('/surge');
      setIsSurging(res.data.isSurging);
      setSurgeMultiplier(res.data.surgeMultiplier);
      setSurgeMessage(res.data.message);
    } catch (e) {
      console.log('Error fetching surge status', e);
    }
  };

  const loadAddresses = async () => {
    try {
      const raw = await AsyncStorage.getItem(ADDRESSES_KEY);
      if (raw) {
        const addrs = JSON.parse(raw);
        setSavedAddresses(addrs);
        // Select home address by default
        const home = addrs.find((a: SavedAddress) => a.type === 'home');
        setSelectedAddress(home || addrs[0] || null);
      } else {
        // Default address
        const defaultAddr: SavedAddress = {
          id: 'default-home',
          title: 'Home',
          type: 'home',
          address: 'Road No. 12, Banjara Hills, Hyderabad',
          landmark: 'Near City Center Mall',
        };
        setSavedAddresses([defaultAddr]);
        setSelectedAddress(defaultAddr);
      }
    } catch (e) {
      console.log('Error loading addresses', e);
    }
  };

  const loadCart = async () => {
    setLoading(true);
    const data = await getCart();
    setCart(data);
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, delta: number) => {
    if (!cart) return;

    let updatedItems = cart.items.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: item.quantity + delta };
      }
      return item;
    }).filter(item => item.quantity > 0);

    if (updatedItems.length === 0) {
      await clearCart();
      setCart(null);
    } else {
      const updatedCart: StoredCart = {
        ...cart,
        items: updatedItems,
      };
      await saveCart(updatedCart);
      setCart(updatedCart);
    }
  };

  const handleClearCart = async () => {
    await clearCart();
    setCart(null);
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) return;
    router.push({
      pathname: '/checkout',
      params: {
        restaurantId: cart.restaurantId,
        cartData: JSON.stringify(cart.items),
      },
    });
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'KADAPA50') {
      setAppliedPromo('KADAPA50');
      setDiscountAmount(50);
    } else if (promoCode.toUpperCase() === 'WELCOME') {
      setAppliedPromo('WELCOME');
      setDiscountAmount(100);
    } else if (promoCode.toUpperCase() === 'HAPPIDO150') {
      setAppliedPromo('HAPPIDO150');
      setDiscountAmount(150);
    } else {
      setAppliedPromo(null);
      setDiscountAmount(0);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setDiscountAmount(0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const items = cart?.items || [];
  const hasQuick49 = items.some(item => item.isQuick49Item);

  const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Overrides for 20-min Quick49 store logic
  const baseDeliveryFee = hasQuick49 ? 20 : 40;
  let deliveryFee = items.length > 0 ? (hasQuick49 ? 20 : Math.round(baseDeliveryFee * surgeMultiplier)) : 0;
  let platformFee = items.length > 0 ? (hasQuick49 ? 10 : 5) : 0;
  const gstAmount = items.length > 0 ? Math.round(itemTotal * 0.05) : 0;
  
  // Quick49 orders waive GST for simplicity to keep the exact ₹49 flat price promise if it's purely a 49rs item cart
  const finalGst = hasQuick49 ? 0 : gstAmount;
  
  const grandTotal = Math.max(0, itemTotal + deliveryFee + platformFee + finalGst + deliveryTip - discountAmount);
  const totalSavings = discountAmount + (itemTotal > 199 && !hasQuick49 ? 30 : 0); // Free delivery logic disabled for fixed Quick49 economics

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
    // Fetch a real restaurant ID from the backend
    let restaurantId = 'happido-kitchen-1';
    let restaurantName = 'Happido Kitchen (Demo)';
    try {
      const res = await api.get('/restaurants');
      if (res.data && res.data.length > 0) {
        restaurantId = res.data[0]._id;
        restaurantName = res.data[0].name;
      }
    } catch {}
    const sampleCart = {
      restaurantId,
      restaurantName,
      items: [
        { id: 'sample-1', name: 'Hyderabadi Chicken Dum Biryani', price: 280, quantity: 1, isVeg: false },
        { id: 'sample-2', name: 'Butter Garlic Naan', price: 55, quantity: 2, isVeg: true },
        { id: 'sample-3', name: 'Gulab Jamun (2 Pcs)', price: 80, quantity: 1, isVeg: true },
      ],
    };
    await saveCart(sampleCart);
    setCart(sampleCart);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return 'home';
      case 'work': return 'business';
      default: return 'location';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Your Cart</Text>
          {items.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {cart?.restaurantName || 'Restaurant'} • {items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'}
            </Text>
          )}
        </View>
        {items.length > 0 ? (
          <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {items.length === 0 ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={54} color="#EA580C" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Good food is always cooking! Add delicious dishes from our curated restaurants.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.replace('/restaurants')}
          >
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              style={styles.browseGradient}
            >
              <Ionicons name="fast-food-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: '#FFF7ED',
              borderWidth: 1,
              borderColor: '#FFEDD5',
            }}
            onPress={handleAddSampleItems}
          >
            <Ionicons name="flash-outline" size={16} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={{ color: '#EA580C', fontWeight: '700', fontSize: 13 }}>+ Add Demo Items for Testing</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

          {/* Delivery Address Card with Edit */}
          <View>
            <TouchableOpacity style={styles.addressCard} onPress={() => setShowAddressModal(true)} activeOpacity={0.7}>
              <View style={styles.addressIconCircle}>
                <Ionicons name={getAddressIcon(selectedAddress?.type || 'home') as any} size={18} color="#EA580C" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.addressLabel}>Delivery to</Text>
                  <View style={styles.addressTypeBadge}>
                    <Text style={styles.addressTypeBadgeText}>{selectedAddress?.title || 'Home'}</Text>
                  </View>
                </View>
                <Text style={styles.addressText} numberOfLines={1}>
                  {selectedAddress?.address || 'Road No. 12, Banjara Hills, Hyderabad'}
                </Text>
              </View>
              <TouchableOpacity style={styles.changeAddressBtn} onPress={() => setShowAddressModal(true)}>
                <Text style={styles.changeAddressBtnText}>CHANGE</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Estimated Delivery Time */}
          <Animated.View entering={FadeInDown.delay(80)} style={styles.etaCard}>
            <View style={styles.etaIconRow}>
              <MaterialCommunityIcons name="clock-fast" size={18} color="#16A34A" />
              <Text style={styles.etaText}>Delivery in <Text style={{ fontWeight: '800', color: '#16A34A' }}>20-25 min</Text></Text>
            </View>
            <View style={styles.etaProgressBar}>
              <View style={styles.etaProgressFill} />
            </View>
            <View style={styles.etaSteps}>
              <Text style={styles.etaStepText}>Prep 7 min</Text>
              <Text style={styles.etaStepDot}>•</Text>
              <Text style={styles.etaStepText}>On the way 8 min</Text>
              <Text style={styles.etaStepDot}>•</Text>
              <Text style={styles.etaStepText}>Buffer 5 min</Text>
            </View>
          </Animated.View>

          {/* Restaurant Header Card */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.restaurantCard}>
            <View style={styles.restaurantIconCircle}>
              <Ionicons name="restaurant" size={18} color="#EA580C" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.restName}>{cart?.restaurantName || 'Happido Kitchen'}</Text>
              <Text style={styles.restSub}>Banjara Hills, Hyderabad • 2.3 km away</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/restaurant/${cart?.restaurantId}`)}>
              <Text style={{ color: '#EA580C', fontWeight: '700', fontSize: 12 }}>MENU →</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Cart Items List */}
          <Animated.View entering={FadeInDown.delay(150)} style={styles.itemsCard}>
            {items.map((item, index) => {
              const dishImg = getDishImageUrl(item.name, 'Main Course');
              return (
                <View
                  key={item.id || index}
                  style={[
                    styles.itemRow,
                    index < items.length - 1 && styles.itemBorder,
                  ]}
                >
                  {/* Veg / NonVeg Indicator */}
                  <View
                    style={[
                      styles.vegIndicator,
                      { borderColor: item.isVeg === false ? '#DC2626' : '#16A34A' },
                    ]}
                  >
                    <View
                      style={[
                        styles.vegIndicatorInner,
                        { backgroundColor: item.isVeg === false ? '#DC2626' : '#16A34A' },
                      ]}
                    />
                  </View>

                  {/* Info */}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                    {item.quantity > 1 && (
                      <Text style={styles.itemPriceEach}>₹{item.price} each</Text>
                    )}
                  </View>

                  {/* Stepper Buttons */}
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={14} color="#EA580C" />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={14} color="#EA580C" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Add more items link */}
            <TouchableOpacity 
              style={styles.addMoreRow}
              onPress={() => router.push(`/restaurant/${cart?.restaurantId}`)}
            >
              <Ionicons name="add-circle-outline" size={18} color="#EA580C" />
              <Text style={styles.addMoreText}>Add more items</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Cooking Instructions */}
          <Animated.View entering={FadeInDown.delay(170)}>
            <TouchableOpacity style={styles.instructionCard} onPress={() => setShowCookingModal(true)}>
              <MaterialCommunityIcons name="note-edit-outline" size={20} color="#64748B" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                {cookingInstruction ? (
                  <>
                    <Text style={styles.instructionLabel}>Cooking Instructions</Text>
                    <Text style={styles.instructionText} numberOfLines={1}>{cookingInstruction}</Text>
                  </>
                ) : (
                  <Text style={styles.instructionPlaceholder}>Add cooking instructions (optional)</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </Animated.View>

          {/* Cutlery Toggle */}
          <Animated.View entering={FadeInDown.delay(180)} style={styles.cutleryCard}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#64748B" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cutleryTitle}>Don't send cutlery</Text>
              <Text style={styles.cutlerySubtitle}>Help reduce plastic waste</Text>
            </View>
            <TouchableOpacity
              style={[styles.cutleryToggle, !wantCutlery && styles.cutleryToggleActive]}
              onPress={() => setWantCutlery(!wantCutlery)}
            >
              <View style={[styles.cutleryToggleDot, !wantCutlery && styles.cutleryToggleDotActive]} />
            </TouchableOpacity>
          </Animated.View>

          {/* Delivery Tip */}
          <Animated.View entering={FadeInDown.delay(190)} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipTitle}>Tip your delivery partner</Text>
              <Text style={styles.tipSubtitle}>Your tips go directly to them</Text>
            </View>
            <View style={styles.tipOptionsRow}>
              {tipOptions.map((tip) => (
                <TouchableOpacity
                  key={tip}
                  style={[
                    styles.tipOption,
                    deliveryTip === tip && styles.tipOptionActive,
                  ]}
                  onPress={() => setDeliveryTip(tip)}
                >
                  <Text style={[styles.tipOptionText, deliveryTip === tip && styles.tipOptionTextActive]}>
                    {tip === 0 ? 'Not now' : `₹${tip}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Promo Code Engine */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.promoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="ticket-percent-outline" size={22} color="#059669" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#0F172A', fontWeight: '600', ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) }}
                placeholder="Enter Promo Code"
                placeholderTextColor="#94A3B8"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
                editable={!appliedPromo}
              />
              {!appliedPromo ? (
                <TouchableOpacity onPress={handleApplyPromo} style={styles.applyBtn}>
                  <Text style={styles.applyBtnText}>APPLY</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleRemovePromo}>
                  <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 13 }}>REMOVE</Text>
                </TouchableOpacity>
              )}
            </View>
            {appliedPromo && (
              <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" style={{ marginRight: 6 }} />
                <Text style={{ color: '#059669', fontSize: 12, fontWeight: '700' }}>
                  '{appliedPromo}' applied! You're saving ₹{discountAmount}
                </Text>
              </View>
            )}
            {!appliedPromo && (
              <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['KADAPA50', 'WELCOME', 'HAPPIDO150'].map((code) => (
                  <TouchableOpacity key={code} style={styles.promoSuggestion} onPress={() => setPromoCode(code)}>
                    <Text style={styles.promoSuggestionText}>{code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Bill Summary */}
          <Animated.View entering={FadeInDown.delay(220)} style={styles.billCard}>
            <Text style={styles.sectionHeader}>Bill Details</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Total</Text>
              <Text style={styles.billValue}>₹{itemTotal}</Text>
            </View>
            <View style={styles.billRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                {isSurging && (
                  <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="flash" size={10} color="#EF4444" style={{ marginRight: 2 }} />
                    <Text style={{ fontSize: 10, color: '#EF4444', fontWeight: 'bold' }}>Surge {surgeMultiplier}x</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {itemTotal > 199 && (
                  <Text style={{ fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through', marginRight: 6 }}>₹{deliveryFee}</Text>
                )}
                <Text style={[styles.billValue, itemTotal > 199 && { color: '#16A34A' }]}>{itemTotal > 199 ? 'FREE' : `₹${deliveryFee}`}</Text>
              </View>
            </View>
            {isSurging && (
              <Text style={{ fontSize: 11, color: '#EF4444', marginBottom: 12, marginTop: -8 }}>
                {surgeMessage}
              </Text>
            )}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>GST & Charges</Text>
              <Text style={styles.billValue}>₹{finalGst + platformFee}</Text>
            </View>
            {deliveryTip > 0 && (
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Tip</Text>
                <Text style={styles.billValue}>₹{deliveryTip}</Text>
              </View>
            )}
            {appliedPromo && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: '#059669' }]}>Coupon Discount</Text>
                <Text style={[styles.billValue, { color: '#059669' }]}>- ₹{discountAmount}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.billRow}>
              <Text style={styles.totalLabel}>To Pay</Text>
              <Text style={styles.totalValue}>₹{grandTotal}</Text>
            </View>
            {totalSavings > 0 && (
              <View style={styles.savingsBanner}>
                <MaterialCommunityIcons name="party-popper" size={14} color="#059669" />
                <Text style={styles.savingsText}>You're saving ₹{totalSavings} on this order!</Text>
              </View>
            )}
          </Animated.View>

          {/* Cancellation Policy */}
          <Animated.View entering={FadeInDown.delay(250)} style={styles.policyCard}>
            <Text style={styles.policyTitle}>Cancellation Policy</Text>
            <Text style={styles.policyText}>
              Cancellation within 1 minute of order placement will result in full refund. After that, charges may apply as the restaurant starts preparing your food.
            </Text>
          </Animated.View>
        </ScrollView>
      )}

      {/* Floating Bottom Bar when items exist */}
      {items.length > 0 && (
        <Animated.View entering={SlideInDown.springify()} style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomTotalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.bottomTotalAmount}>₹{grandTotal}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutBtnText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Address Selection Inline Modal */}
      {showAddressModal && (
        <View style={styles.inlineModalOverlay}>
          <Pressable style={styles.inlineModalBackdrop} onPress={() => setShowAddressModal(false)} />
          <View style={styles.inlineModalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select delivery address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
              {savedAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressOption,
                    selectedAddress?.id === addr.id && styles.addressOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedAddress(addr);
                    setShowAddressModal(false);
                  }}
                >
                  <View style={[styles.addressOptionIcon, selectedAddress?.id === addr.id && { backgroundColor: '#FFF7ED' }]}>
                    <Ionicons name={getAddressIcon(addr.type) as any} size={20} color={selectedAddress?.id === addr.id ? '#EA580C' : '#64748B'} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.addressOptionTitle}>{addr.title}</Text>
                    <Text style={styles.addressOptionAddr} numberOfLines={2}>{addr.address}</Text>
                    {addr.landmark && <Text style={styles.addressOptionLandmark}>Near {addr.landmark}</Text>}
                  </View>
                  {selectedAddress?.id === addr.id && (
                    <Ionicons name="checkmark-circle" size={22} color="#EA580C" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.addNewAddressBtn}
              onPress={() => {
                setShowAddressModal(false);
                router.push('/add-address');
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#EA580C" />
              <Text style={styles.addNewAddressText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Cooking Instructions Inline Modal */}
      {showCookingModal && (
        <View style={styles.inlineModalOverlay}>
          <Pressable style={styles.inlineModalBackdrop} onPress={() => setShowCookingModal(false)} />
          <View style={styles.inlineModalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cooking Instructions</Text>
              <TouchableOpacity onPress={() => setShowCookingModal(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#64748B', fontSize: 13, marginBottom: 16 }}>
              The restaurant will try its best to follow your request
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {cookingSuggestions.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.cookingSuggestion, cookingInstruction === s && { borderColor: '#EA580C', backgroundColor: '#FFF7ED' }]}
                  onPress={() => setCookingInstruction(cookingInstruction === s ? '' : s)}
                >
                  <Text style={[styles.cookingSuggestionText, cookingInstruction === s && { color: '#EA580C' }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.cookingInput}
              placeholder="Write your instructions here..."
              placeholderTextColor="#94A3B8"
              value={cookingInstruction}
              onChangeText={setCookingInstruction}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.cookingSaveBtn} onPress={() => setShowCookingModal(false)}>
              <Text style={styles.cookingSaveBtnText}>Save Instructions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  clearBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  // Address Card
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressTypeBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  addressTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
    marginTop: 4,
  },
  changeAddressBtn: {
    borderWidth: 1,
    borderColor: '#EA580C',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changeAddressBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  // ETA Card
  etaCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  etaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  etaText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginLeft: 8,
  },
  etaProgressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  etaProgressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 2,
  },
  etaSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaStepText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  etaStepDot: {
    fontSize: 11,
    color: '#CBD5E1',
    marginHorizontal: 8,
  },
  // Restaurant Card
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  restaurantIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  restSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  // Items Card
  itemsCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vegIndicator: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  vegIndicatorInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 3,
  },
  itemPriceEach: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#EA580C',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EA580C',
    paddingHorizontal: 8,
  },
  addMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 4,
  },
  addMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA580C',
    marginLeft: 8,
  },
  // Instruction Card
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  instructionText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
    marginTop: 2,
  },
  instructionPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  // Cutlery
  cutleryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cutleryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  cutlerySubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  cutleryToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  cutleryToggleActive: {
    backgroundColor: '#16A34A',
  },
  cutleryToggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  cutleryToggleDotActive: {
    alignSelf: 'flex-end',
  },
  // Tip Card
  tipCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipHeader: {
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  tipSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  tipOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipOptionActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  tipOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tipOptionTextActive: {
    color: '#EA580C',
  },
  // Promo Card
  promoCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  applyBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  applyBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  promoSuggestion: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderStyle: 'dashed' as any,
  },
  promoSuggestionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  // Bill Card
  billCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#EA580C',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 6,
  },
  // Policy Card
  policyCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  policyText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' },
      default: { elevation: 10 },
    }),
  },
  bottomTotalLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomTotalAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  checkoutBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    fontWeight: '700',
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
  browseButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  browseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  // Inline Modal Styles (stays within phone frame)
  inlineModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'flex-end',
  },
  inlineModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  inlineModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
    zIndex: 10000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  // Address Option
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  addressOptionActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  addressOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  addressOptionAddr: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  addressOptionLandmark: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  addNewAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EA580C',
    borderStyle: 'dashed' as any,
    marginTop: 8,
  },
  addNewAddressText: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  // Cooking Modal
  cookingSuggestion: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cookingSuggestionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  cookingInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 80,
    marginBottom: 16,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  cookingSaveBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cookingSaveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
