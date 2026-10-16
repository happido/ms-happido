import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import api from '../../utils/api';
import { loadMapplsSDK } from '../../utils/mappls';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
// Google Maps removed in favor of Mappls
// ─── TYPES ──────────────────────────────────────────────────
interface RiderLocation {
  latitude: number;
  longitude: number;
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function TrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(18);
  const socketRef = useRef<Socket | null>(null);

  const [mapplsLoaded, setMapplsLoaded] = useState(false);
  const directionPluginRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  // Dynamically load Mappls Web SDK
  useEffect(() => {
    if (Platform.OS === 'web') {
      loadMapplsSDK(['direction']).then((loaded) => {
        if (loaded) setMapplsLoaded(true);
      });
    }
  }, []);

  // Memoize center to prevent aggressive map snapping on every ETA timer tick
  const initialCenter = useMemo(() => ({
    lat: order?.deliveryLocation?.coordinates?.[1] || 17.4400,
    lng: order?.deliveryLocation?.coordinates?.[0] || 78.4700
  }), [order?.deliveryLocation?.coordinates]);

  // Pulsing animation for the live dot
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
      ),
      -1, true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1, true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // ─── Fetch Order ──────────────────────────────────────────
  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
      if (response.data.status === 'delivered') {
        router.replace('/success');
      }
    } catch (error) {
      console.log('Error fetching order', error);
      // Remove mock order fallback to ensure real location tracking
      console.warn('Failed to load order. Real location tracking requires a valid order.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Socket.IO Setup for Real-Time Updates ───────────────
  useEffect(() => {
    fetchOrder();

    const setupSocket = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const socket = io('http://localhost:5005');
        socketRef.current = socket;

        socket.emit('joinRoom', userId);

        // Listen for order status updates
        socket.on('orderStatusUpdate', (updatedOrder) => {
          if (updatedOrder._id === id) {
            setOrder(updatedOrder);

            // Update ETA based on status
            if (updatedOrder.status === 'accepted') setEstimatedTime(25);
            else if (updatedOrder.status === 'preparing') setEstimatedTime(18);
            else if (updatedOrder.status === 'ready') setEstimatedTime(10);
            else if (updatedOrder.status === 'ready_for_pickup') setEstimatedTime(8);
            else if (updatedOrder.status === 'arrived_at_restaurant') setEstimatedTime(6);
            else if (updatedOrder.status === 'dispatched') setEstimatedTime(5);
            else if (updatedOrder.status === 'picked_up') setEstimatedTime(5);
            else if (updatedOrder.status === 'delivered') {
              router.replace('/success');
            }
          }
        });

        // Listen for order cancellations
        socket.on('orderCancelled', (cancelledOrder) => {
          if (cancelledOrder._id === id) {
            setOrder(cancelledOrder);
          }
        });

        // 🔴 REAL-TIME RIDER LOCATION via Socket.IO
        socket.on('riderLocationUpdate', (data: { riderId: string; location: RiderLocation }) => {
          setRiderLocation(data.location);
          // Decrease ETA slightly with each location update (simulate approach)
          setEstimatedTime(prev => Math.max(1, prev - 0.2));
        });
      }
    };

    setupSocket();

    // Countdown ETA timer
    const etaInterval = setInterval(() => {
      setEstimatedTime(prev => {
        if (prev <= 1) return 1;
        return prev - (1 / 60); // Decrease by 1 second each interval
      });
    }, 1000);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      clearInterval(etaInterval);
    };
  }, [id]);

  // ─── Initialize Mappls Map and Routing ───────────────────
  useEffect(() => {
    if (Platform.OS === 'web' && mapplsLoaded && initialCenter && !mapRef.current) {
      const initMap = () => {
        const container = document.getElementById('mappls-map-container');
        if (container) {
          // @ts-ignore
          mapRef.current = new window.mappls.Map(container, {
            center: [initialCenter.lat, initialCenter.lng],
            zoom: 14,
            zoomControl: false,
            fullscreenControl: false,
            scrollZoom: true,
            backgroundColor: '#F1F5F9'
          });
        } else {
          setTimeout(initMap, 100);
        }
      };
      initMap();
    }
  }, [mapplsLoaded, initialCenter]);

  const previousStatusRef = useRef<string>('');

  // Draw or Update Route using Mappls Direction Plugin
  useEffect(() => {
    if (Platform.OS === 'web' && mapplsLoaded && mapRef.current && riderLocation && order?.deliveryLocation?.coordinates) {
      const isPrePickup = ['accepted', 'preparing', 'ready', 'ready_for_pickup', 'arrived_at_restaurant'].includes(order.status);
      const destination = isPrePickup && order.restaurant?.location?.coordinates
        ? { lat: order.restaurant.location.coordinates[1], lng: order.restaurant.location.coordinates[0], label: 'Restaurant' }
        : { lat: order.deliveryLocation.coordinates[1], lng: order.deliveryLocation.coordinates[0], label: 'Home' };

      // Clear the previous route if order status transitioned from pre-pickup to dispatched
      if (previousStatusRef.current && ['ready_for_pickup', 'arrived_at_restaurant'].includes(previousStatusRef.current) && order.status === 'dispatched') {
        if (directionPluginRef.current) {
          try {
             // @ts-ignore
             directionPluginRef.current.remove();
          } catch(e) {}
        }
        directionPluginRef.current = null;
      }
      previousStatusRef.current = order.status;

      if (!directionPluginRef.current) {
        // @ts-ignore
        window.mappls.direction({
          map: mapRef.current,
          start: { label: 'Rider', geoposition: `${riderLocation.latitude},${riderLocation.longitude}` },
          end: { label: destination.label, geoposition: `${destination.lat},${destination.lng}` },
          Profile: ['biking'],
          divId: 'mappls-direction-ui',
          start_icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png', // Transparent 1x1 pixel to completely hide the start icon
          end_icon: isPrePickup ? 'https://cdn-icons-png.flaticon.com/128/3170/3170733.png' : 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3e0.png'
        }, function(data: any) {
           directionPluginRef.current = data;
        });
      }

      // Draw custom Rider marker since direction plugin uses default pins
      // @ts-ignore
      if (!window.riderMarker) {
        // @ts-ignore
        window.riderMarker = new window.mappls.Marker({
          map: mapRef.current,
          position: { lat: riderLocation.latitude, lng: riderLocation.longitude },
          html: '<div style="font-size: 28px;">🛵</div>',
          offset: [0, -14]
        });
        // @ts-ignore
        window.riderMarkerPos = { lat: riderLocation.latitude, lng: riderLocation.longitude };
      } else {
        // @ts-ignore
        const currentPos = window.riderMarkerPos;
        const targetPos = { lat: riderLocation.latitude, lng: riderLocation.longitude };
        
        // Cancel any existing animation frame
        // @ts-ignore
        if (window.riderMarkerAnimFrame) cancelAnimationFrame(window.riderMarkerAnimFrame);
        
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (time: number) => {
          const elapsed = time - startTime;
          // Use easeOutCubic for smooth deceleration
          const t = Math.min(elapsed / duration, 1);
          const progress = 1 - Math.pow(1 - t, 3);
          
          const currentLat = currentPos.lat + (targetPos.lat - currentPos.lat) * progress;
          const currentLng = currentPos.lng + (targetPos.lng - currentPos.lng) * progress;
          
          // @ts-ignore
          window.riderMarker.setPosition({ lat: currentLat, lng: currentLng });
          // @ts-ignore
          window.riderMarkerPos = { lat: currentLat, lng: currentLng };
          
          if (progress < 1) {
            // @ts-ignore
            window.riderMarkerAnimFrame = requestAnimationFrame(animate);
          }
        };
        // @ts-ignore
        window.riderMarkerAnimFrame = requestAnimationFrame(animate);
      }

      // Fit bounds manually to ensure we see the whole route
      try {
        // @ts-ignore
        const bounds = new window.mappls.LatLngBounds();
        // @ts-ignore
        bounds.extend(new window.mappls.LatLng(riderLocation.latitude, riderLocation.longitude));
        // @ts-ignore
        bounds.extend(new window.mappls.LatLng(destination.lat, destination.lng));
        mapRef.current.fitBounds(bounds, { padding: 60 });
      } catch(e) {}
    }
  }, [mapplsLoaded, riderLocation, order?.deliveryLocation?.coordinates, order?.status]);

  // Dynamically set rider location close to delivery location if we don't have a real one
  useEffect(() => {
    // Force hide Mappls logo and watermarks via injected stylesheet
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleEl = document.createElement('style');
      styleEl.id = 'mappls-hide-watermark';
      styleEl.innerHTML = `
        .mapboxgl-ctrl-bottom-left,
        .mapboxgl-ctrl-bottom-right,
        .maplibregl-ctrl-bottom-left,
        .maplibregl-ctrl-bottom-right,
        .mmi-logo,
        .mapboxgl-ctrl-logo,
        .maplibregl-ctrl-logo,
        .mapboxgl-ctrl-attrib,
        .maplibregl-ctrl-attrib,
        .mmiDri,
        .mmiDriContainer,
        [id^="DrS_"],
        [id^="DrE_"],
        .mmiDriRoute {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          z-index: -9999 !important;
        }
      `;
      if (!document.getElementById('mappls-hide-watermark')) {
        document.head.appendChild(styleEl);
      }
    }

    if (order?.deliveryLocation?.coordinates && !riderLocation) {
      // Offset by roughly ~1.5km for a realistic delivery view
      setRiderLocation({
        latitude: order.deliveryLocation.coordinates[1] - 0.012,
        longitude: order.deliveryLocation.coordinates[0] - 0.012
      });
    }
  }, [order?.deliveryLocation?.coordinates]);

  // ─── LOADING STATE ────────────────────────────────────────
  if (loading || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.loadingText}>Loading tracking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── STATUS STEPS ─────────────────────────────────────────
  if (order.status === 'cancelled') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Cancelled</Text>
        </View>
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <Ionicons name="close-circle" size={48} color="#EF4444" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 }}>Order Declined</Text>
          <Text style={{ fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 24 }}>
            We're sorry, but the restaurant was unable to accept your order at this time.
          </Text>
          <View style={{ backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, width: '100%', borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>Refund Status</Text>
            <Text style={{ fontSize: 14, color: '#64748B', lineHeight: 20 }}>
              Your payment of ₹{order.totalAmount || order.amount} has been instantly refunded to your Happido Wallet.
            </Text>
          </View>
          <TouchableOpacity style={{ marginTop: 32, backgroundColor: '#EA580C', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 100, shadowColor: '#EA580C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }} onPress={() => router.replace('/')}>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Browse other restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: 'document-text', desc: 'Your order has been placed successfully' },
    { key: 'accepted', label: 'Order Accepted', icon: 'fast-food', desc: 'Restaurant accepted your order' },
    { key: 'preparing', label: 'Preparing Food', icon: 'flame', desc: 'Chef is preparing your meal' },
    { key: 'ready', label: 'Ready for Pickup', icon: 'bag-check', desc: 'Food is packed and ready' },
    { key: 'picked_up', label: 'Out for Delivery', icon: 'bicycle', desc: 'Rider is on the way to you' },
    { key: 'delivered', label: 'Delivered', icon: 'checkmark-circle', desc: 'Order delivered successfully' },
  ];
  // Map backend statuses to timeline step keys
  const statusToStepKey: Record<string, string> = {
    'pending': 'pending',
    'accepted': 'accepted',
    'preparing': 'preparing',
    'ready': 'ready',
    'ready_for_pickup': 'ready',
    'arrived_at_restaurant': 'ready',
    'dispatched': 'picked_up',
    'delivered': 'delivered',
    'completed': 'delivered',
  };
  const mappedKey = statusToStepKey[order.status] || order.status;
  const currentStepIndex = steps.findIndex(s => s.key === mappedKey);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
  const isPickedUp = activeIndex >= 4; // Out for delivery or delivered

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <View style={styles.safeArea}>
      {/* ─── LIVE MAP SECTION (FULL SCREEN BACKGROUND) ─────────────────────────────── */}
      <View style={StyleSheet.absoluteFill}>
        {Platform.OS === 'web' ? (
          <View style={styles.webMapContainer}>
            {mapplsLoaded ? (
              <>
                <div id="mappls-map-container" style={{ width: '100%', height: '100%' }} />
                <div id="mappls-direction-ui" style={{ display: 'none' }} />
                
                {/* Hide default Mappls Direction UI panel */}
                <style>
                  {`
                    .mmiDri, .mmiDriContainer, [id^="DrS_"], [id^="DrE_"], .mmiDriRoute {
                      display: none !important;
                    }
                  `}
                </style>
                {!riderLocation && order?.status !== 'pending' && (
                  <View style={{ position: 'absolute', top: '30%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.9)', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
                    <ActivityIndicator size="small" color="#EA580C" style={{ marginBottom: 8 }} />
                    <Text style={{ fontWeight: '600', color: '#0F172A' }}>Connecting to Rider...</Text>
                    <Text style={{ fontSize: 12, color: '#64748B' }}>Waiting for GPS signal</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#EA580C" />
                <Text style={{ marginTop: 12, color: '#64748B' }}>Loading Map...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.webMapContainer}>
            <View style={[styles.nativeMapPlaceholder]}>
              <MaterialCommunityIcons name="map-marker-radius" size={48} color="#EA580C" />
              <Text style={styles.nativeMapText}>Live map available on device</Text>
            </View>
          </View>
        )}
      </View>

      {/* Floating Header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.floatingBackBtn} onPress={() => router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={[styles.liveIndicator, { marginLeft: 16 }]}>
          <Animated.View style={[styles.liveDot, pulseStyle]} />
          <View style={styles.liveDotCore} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* ─── BOTTOM SHEET OVERLAY ─────────────────────────────── */}
      <View style={styles.bottomSheetWrapper} pointerEvents="box-none">
        <Animated.View entering={FadeInDown.delay(200).springify().damping(20)} style={styles.bottomSheet} pointerEvents="auto">
          <View style={styles.sheetHandle} />

          {/* Fixed Header Content */}

            {/* ETA & OTP Row */}
            <View style={styles.topInfoRow}>
              <View style={styles.etaBox}>
                <Text style={styles.etaLabel}>Arriving in</Text>
                <Text style={styles.etaTime}>{Math.ceil(estimatedTime)} <Text style={{fontSize: 16, fontWeight: '600'}}>mins</Text></Text>
              </View>
              <View style={styles.otpBox}>
                <Text style={styles.otpLabel}>Delivery PIN</Text>
                <Text style={styles.otpValue}>{order.otp || '1234'}</Text>
              </View>
            </View>

            {/* Rider Info Card */}
            {order.rider && (
              <View style={styles.riderCard}>
                <View style={styles.riderAvatar}>
                  <Ionicons name="person" size={24} color="#EA580C" />
                </View>
                <View style={styles.riderInfo}>
                  <Text style={styles.riderName}>{order.rider.name || 'Rider'}</Text>
                  <Text style={styles.riderRole}>Happido Captain</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn} onPress={() => {
                    const phone = order.rider?.phone || '';
                    if (phone) Linking.openURL(`tel:${phone}`);
                  }}>
                  <Ionicons name="call" size={20} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}
          {/* Scrollable Timeline & Summary Content */}
          <ScrollView showsVerticalScrollIndicator={false} bounces={true} style={{ maxHeight: 350 }}>
            {/* Timeline */}
            <View style={styles.trackerCard}>
              <View style={styles.timeline}>
                {steps.map((step, index) => {
                  const isActive = index <= activeIndex;
                  const isCurrent = index === activeIndex;
                  const isLast = index === steps.length - 1;
                  return (
                    <View key={step.key} style={styles.timelineRow}>
                      <View style={styles.timelineIconCol}>
                        <View style={[
                          styles.stepIconCircle,
                          isActive && styles.stepIconCircleActive,
                          isCurrent && styles.stepIconCircleCurrent,
                        ]}>
                          <Ionicons name={step.icon as any} size={16} color={isActive ? '#FFFFFF' : '#CBD5E1'} />
                        </View>
                        {!isLast && <View style={[styles.stepLine, index < activeIndex && styles.stepLineActive]} />}
                      </View>
                      <View style={styles.timelineTextCol}>
                        <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step.label}</Text>
                        {isCurrent && (
                          <View style={styles.currentStepRow}>
                            <View style={styles.currentDot} />
                            <Text style={styles.stepSubLabel}>{step.desc}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Promotional Ad Banner (Zomato-style) */}
            <View style={styles.adBanner}>
              <View style={styles.adBannerContent}>
                <Text style={styles.adBannerTitle}>Craving dessert?</Text>
                <Text style={styles.adBannerSub}>Add a sweet treat from a nearby store with 0 extra delivery fee!</Text>
              </View>
              <TouchableOpacity style={styles.adBannerBtn} onPress={() => router.replace('/')}>
                <Text style={styles.adBannerBtnText}>Explore</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.orderSummaryCard}>
              <View style={styles.summaryRow}>
                <Ionicons name="receipt" size={16} color="#64748B" />
                <Text style={styles.summaryText}>Order #{order._id?.slice(-6).toUpperCase() || id}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="cash" size={16} color="#10B981" />
                <Text style={[styles.summaryText, { fontWeight: '800', color: '#0F172A' }]}>
                  Total: ₹{order.totalAmount || order.amount || '335'}
                </Text>
              </View>
            </View>

          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E2E8F0' },

  webMapContainer: {
    width: '100%' as any,
    height: '65%' as any,
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
  },
  nativeMapPlaceholder: {
    flex: 1,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    backgroundColor: '#E2E8F0',
  },
  nativeMapText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600' as any,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500' as any,
  },
  
  floatingHeader: {
    position: 'absolute' as any, top: Platform.OS === 'ios' ? 60 : 30, left: 20, right: 20,
    flexDirection: 'row' as any, justifyContent: 'flex-start' as any, alignItems: 'center' as any, zIndex: 50,
  },
  floatingBackBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  liveIndicator: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', position: 'absolute', left: 12 },
  liveDotCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  liveText: { fontSize: 12, fontWeight: '800', color: '#0F172A', letterSpacing: 0.5 },

  bottomSheetWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10 },
  bottomSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 20, paddingBottom: 40,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

  topInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 12 },
  etaBox: { flex: 1, backgroundColor: '#FFF7ED', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FED7AA' },
  etaLabel: { fontSize: 12, color: '#EA580C', fontWeight: '700', marginBottom: 4 },
  etaTime: { fontSize: 24, color: '#EA580C', fontWeight: '900' },
  
  otpBox: { flex: 1, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'flex-end' },
  otpLabel: { fontSize: 12, color: '#64748B', fontWeight: '700', marginBottom: 4 },
  otpValue: { fontSize: 24, color: '#0F172A', fontWeight: '900', letterSpacing: 2 },

  riderCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
  riderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  riderInfo: { flex: 1 },
  riderName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  riderRole: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  trackerCard: { marginBottom: 24 },
  timeline: { paddingLeft: 8 },
  timelineRow: { flexDirection: 'row', alignItems: 'stretch' },
  timelineIconCol: { alignItems: 'center', width: 24, marginRight: 16, position: 'relative' },
  stepIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF', zIndex: 2 },
  stepIconCircleActive: { backgroundColor: '#10B981' },
  stepIconCircleCurrent: { backgroundColor: '#EA580C', transform: [{ scale: 1.2 }] },
  stepLine: { position: 'absolute', top: 24, bottom: -4, width: 2, backgroundColor: '#F1F5F9', zIndex: 1 },
  stepLineActive: { backgroundColor: '#10B981' },
  timelineTextCol: { flex: 1, paddingBottom: 16 },
  stepLabel: { fontSize: 15, fontWeight: '600', color: '#94A3B8' },
  stepLabelActive: { color: '#0F172A', fontWeight: '700' },
  currentStepRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  currentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EA580C', marginRight: 8 },
  stepSubLabel: { fontSize: 13, color: '#EA580C', fontWeight: '600' },
  orderSummaryCard: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  summaryText: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#64748B' },
  summaryDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },

  // Ad Banner
  adBanner: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  adBannerContent: {
    flex: 1,
    paddingRight: 12,
  },
  adBannerTitle: {
    fontSize: 14,
    fontWeight: '800' as any,
    color: '#9A3412',
    marginBottom: 4,
  },
  adBannerSub: {
    fontSize: 12,
    color: '#C2410C',
    lineHeight: 16,
  },
  adBannerBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  adBannerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700' as any,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as any,
    color: '#0F172A',
  },
});
