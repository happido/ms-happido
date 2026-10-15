import LottieView from 'lottie-react-native';
import React, { useEffect, useState, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, SafeAreaView, Image, Platform } from "react-native";
import { useRouter, Redirect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, FadeInRight, SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import api from '@/utils/api';
import { getDishImageUrl } from '@/utils/foodImages';
import HorizontalRestaurantCard from '@/components/HorizontalRestaurantCard';
import BloodEmergencyModal from '@/components/BloodEmergencyModal';
import { getCartItemCount, addToCart } from '@/utils/cartHelper';
import { useGlobalState } from '@/context/GlobalContext';
import * as LocationService from 'expo-location';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { VoiceSearchModal } from '@/components/VoiceSearchModal';

const { width } = Dimensions.get('window');

const PROMO_OFFERS = [
  {
    id: 'promo-1',
    title: '50% OFF',
    subtitle: 'Up to ₹100 on Food & Biryani',
    code: 'HAPPIDO50',
    colors: ['#EA580C', '#C2410C'],
    tag: 'MEGA DEAL',
  },
  {
    id: 'promo-2',
    title: 'FREE RIDE',
    subtitle: '100% off your first bike ride',
    code: 'FIRSTFREE',
    colors: ['#059669', '#047857'],
    tag: 'NEW USERS',
  },
  {
    id: 'promo-3',
    title: 'HERO REWARD',
    subtitle: '₹150 credits for blood donors',
    code: 'LIFESAVER',
    colors: ['#DC2626', '#991B1B'],
    tag: 'HERO REWARD',
  },
];

const QUICK_REORDER_ITEMS = [
  {
    id: 'qr-1',
    name: 'Dum Chicken Biryani',
    restaurant: 'Happido Kitchen',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300',
    isVeg: false,
  },
  {
    id: 'qr-2',
    name: 'Paneer Butter Masala',
    restaurant: 'Punjab Grill',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300',
    isVeg: true,
  },
  {
    id: 'qr-3',
    name: 'Classic Smash Burger',
    restaurant: 'Burger Lounge',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
    isVeg: false,
  },
  {
    id: 'qr-4',
    name: 'Caramel Cold Brew',
    restaurant: 'Brew Station',
    price: 129,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300',
    isVeg: true,
  },
];

export default function Index() {
  const [splashFinished, setSplashFinished] = useState(false);
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'onboarding'>('checking');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [bloodAlert, setBloodAlert] = useState<any>(null);
  const [promoToast, setPromoToast] = useState<string | null>(null);
  const { isListening, spokenText, startVoiceSearch, stopVoiceSearch } = useVoiceSearch();

  const {
    userName, setUserName,
    userEmail, setUserEmail,
    userPhone, setUserPhone,
    cartCount, setCartCount,
    showProfileModal, setShowProfileModal,
    showNotificationModal, setShowNotificationModal,
    showLocationModal, setShowLocationModal,
    showSubscriptionModal, setShowSubscriptionModal,
    selectedLocation, setSelectedLocation,
    userCoords, setUserCoords,
    isVIP, setIsVIP,
    showAICopilot, setShowAICopilot,
    assistiveTouchEnabled, setAssistiveTouchEnabled,
    activeOrder, setActiveOrder,
    setNewGlobalNotification
  } = useGlobalState();

  const isDesktop = width > 768;

  useEffect(() => {
    const loadAssistivePref = async () => {
      try {
        const saved = await AsyncStorage.getItem('happido_assistive_touch_enabled');
        if (saved !== null) {
          setAssistiveTouchEnabled(JSON.parse(saved));
        }
      } catch (e) {
        // default true
      }
    };
    loadAssistivePref();
  }, []);

  // Auto-detect location on app load
  useEffect(() => {
    const autoDetectLocation = async () => {
      try {
        const savedLocation = await AsyncStorage.getItem('lastKnownLocation');
        if (savedLocation) {
          setSelectedLocation(savedLocation);
          // Try to get coords from default address if available, else just use default coords for now
          // (A more robust implementation would save lastKnownCoords as well)
          setUserCoords({ lat: 14.4673, lng: 78.8242 });
          return;
        }

        let { status } = await LocationService.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setSelectedLocation('Kadapa, Andhra Pradesh');
          setUserCoords({ lat: 14.4673, lng: 78.8242 });
          return;
        }

        let location = await LocationService.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        let addressString = '';
        const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (googleApiKey) {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
            );
            const data = await response.json();
            if (data.status === 'OK' && data.results.length > 0) {
              const result = data.results[0];
              let route = '';
              let neighborhood = '';
              let city = '';
              
              result.address_components.forEach((comp: any) => {
                if (comp.types.includes('route')) route = comp.long_name;
                if (comp.types.includes('neighborhood') || comp.types.includes('sublocality')) neighborhood = comp.long_name;
                if (comp.types.includes('locality')) city = comp.long_name;
              });

              const addressComponents = [route, neighborhood, city].filter(Boolean);
              const uniqueAddressComponents = addressComponents.filter((item, pos, arr) => {
                return pos === 0 || item !== arr[pos - 1];
              });
              
              addressString = uniqueAddressComponents.join(', ') || result.formatted_address;
            }
          } catch (e) {
            console.log('Google Maps Geocoding failed, falling back to OSM');
          }
        }

        // Web fallback: OpenStreetMap Nominatim API
        if (!addressString) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'User-Agent': 'HappidoApp/1.0' } }
            );
            const data = await response.json();
            if (data?.address) {
              const addr = data.address;
              const street = addr.road || addr.pedestrian || addr.street;
              const area = addr.neighbourhood || addr.suburb || addr.hamlet || addr.residential;
              
              const addressComponents = [
                street,
                area,
                addr.city || addr.town || addr.village,
                addr.state
              ].filter(Boolean);

              const uniqueAddressComponents = addressComponents.filter((item, pos, arr) => {
                return pos === 0 || item !== arr[pos - 1];
              });

              addressString = uniqueAddressComponents.join(', ');
            }
          } catch (e) {
            console.log('Nominatim fallback failed');
          }
        }

        setSelectedLocation(addressString ? `Current Location • ${addressString}` : 'Unknown Location');
        setUserCoords({ lat: latitude, lng: longitude });
      } catch (error) {
        console.log('Auto location detection failed:', error);
        setSelectedLocation('Kadapa, Andhra Pradesh');
        setUserCoords({ lat: 14.4673, lng: 78.8242 });
      }
    };
    autoDetectLocation();
  }, []);

  const handleToggleAssistiveTouch = async (val: boolean) => {
    setAssistiveTouchEnabled(val);
    try {
      await AsyncStorage.setItem('happido_assistive_touch_enabled', JSON.stringify(val));
    } catch (e) {
      console.log('Error saving assistive touch preference', e);
    }
  };

  const handleApplyPromo = (code: string, title: string) => {
    setPromoToast(`🎉 ${code} Applied! ${title}`);
    setTimeout(() => setPromoToast(null), 3000);
  };

  const handleQuickAdd = async (item: typeof QUICK_REORDER_ITEMS[0]) => {
    const updatedCount = await addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
      isVeg: item.isVeg,
    });
    setCartCount(updatedCount);
    setPromoToast(`Added ${item.name} to Cart 🛒`);
    setTimeout(() => setPromoToast(null), 2500);
  };

  const handleAcceptBloodRequest = async (requestId: string) => {
    try {
      await api.put(`/blood/${requestId}/accept`);
      Alert.alert('Thank You', 'You have accepted this blood request. A coordinator will contact you shortly.', [{ text: 'OK' }]);
      setBloodAlert(null);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to accept blood request');
    }
  };

  useEffect(() => {
    const updateCartCount = async () => {
      const count = await getCartItemCount();
      setCartCount(count);
    };
    updateCartCount();
    const interval = setInterval(updateCartCount, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let newSocket: Socket;
    if (authStatus === 'authenticated') {
      newSocket = io('http://localhost:5005');
      newSocket.on('urgentBloodRequest', (request) => {
        setBloodAlert(request);
      });
      newSocket.on('orderStatusUpdate', (updatedOrder) => {
        if (updatedOrder.status === 'dispatched') {
          setNewGlobalNotification({
            id: 'n-' + Date.now(),
            type: 'order',
            title: 'Your Order is on the way! 🛵',
            message: `Order #${updatedOrder._id.slice(-6).toUpperCase()} has been picked up by the delivery partner.`,
            time: 'Just now',
            read: false
          });
        } else if (updatedOrder.status === 'accepted') {
          setNewGlobalNotification({
            id: 'n-' + Date.now(),
            type: 'order',
            title: 'Order Accepted! 🍳',
            message: `The restaurant has started preparing your order #${updatedOrder._id.slice(-6).toUpperCase()}.`,
            time: 'Just now',
            read: false
          });
        }
      });
    }
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [authStatus]);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        if (authStatus === 'authenticated') {
          const res = await api.get('/orders/customer');
          if (res.data && res.data.length > 0) {
            const active = res.data.find((o: any) => o.status !== 'delivered' && o.status !== 'cancelled');
            if (active) {
              setActiveOrder({
                id: active._id,
                restaurantName: active.restaurant?.restaurantName || active.restaurant?.name || 'Happido Kitchen',
                items: `${active.items?.length || 1} Items`,
                status: active.status,
                amount: active.grandTotal || active.totalAmount,
                eta: active.status === 'accepted' ? '25 mins' : active.status === 'preparing' ? '18 mins' : active.status === 'ready_for_pickup' ? '10 mins' : active.status === 'picked_up' ? '5 mins' : '30 mins',
                subStatus: 'Live Tracking'
              });
            } else {
              setActiveOrder(null);
            }
          } else {
            setActiveOrder(null);
          }
        }
      } catch (err) {
        console.log('Failed to fetch active orders', err);
        setActiveOrder(null);
      }
    };
    
    fetchActiveOrders();
    
    let orderInterval: any;
    if (authStatus === 'authenticated') {
       orderInterval = setInterval(fetchActiveOrders, 10000); // poll every 10s as a fallback
    }
    return () => {
      if (orderInterval) clearInterval(orderInterval);
    };
  }, [authStatus]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedName = await AsyncStorage.getItem('userName');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedPhone = await AsyncStorage.getItem('userPhone');
        
        if (storedName) setUserName(storedName);
        if (storedEmail) setUserEmail(storedEmail);
        if (storedPhone) setUserPhone(storedPhone);
        
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          setAuthStatus('onboarding');
        } else if (!token) {
          setAuthStatus('unauthenticated');
        } else {
          setAuthStatus('authenticated');
        }
      } catch (e) {
        setAuthStatus('unauthenticated');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!userCoords) return; // wait for location to be detected
      try {
        const response = await api.get('/restaurants', {
          params: { lat: userCoords.lat, lng: userCoords.lng, isVIP }
        });
        setRestaurants(response.data.slice(0, 5)); // Just show top 5
      } catch (error) {
        console.log('Error fetching restaurants', error);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    if (authStatus === 'authenticated') {
      fetchRestaurants();
    }
  }, [authStatus, userCoords, isVIP]);

  
  // Zomato-Style Algorithmic Notification Engine
  useEffect(() => {
    if (authStatus === 'authenticated' && Platform.OS === 'web' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Simulate the algorithmic engine triggering a context-aware push notification based on time of day
          const currentHour = new Date().getHours();
          let title = "Craving something?";
          let body = "Open Happido to find the best spots around you.";
          let iconUrl = "https://happido-assets.s3.amazonaws.com/icons/default.png";

          if (currentHour >= 11 && currentHour <= 15) {
             title = "Hungry, maheer? 🤤";
             body = "It's Lunch time! Make your lunch happy with Happido today. Grab a piping hot Biryani now! 🥘";
             iconUrl = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop";
          } else if (currentHour >= 19 && currentHour <= 23) {
             title = "Dinner time is here! 🌙";
             body = "Skip the cooking tonight. Order a premium dinner from your favorite local spots on Happido. 🍕";
             iconUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop";
          } else if (currentHour >= 7 && currentHour <= 10) {
             title = "Morning fuel! ☕";
             body = "Start your day right with a crispy Ghee Roast Dosa and Filter Coffee. Delivered in 15 mins!";
             iconUrl = "https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?w=200&h=200&fit=crop";
          }

          // Simulate notification arriving 5 seconds after app opens
          setTimeout(() => {
            new Notification(title, {
              body: body,
              icon: iconUrl,
              requireInteraction: true
            });
          }, 5000);
        }
      });
    }
  }, [authStatus]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    router.replace('/login');
  };

  if (authStatus === 'checking') {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

    if (authStatus === 'onboarding') {
    return <Redirect href="/onboarding" />;
  }

  if (authStatus === 'unauthenticated') {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* CUSTOMER BLOOD EMERGENCY TOAST */}
      {bloodAlert && (
        <Animated.View entering={SlideInUp} exiting={SlideOutUp} style={styles.toastContainer}>
          <View style={styles.toastSiren}>
            <Ionicons name="water" size={24} color="#FFF" />
          </View>
          <View style={styles.toastContent}>
            <Text style={styles.toastTitle}>Urgent {bloodAlert.bloodGroup} Blood Needed</Text>
            <Text style={styles.toastSub}>{bloodAlert.urgency} • Requested by {bloodAlert.requesterName || 'a patient'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/blood-request')}>
            <Text style={styles.toastActionText}>View</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>

        


        {/* Premium Search Bar Mockup */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <TouchableOpacity 
            style={styles.searchContainer}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
            <Text style={styles.searchText}>Search for Food, Rides, or Blood...</Text>
            <TouchableOpacity style={styles.micButton} onPress={startVoiceSearch}>
               <Ionicons name="mic" size={16} color="#EA580C" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>

        {/* Apple Intelligence AI Copilot Hero Banner */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity
            style={styles.aiHeroBanner}
            onPress={() => setShowAICopilot(true)}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#FB923C', '#EA580C', '#C2410C']}
              style={styles.aiHeroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.aiHeroLeft}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.aiHeroTitle}>Happido AI Copilot</Text>
                    <View style={styles.aiHeroTag}>
                      <Text style={styles.aiHeroTagText}>CLINICAL AI</Text>
                    </View>
                  </View>
                  <Text style={styles.aiHeroSub}>Diet & Patient Meals • 1-Click Auto-Cart</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Access Services - Grid */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <View style={styles.servicesGrid}>
            <TouchableOpacity style={styles.serviceItem} onPress={() => router.push('/restaurants')}>
              <View style={[styles.serviceIconContainer, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="fast-food" size={22} color="#EA580C" />
              </View>
              <Text style={styles.serviceText}>Food</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} onPress={() => router.push('/map')}>
              <View style={[styles.serviceIconContainer, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="car-sport" size={22} color="#16A34A" />
              </View>
              <Text style={styles.serviceText}>Ride</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} onPress={() => router.push('/blood-request')}>
              <View style={[styles.serviceIconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="water" size={22} color="#DC2626" />
              </View>
              <Text style={styles.serviceText}>Blood</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.serviceItem} onPress={() => {}}>
              <View style={[styles.serviceIconContainer, { backgroundColor: '#F8FAFC' }]}>
                <Ionicons name="ellipsis-horizontal" size={22} color="#64748B" />
              </View>
              <Text style={styles.serviceText}>More</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ACTIVE ORDERS - IN THE MIDDLE */}
        {activeOrder && (
          <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.activeOrderContainer}>
            <View style={styles.activeOrderCard}>
              <View style={styles.activeOrderHeader}>
                <View style={styles.liveBadge}>
                  <View style={styles.pulsingDot} />
                  <Text style={styles.liveBadgeText}>ACTIVE ORDER</Text>
                </View>
                <Text style={styles.etaText}>Arriving in {activeOrder.eta}</Text>
              </View>

              <View style={styles.activeOrderBody}>
                <View style={styles.activeOrderIconCircle}>
                  <Ionicons name="fast-food" size={22} color="#EA580C" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.activeRestName}>{activeOrder.restaurantName}</Text>
                  <Text style={styles.activeItemsText} numberOfLines={1}>{activeOrder.items}</Text>
                  <Text style={styles.activeStatusText}>
                    <Ionicons name="bicycle" size={13} color="#16A34A" /> {activeOrder.status} • {activeOrder.subStatus}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={['#F97316', '#EA580C']}
                  style={[styles.progressBarFill, { width: '65%' }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>

              <View style={styles.activeOrderFooter}>
                <Text style={styles.activeOrderTotal}>Total: ₹{activeOrder.amount}</Text>
                <TouchableOpacity
                  style={styles.trackLiveBtn}
                  onPress={() => router.push(`/tracking/${activeOrder.id}`)}
                >
                  <Text style={styles.trackLiveText}>Track Live</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Hot Offers & Deals Carousel */}
        <Animated.View entering={FadeInDown.delay(280).springify()} style={styles.promoSection}>
          <View style={styles.sectionHeaderNoPad}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="pricetag" size={18} color="#EA580C" />
              <Text style={styles.sectionTitleHeader}>Hot Offers & Vouchers</Text>
            </View>
            <Text style={styles.swipeHint}>Swipe ➔</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoScroll}>
            {PROMO_OFFERS.map((promo) => (
              <TouchableOpacity
                key={promo.id}
                activeOpacity={0.88}
                style={styles.promoCard}
                onPress={() => handleApplyPromo(promo.code, promo.title)}
              >
                <LinearGradient
                  colors={promo.colors as any}
                  style={styles.promoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>{promo.tag}</Text>
                  </View>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  <Text style={styles.promoSub}>{promo.subtitle}</Text>
                  <View style={styles.promoCodeRow}>
                    <View style={styles.promoCodePill}>
                      <Ionicons name="ticket-outline" size={12} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.promoCodeText}>{promo.code}</Text>
                    </View>
                    <View style={styles.applyBtnPill}>
                      <Text style={styles.applyBtnText}>TAP TO APPLY</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Ride Quick Action */}
        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleHeader}>Where to?</Text>
            <TouchableOpacity onPress={() => router.push('/map')}>
              <Text style={styles.seeAllText}>Book Ride</Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 16, marginBottom: 20, flexDirection: 'row', gap: 10 }}>
             <TouchableOpacity style={styles.rideCard} onPress={() => router.push('/map')}>
               <Ionicons name="bicycle" size={24} color="#16A34A" />
               <Text style={styles.rideCardTitle}>Bike</Text>
               <Text style={styles.rideCardSub}>₹20 • 2 min</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.rideCard} onPress={() => router.push('/map')}>
               <Ionicons name="car" size={24} color="#16A34A" />
               <Text style={styles.rideCardTitle}>Auto</Text>
               <Text style={styles.rideCardSub}>₹40 • 4 min</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.rideCard} onPress={() => router.push('/map')}>
               <Ionicons name="car-sport" size={24} color="#16A34A" />
               <Text style={styles.rideCardTitle}>Cab</Text>
               <Text style={styles.rideCardSub}>₹80 • 5 min</Text>
             </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Trending Restaurants */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleHeader}>Trending Food Near You</Text>
            <TouchableOpacity onPress={() => router.push('/restaurants')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loadingRestaurants ? (
            <ActivityIndicator color="#EA580C" style={{ marginTop: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {restaurants.map((item, index) => (
                <Animated.View key={item._id} entering={FadeInRight.delay(500 + index * 100).springify()}>
                  <TouchableOpacity 
                    style={styles.trendingCard}
                    onPress={() => router.push(`/restaurant/${item._id}` as any)}
                  >
                    <Image
                      source={{ uri: item.imageUrl || getDishImageUrl(item.restaurantName, 'Biryani') }}
                      style={styles.trendingImage}
                      resizeMode="cover"
                    />
                    <View style={styles.trendingInfo}>
                      <Text style={styles.trendingName} numberOfLines={1}>{item.restaurantName}</Text>
                      <View style={styles.trendingMetaRow}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.trendingRating}>{item.rating || '4.5'}</Text>
                        <Text style={styles.trendingDot}>•</Text>
                        <Text style={styles.trendingTime}>{item.time || '30 mins'}</Text>
                      </View>
                      <Text style={styles.trendingType} numberOfLines={1}>{item.type || 'North Indian, Fast Food'}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Urgent Blood Requests */}
        {bloodAlert && (
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleHeader}>Urgent Blood Requests</Text>
              <TouchableOpacity onPress={() => router.push('/blood-request')}>
                <Text style={[styles.seeAllText, { color: '#DC2626' }]}>Donate</Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <TouchableOpacity style={styles.bloodAlertCard} onPress={() => router.push('/blood-request')}>
                 <View style={styles.bloodTypeBadge}>
                   <Text style={styles.bloodTypeText}>{bloodAlert.bloodGroup || 'O+'}</Text>
                 </View>
                 <View style={{ flex: 1, marginLeft: 16 }}>
                   <Text style={styles.bloodHospital}>{bloodAlert.hospitalName || 'Local Hospital'}</Text>
                   <Text style={styles.bloodDistance}>Need {bloodAlert.units || 1} units</Text>
                   <Text style={styles.bloodUrgency}>CRITICAL - NEEDED IMMEDIATELY</Text>
                 </View>
                 <Ionicons name="chevron-forward" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

      </ScrollView>

      {promoToast && (
        <Animated.View entering={SlideInUp.duration(400)} exiting={SlideOutUp.duration(300)} style={styles.promoToast}>
          <Ionicons name="gift" size={18} color="#EA580C" />
          <Text style={styles.promoToastText}>{promoToast}</Text>
        </Animated.View>
      )}

      <VoiceSearchModal visible={isListening} spokenText={spokenText} onClose={stopVoiceSearch} />

      {/* Blood Emergency Modal */}
      <BloodEmergencyModal
        visible={!!bloodAlert}
        request={bloodAlert}
        onAccept={handleAcceptBloodRequest}
        onClose={() => setBloodAlert(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '700',
    marginHorizontal: 4,
  },
  greeting: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '600',
  },
  userName: {
    fontWeight: '800',
    color: '#EA580C',
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF7ED',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  notifHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#DC2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  aiHeroBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  aiHeroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  aiHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiHeroOrb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiHeroTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  aiHeroTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  aiHeroTagText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  aiHeroSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  activeOrderContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  activeOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EA580C',
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  activeOrderBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeOrderIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeRestName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeItemsText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  activeStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 3,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  activeOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  activeOrderTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  trackLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  trackLiveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // PROMO OFFERS STYLES
  promoSection: {
    marginBottom: 24,
  },
  sectionHeaderNoPad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  swipeHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  promoScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  promoCard: {
    width: 260,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  promoGradient: {
    padding: 16,
    height: 130,
    justifyContent: 'space-between',
  },
  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  promoSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  promoCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  promoCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  promoCodeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  applyBtnPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  applyBtnText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
  },
  promoToast: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 9999,
  },
  promoToastText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    marginBottom: 30,
  },
  searchText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  serviceItem: {
    alignItems: 'center',
    flex: 1,
  },
  serviceIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  // QUICK REORDER STYLES
  reorderSection: {
    marginBottom: 24,
  },
  reorderScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  reorderCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reorderImg: {
    width: '100%',
    height: 90,
    backgroundColor: '#F1F5F9',
  },
  reorderBody: {
    padding: 10,
  },
  vegBadge: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reorderItemName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  reorderRestName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  reorderPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reorderPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickAddBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickAddText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '900',
  },

  // FLOATING BOTTOM CART PILL
  floatingCartContainer: {
    position: 'absolute',
    bottom: 68,
    left: 16,
    right: 16,
    zIndex: 998,
    ...Platform.select({
      web: {
        maxWidth: 468,
        alignSelf: 'center',
        left: '50%',
        transform: [{ translateX: -234 }],
      },
    }),
  },
  floatingCartPill: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cartCountCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  cartCountCircleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  floatingCartTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  floatingCartSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  floatingCartAction: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  trendingScroll: {
    paddingHorizontal: 12,
  },
  trendingCard: {
    width: 150,
    marginLeft: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  trendingImage: {
    width: '100%',
    height: 95,
    backgroundColor: '#F1F5F9',
  },
  trendingInfo: {
    padding: 10,
  },
  trendingName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  trendingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  trendingRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 4,
  },
  trendingDot: {
    fontSize: 13,
    color: '#94A3B8',
    marginHorizontal: 6,
  },
  trendingTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  trendingType: {
    fontSize: 11,
    color: '#94A3B8',
  },
  rideCard: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  rideCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14532D',
    marginTop: 8,
    marginBottom: 2,
  },
  rideCardSub: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  bloodAlertCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  bloodTypeBadge: {
    width: 50,
    height: 50,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodTypeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
  },
  bloodHospital: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  bloodDistance: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  bloodUrgency: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  
  // TOAST STYLES
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  toastSiren: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  toastSub: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  toastActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
    marginLeft: 12,
  },
});
