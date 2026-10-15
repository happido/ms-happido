import LottieView from 'lottie-react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  TextInput,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

import api from '@/utils/api';
import { OrderData } from '@/components/OrderPipelineCard';
import { MenuItem } from '@/components/tabs/MenuTab';

// Enterprise Partner Tabs
import DashboardTab from '@/components/tabs/DashboardTab';
import OrdersTab from '@/components/tabs/OrdersTab';
import MenuTab from '@/components/tabs/MenuTab';
import HubTab from '@/components/tabs/HubTab';
import IncomingOrderModal from '@/components/IncomingOrderModal';

// Notification Center Modal
import NotificationCenterModal from '@/components/NotificationCenterModal';

// KOT Thermal Receipt & Sound Chime Synthesizer
import KOTReceiptModal from '@/components/KOTReceiptModal';
import { soundService } from '@/utils/soundService';

// Customer Reviews & Daily EOD Reports
import CustomerReviewsModal from '@/components/CustomerReviewsModal';
import DailyEODReportModal from '@/components/DailyEODReportModal';
import CustomAlertModal, { CustomAlertConfig } from '@/components/CustomAlertModal';

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Hyderabadi Chicken Biryani', category: 'Biryani', price: 280, isAvailable: true, isVeg: false, description: 'Aromatic basmati rice cooked with tender chicken and authentic spices.' },
  { id: '2', name: 'Mutton Dum Biryani', category: 'Biryani', price: 380, isAvailable: true, isVeg: false, description: 'Slow cooked tender mutton with saffron infused long grain rice.' },
  { id: '3', name: 'Paneer Butter Masala', category: 'Main Course', price: 240, isAvailable: true, isVeg: true, description: 'Fresh cottage cheese cubes in rich and creamy tomato butter gravy.' },
  { id: '4', name: 'Butter Naan', category: 'Breads', price: 45, isAvailable: true, isVeg: true, description: 'Traditional clay oven baked flatbread with melted butter.' },
  { id: '5', name: 'Chicken 65 (Dry)', category: 'Starters', price: 220, isAvailable: false, isVeg: false, description: 'Deep fried spicy chicken chunks tossed in South Indian spices and curry leaves.' },
  { id: '6', name: 'Ghee Roast Dosa', category: 'Breakfast', price: 90, isAvailable: true, isVeg: true, description: 'Crispy golden crepe roasted in pure desi ghee served with chutneys.' },
];

const INITIAL_DEMO_ORDERS: OrderData[] = [
  {
    _id: 'HP-9042',
    customer: { name: 'Kavitha Reddy', phone: '+91 98480 12345' },
    isRush20Min: true,
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(), // 2 mins ago
    items: [
      { name: 'Special Chicken Biryani (Family Pack)', quantity: 1, price: 480, isVeg: false },
      { name: 'Double Ka Meetha (Dessert)', quantity: 1, price: 49, isVeg: true, isPromo49: true },
      { name: 'Thums Up (750ml)', quantity: 1, price: 50, isVeg: true },
    ],
    totalAmount: 579,
    status: 'pending',
    notes: 'Please make it extra spicy, extra gravy.',
  },
  {
    _id: 'HP-8914',
    customer: { name: 'Sai Krishna', phone: '+91 97018 99887' },
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(), // 12 mins ago
    items: [
      { name: 'Paneer Butter Masala', quantity: 1, price: 260, isVeg: true },
      { name: 'Butter Naan (3 pcs)', quantity: 2, price: 120, isVeg: true },
      { name: 'Gulab Jamun (2 pcs)', quantity: 1, price: 70, isVeg: true },
    ],
    totalAmount: 450,
    status: 'preparing',
    notes: 'Rider reaching in 8 mins.',
  },
  {
    _id: 'HP-8872',
    customer: { name: 'Ananya Sharma', phone: '+91 99882 33441' },
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), // 25 mins ago
    items: [
      { name: 'Masala Dosa (Ghee Roast)', quantity: 2, price: 180, isVeg: true },
      { name: 'Idli Vada Combo', quantity: 1, price: 90, isVeg: true },
      { name: 'Filter Coffee', quantity: 2, price: 60, isVeg: true },
    ],
    totalAmount: 330,
    status: 'ready',
  },
];

type NavTab = 'dashboard' | 'orders' | 'menu' | 'hub';

export default function RestaurantApp() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [menuInitialSubView, setMenuInitialSubView] = useState<'list' | 'add' | 'bulk'>('list');
  const [operations, setOperations] = useState({
    isOnline: false,
    defaultPrepTime: 20,
    autoAcceptOrders: false,
    isPureVeg: false,
    operatingHours: { openTime: '11:00 AM', closeTime: '11:30 PM' }
  });
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [latestNotif, setLatestNotif] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'onboarding'>('checking');
  const [restaurantName, setRestaurantName] = useState('Happido Kitchen');
  const [restaurantImageUrl, setRestaurantImageUrl] = useState<string | undefined>(undefined);
  const [address, setAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState<number[]>([0, 0]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [incomingOrder, setIncomingOrder] = useState<OrderData | null>(null);
  const [selectedKOTOrder, setSelectedKOTOrder] = useState<OrderData | null>(null);
  const [isKOTModalOpen, setIsKOTModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isEODModalOpen, setIsEODModalOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState({ accountNumber: '', ifscCode: '' });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [onboardingStatus, setOnboardingStatus] = useState<'incomplete' | 'pending_verification' | 'verified' | 'rejected'>('incomplete');
  const [customAlert, setCustomAlert] = useState<CustomAlertConfig | null>(null);
  
  // KYC State
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [fssaiUrl, setFssaiUrl] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [gstUrl, setGstUrl] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [panUrl, setPanUrl] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [cancelledChequeUrl, setCancelledChequeUrl] = useState('');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  
  // DigiLocker Verification State
  const [isFssaiVerifying, setIsFssaiVerifying] = useState(false);
  const [isPanVerifying, setIsPanVerifying] = useState(false);
  const [fssaiError, setFssaiError] = useState('');
  const [panError, setPanError] = useState('');
  const [fssaiVerifiedName, setFssaiVerifiedName] = useState('');
  const [panVerifiedName, setPanVerifiedName] = useState('');
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  const showAppAlert = (title: string, message: string, animationType?: 'success' | 'lock' | 'warning') => {
    let lottieSource = null;
    if (animationType === 'success') {
      lottieSource = require('../../assets/animations/Sucesso.json');
    } else if (animationType === 'lock') {
      lottieSource = require('../../assets/animations/Locked.json');
    } else if (animationType === 'warning') {
      lottieSource = require('../../assets/animations/Exit.json');
    }

    setCustomAlert({
      visible: true,
      title,
      message,
      type: 'alert',
      lottieSource,
      confirmText: 'OK',
      onConfirm: () => setCustomAlert(null)
    });
  };

  const updateOperation = async (key: string, value: any) => {
    // Optimistic UI update
    setOperations((prev) => ({ ...prev, [key]: value }));
    try {
      await api.put('/auth/me/operations', { operations: { [key]: value } });
    } catch (e: any) {
      showAppAlert('Error', 'Failed to update settings: ' + e.message, 'warning');
    }
  };

  const pickImage = async (setUri: (uri: string) => void) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      try {
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        if (Platform.OS === 'web') {
          // Web requires a Blob/File object for FormData
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('file', blob, filename);
        } else {
          // React Native natively supports { uri, name, type } syntax
          formData.append('file', { uri, name: filename, type } as any);
        }
        
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUri(res.data.url);
      } catch (e: any) {
        showAppAlert('Error', 'Upload Failed: ' + (e.response?.data?.message || e.message), 'warning');
      }
    }
  };

  const handleLogoUpdate = () => {
    pickImage(async (uri) => {
      setRestaurantImageUrl(uri);
      try {
        await api.put('/auth/me/profile-photo', { photoUrl: uri });
        showAppAlert('Success', 'Restaurant logo updated successfully', 'success');
      } catch (e: any) {
        showAppAlert('Error', 'Failed to update logo: ' + e.message, 'warning');
      }
    });
  };

  const handleAcceptIncomingOrder = async (orderId: string, prepTime: number) => {
    try {
      const statusRes = await api.put(`/orders/${orderId}/status`, { status: 'accepted' });
      setOrders(prev => prev.map(o => o._id === orderId ? statusRes.data.order : o));
      showAppAlert('Success', 'Order accepted successfully.', 'success');
      setIncomingOrder(null);
    } catch (error) {
      console.log('Error accepting order', error);
      showAppAlert('Error', 'Failed to accept order.', 'warning');
    }
  };

  const handleRejectIncomingOrder = async (orderId: string) => {
    try {
      const statusRes = await api.put(`/orders/${orderId}/status`, { status: 'cancelled' });
      setOrders(prev => prev.map(o => o._id === orderId ? statusRes.data.order : o));
      showAppAlert('Order Rejected', 'The customer has been notified.', 'warning');
      setIncomingOrder(null);
    } catch (error) {
      console.log('Error rejecting order', error);
      showAppAlert('Error', 'Failed to reject order.', 'warning');
    }
  };

  const verifyRestaurantDoc = async (type: 'FSSAI' | 'PAN') => {
    const number = type === 'FSSAI' ? fssaiNumber : panNumber;
    
    if (type === 'FSSAI') setFssaiError('');
    if (type === 'PAN') setPanError('');

    if (!number) {
      if (type === 'FSSAI') setFssaiError('Please enter your FSSAI number first');
      if (type === 'PAN') setPanError('Please enter your PAN number first');
      return;
    }
    
    type === 'FSSAI' ? setIsFssaiVerifying(true) : setIsPanVerifying(true);
    
    try {
      const res = await api.post('/kyc/digilocker-verify', {
        documentType: type,
        documentNumber: number
      });
      
      const { pureDocumentUrl, verifiedName } = res.data.data;
      
      if (type === 'FSSAI') {
        setFssaiUrl(pureDocumentUrl);
        setFssaiVerifiedName(verifiedName);
      } else {
        setPanUrl(pureDocumentUrl);
        setPanVerifiedName(verifiedName);
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || `Failed to verify ${type}`;
      if (type === 'FSSAI') {
        setFssaiError(errMsg);
      } else {
        setPanError(errMsg);
      }
    } finally {
      type === 'FSSAI' ? setIsFssaiVerifying(false) : setIsPanVerifying(false);
    }
  };

  const handleKycSubmit = async () => {
    if (!fssaiNumber || !fssaiUrl || !panNumber || !panUrl || !accountNumber || !ifscCode || !accountHolderName || !cancelledChequeUrl) {
      showAppAlert('Missing Fields', 'Please complete all required fields and verify FSSAI/PAN to proceed.');
      return;
    }

    // Enterprise-grade Validation
    const nameRegex = /^[a-zA-Z\s.']{3,50}$/;
    if (!nameRegex.test(accountHolderName)) {
      showAppAlert('Invalid Name', 'Account Holder Name must be 3-50 characters long and contain only letters and spaces.');
      return;
    }

    const accountRegex = /^\d{9,18}$/;
    if (!accountRegex.test(accountNumber)) {
      showAppAlert('Invalid Account Number', 'Please enter a valid 9 to 18 digit bank account number.');
      return;
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode)) {
      showAppAlert('Invalid IFSC Code', 'Please enter a valid 11-character IFSC Code (e.g., HDFC0001234).');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      const payload = {
        fssaiNumber, fssaiUrl,
        gstNumber, gstUrl,
        panNumber, panUrl,
        accountNumber, ifscCode, accountHolderName, cancelledChequeUrl
      };
      await api.post('/auth/verify-restaurant', payload);
      setOnboardingStatus('pending_verification');
      await AsyncStorage.setItem('onboardingStatus', 'pending_verification');
      showAppAlert('Success', 'Your documents passed API verification and are under Superadmin review!');
    } catch (e: any) {
      showAppAlert('Error', e.message);
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setAuthStatus('onboarding' as any);
        return;
      }
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setAuthStatus('unauthenticated');
      } else {
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) setRestaurantName(storedName);
        
        const status = await AsyncStorage.getItem('onboardingStatus');
        if (status) setOnboardingStatus(status as any);
        
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            setRestaurantName(res.data.restaurantName || res.data.name || 'Happido Kitchen');
            setRestaurantImageUrl(res.data.imageUrl || res.data.documents?.profilePhotoUrl);
            if (res.data.address) {
              setAddress(res.data.address);
            }
            if (res.data.location?.coordinates) {
              setCoordinates(res.data.location.coordinates);
            }
            if (res.data.documents?.fssaiNumber) {
              setFssaiNumber(res.data.documents.fssaiNumber);
            }
            if (res.data.bankDetails) {
              setBankDetails({
                accountNumber: res.data.bankDetails.accountNumber || '',
                ifscCode: res.data.bankDetails.ifscCode || '',
              });
            } else if (res.data.restaurantDetails) {
              // fallback for older schema
              setBankDetails({
                accountNumber: res.data.restaurantDetails.accountNumber || '',
                ifscCode: res.data.restaurantDetails.ifscCode || '',
              });
            }
            if (res.data.operations) {
              setOperations({ ...operations, ...res.data.operations });
            }
          }
        } catch (e: any) {
          console.warn("Failed to fetch user details", e.message);
          if (e.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            setAuthStatus('unauthenticated');
            return;
          }
        }

        setAuthStatus('authenticated');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    let newSocket: Socket;

    const setupData = async () => {
      if (Platform.OS === 'web' && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
      // 1. Fetch live menu from MongoDB
      try {
        const menuRes = await api.get('/restaurants/menu');
        if (menuRes.data && menuRes.data.length > 0) {
          setMenuItems(
            menuRes.data.map((m: any) => ({
              id: m._id,
              name: m.name || m.itemName,
              category: m.category || 'Main Course',
              price: m.price,
              isAvailable: m.isAvailable !== false,
              isVeg: m.isVeg !== false,
              isRecommended: m.isRecommended || false,
              description: m.description || '',
              imageUrl: m.imageUrl || '',
            }))
          );
        } else {
          setMenuItems(DEFAULT_MENU_ITEMS);
        }
      } catch (e) {
        setMenuItems(DEFAULT_MENU_ITEMS);
      }

      // 2. Fetch live orders
      try {
        const response = await api.get('/orders/restaurant');
        if (response.data && response.data.length > 0) {
          setOrders(response.data);
        }
      } catch (error) {}

      // 3. Socket for real-time order alerts
      const userId = await AsyncStorage.getItem('userId');
      const restaurantId = await AsyncStorage.getItem('restaurantId');
      console.log('🔔 [RESTAURANT SOCKET] userId from AsyncStorage:', userId);
      console.log('🔔 [RESTAURANT SOCKET] restaurantId from AsyncStorage:', restaurantId);
      const socketUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5005';
      newSocket = io(socketUrl);

      newSocket.on('connect', () => {
        console.log('🔔 [RESTAURANT SOCKET] Connected! socket.id:', newSocket.id);
        if (restaurantId) {
          console.log('🔔 [RESTAURANT SOCKET] Joining restaurantId room:', restaurantId);
          newSocket.emit('joinRoom', restaurantId);
        }
        if (userId) {
          console.log('🔔 [RESTAURANT SOCKET] Joining userId room:', userId);
          newSocket.emit('joinRoom', userId);
        }
        if (!restaurantId && !userId) {
          console.error('🔔 [RESTAURANT SOCKET] WARNING: No userId or restaurantId found! Cannot receive orders.');
        }
      });

      newSocket.on('newOrder', (newOrder: OrderData) => {
        setOrders((prev) => [newOrder, ...prev]);
        setIncomingOrder(newOrder);
        
        if (soundAlerts) {
          soundService.playOrderChime();

          setLatestNotif({
            id: 'n-' + Date.now(),
            type: 'order',
            title: `New Online Order #${newOrder._id}`,
            description: `New order received. Total: ₹${newOrder.totalAmount}`,
            time: 'Just now',
            isRead: false,
            amount: newOrder.totalAmount
          });

          showAppAlert(
            '⚡ New Order Placed!',
            `Order #${newOrder._id.slice(-6).toUpperCase()} arrived. Total: ₹${newOrder.totalAmount}`,
            'success'
          );

          if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('⚡ New Order Placed!', {
              body: `Order #${newOrder._id} arrived. Total: ₹${newOrder.totalAmount}`,
            });
          }
        }
      });

      newSocket.on('orderStatusUpdate', (updatedOrder: OrderData) => {
        console.log('🔔 [RESTAURANT SOCKET] Received orderStatusUpdate:', updatedOrder);
        setOrders(prev => {
          const exists = prev.find(o => o._id === updatedOrder._id);
          if (exists) {
            return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
          }
          return [updatedOrder, ...prev];
        });
      });

      newSocket.on('orderCancelled', (updatedOrder: OrderData) => {
        console.log('🔔 [RESTAURANT SOCKET] Received orderCancelled from CRON:', updatedOrder);
        setOrders(prev => {
          const exists = prev.find(o => o._id === updatedOrder._id);
          if (exists) {
            return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
          }
          return [updatedOrder, ...prev];
        });
      });

      newSocket.on('storeStatusChanged', (payload: { isOnline: boolean }) => {
        console.log('🔔 [RESTAURANT SOCKET] Received storeStatusChanged:', payload);
        setOperations(prev => ({ ...prev, isOnline: payload.isOnline }));
      });

      newSocket.on('dispatchFailed', (payload: { orderId: string, message: string }) => {
        console.log('🔔 [RESTAURANT SOCKET] Dispatch Failed:', payload);
        Alert.alert('Rider Search Failed', payload.message || 'No delivery partners are currently online in your area.');
        // Optionally revert status or let it stay in ready_for_pickup so they can retry later
      });

      setSocket(newSocket);

      // Safety net: Poll for new orders every 5 seconds in case socket event is missed
      const orderPollInterval = setInterval(async () => {
        try {
          const pollRes = await api.get('/orders/restaurant');
          if (pollRes.data && pollRes.data.length > 0) {
            setOrders((prev) => {
              // Merge: add any orders from poll that aren't already in state
              const existingIds = new Set(prev.map((o) => o._id));
              const newFromPoll = pollRes.data.filter((o: OrderData) => !existingIds.has(o._id));
              if (newFromPoll.length > 0) {
                console.log('🔔 [POLL] Found new orders via polling:', newFromPoll.length);
                // Trigger alert for each new order found via poll
                newFromPoll.forEach((newOrder: OrderData) => {
                  if (soundAlerts) {
                    soundService.playOrderChime();
                    showAppAlert(
                      '⚡ New Order Placed!',
                      `Order #${newOrder._id?.slice(-6).toUpperCase()} arrived. Total: ₹${newOrder.totalAmount}`,
                      'success'
                    );
                  }
                });
                return [...newFromPoll, ...prev];
              }
              return prev;
            });
          }
        } catch (e) {
          // Silently fail polling
        }
      }, 5000);

      return () => {
        clearInterval(orderPollInterval);
      };
    };

    if (authStatus === 'authenticated') {
      setupData();
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [authStatus]);

  const handleUpdateOrderStatus = async (orderId: string, status: OrderData['status']) => {
    try {
      if (status === 'ready') {
        await api.post(`/orders/${orderId}/request-rider`);
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? { ...order, status: 'ready_for_pickup' } : order))
        );
      } else if (status === 'cancelled') {
        await api.post(`/orders/${orderId}/cancel`, { reason: 'Declined by Restaurant' });
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? { ...order, status: 'cancelled' } : order))
        );
      } else {
        await api.put(`/orders/${orderId}/status`, { status });
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? { ...order, status } : order))
        );
      }
    } catch (error) {
      console.log('Error updating order status:', error);
    }
  };

  const handleToggleStock = async (id: string, currentAvailable: boolean) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !currentAvailable } : item))
    );
    try {
      await api.put(`/restaurants/menu/${id}`, { isAvailable: !currentAvailable });
    } catch (e) {}
  };

  const handleDeleteDish = (id: string, name: string) => {
    setCustomAlert({
      visible: true,
      title: 'Delete Dish',
      message: `Are you sure you want to remove "${name}" from your catalog?`,
      type: 'confirm',
      confirmText: 'Delete',
      onConfirm: async () => {
        setCustomAlert(null);
        setMenuItems((prev) => prev.filter((item) => item.id !== id));
        try {
          await api.delete(`/restaurants/menu/${id}`);
        } catch (e) {}
      },
      onCancel: () => setCustomAlert(null)
    });
  };

  const handleAddNewDish = async (dish: any) => {
    // Map itemName to name for backend schema
    const payload = { ...dish, name: dish.itemName };
    const tempId = Date.now().toString();
    const newDishObj: MenuItem = {
      id: tempId,
      name: dish.itemName,
      category: dish.category,
      price: dish.price,
      isAvailable: true,
      isVeg: dish.isVeg,
      isRecommended: dish.isRecommended || false,
      description: dish.description,
      imageUrl: dish.imageUrl,
    };
    
    // Optimistic Update
    setMenuItems((prev) => [newDishObj, ...prev]);

    try {
      const res = await api.post('/restaurants/menu', payload);
      const added = res.data?.item || res.data?.menu?.[res.data.menu.length - 1];
      if (added?._id) {
        // Swap temp ID with real DB ID quietly
        setMenuItems((prev) => prev.map(item => item.id === tempId ? { ...item, id: added._id } : item));
      }
    } catch (e) {
      console.warn("Backend sync failed for new dish", e);
    }

    setCustomAlert({
      visible: true,
      title: 'Success 🎉',
      message: `"${newDishObj.name}" is now live on Happido!`,
      type: 'alert',
      lottieSource: require('../../assets/animations/Sucesso.json'),
      onConfirm: () => setCustomAlert(null)
    });
  };

  const handleEditDish = async (id: string, updatedDish: any) => {
    // Map itemName to name for backend schema
    const payload = { ...updatedDish, name: updatedDish.itemName };
    const newDishObj: MenuItem = {
      id: id,
      name: updatedDish.itemName,
      category: updatedDish.category,
      price: updatedDish.price,
      isAvailable: updatedDish.isAvailable !== undefined ? updatedDish.isAvailable : true,
      isVeg: updatedDish.isVeg,
      isRecommended: updatedDish.isRecommended || false,
      description: updatedDish.description,
      imageUrl: updatedDish.imageUrl,
    };
    
    // Optimistic Update
    setMenuItems((prev) => prev.map(item => item.id === id ? newDishObj : item));

    try {
      await api.put(`/restaurants/menu/${id}`, payload);
    } catch (e) {
      console.warn("Backend sync failed for edit dish", e);
    }
    
    setCustomAlert({
      visible: true,
      title: 'Updated 🎉',
      message: `"${newDishObj.name}" has been updated!`,
      type: 'alert',
      lottieSource: require('../../assets/animations/Sucesso.json'),
      onConfirm: () => setCustomAlert(null)
    });
  };

  const handleBulkImport = async (items: any[], replace: boolean) => {
    const res = await api.post('/restaurants/menu/bulk', { items, replace });
    if (res.data?.menu) {
      setMenuItems(
        res.data.menu.map((m: any) => ({
          id: m._id,
          name: m.itemName,
          category: m.category || 'Main Course',
          price: m.price,
          isAvailable: m.isAvailable !== false,
          isVeg: m.isVeg !== false,
          description: m.description || '',
        }))
      );
    }
    setCustomAlert({
      visible: true,
      title: 'Catalog Updated 🚀',
      message: `Successfully imported ${items.length} dishes!`,
      type: 'alert',
      lottieSource: require('../../assets/animations/Sucesso.json'),
      onConfirm: () => setCustomAlert(null)
    });
  };

  const handleLogout = async () => {
    setCustomAlert({
      visible: true,
      title: 'Logout',
      message: 'Are you sure you want to log out of your restaurant dashboard?',
      type: 'confirm',
      confirmText: 'Logout',
      lottieSource: require('../../assets/animations/Exit.json'),
      onConfirm: async () => {
        setCustomAlert(null);
        await AsyncStorage.clear();
        setAuthStatus('unauthenticated');
        router.replace('/login');
      },
      onCancel: () => setCustomAlert(null)
    });
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

  if (onboardingStatus === 'incomplete') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F8FAFC' }]}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          {/* Top Navigation Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/login');
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
                elevation: 2,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOnboardingStatus('verified')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F0F9FF',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#BAE6FD',
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#0284C7', marginRight: 4 }}>Skip</Text>
              <Ionicons name="arrow-forward-outline" size={18} color="#0284C7" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 8 }}>Partner Onboarding</Text>
          <Text style={{ fontSize: 16, color: '#64748B', marginBottom: 24 }}>Upload your business documents to unlock the Happido network.</Text>

          {/* FSSAI */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>FSSAI License</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput 
                style={[styles.kycInput, {flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0}, fssaiError ? {borderWidth: 1, borderColor: '#EF4444'} : null]} 
                placeholder="14-Digit FSSAI Number" 
                value={fssaiNumber} 
                onChangeText={(val) => { setFssaiNumber(val); setFssaiError(''); }} 
                keyboardType="number-pad" 
                maxLength={14} 
                editable={!fssaiUrl} 
              />
              <TouchableOpacity 
                style={{backgroundColor: fssaiUrl ? '#10B981' : '#EA580C', paddingHorizontal: 16, height: 50, justifyContent: 'center', borderTopRightRadius: 12, borderBottomRightRadius: 12}}
                onPress={() => fssaiUrl ? null : verifyRestaurantDoc('FSSAI')}
                disabled={isFssaiVerifying || !!fssaiUrl}
              >
                {isFssaiVerifying ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{color: '#FFF', fontWeight: 'bold'}}>{fssaiUrl ? 'Verified ✓' : 'Verify'}</Text>}
              </TouchableOpacity>
            </View>
            {!!fssaiError && <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: '500'}}>{fssaiError}</Text>}
            {fssaiUrl ? (
              <View style={{marginTop: 12, padding: 12, backgroundColor: '#ECFDF5', borderRadius: 8, borderWidth: 1, borderColor: '#10B981', flexDirection: 'row', alignItems: 'center'}}>
                <Image source={{uri: fssaiUrl}} style={{width: 60, height: 40, borderRadius: 4, marginRight: 12}} />
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 10, color: '#059669', fontWeight: 'bold', textTransform: 'uppercase'}}>✅ FSSAI DigiLocker Certified</Text>
                  <Text style={{fontSize: 14, color: '#064E3B', fontWeight: 'bold', marginTop: 2}}>{fssaiVerifiedName}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* PAN */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Business PAN</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput 
                style={[styles.kycInput, {flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0}, panError ? {borderWidth: 1, borderColor: '#EF4444'} : null]} 
                placeholder="PAN Number (e.g. ABCDE1234F)" 
                autoCapitalize="characters" 
                value={panNumber} 
                onChangeText={(val) => { setPanNumber(val); setPanError(''); }} 
                maxLength={10} 
                editable={!panUrl} 
              />
              <TouchableOpacity 
                style={{backgroundColor: panUrl ? '#10B981' : '#EA580C', paddingHorizontal: 16, height: 50, justifyContent: 'center', borderTopRightRadius: 12, borderBottomRightRadius: 12}}
                onPress={() => panUrl ? null : verifyRestaurantDoc('PAN')}
                disabled={isPanVerifying || !!panUrl}
              >
                {isPanVerifying ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{color: '#FFF', fontWeight: 'bold'}}>{panUrl ? 'Verified ✓' : 'Verify'}</Text>}
              </TouchableOpacity>
            </View>
            {!!panError && <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: '500'}}>{panError}</Text>}
            {panUrl ? (
              <View style={{marginTop: 12, padding: 12, backgroundColor: '#ECFDF5', borderRadius: 8, borderWidth: 1, borderColor: '#10B981', flexDirection: 'row', alignItems: 'center'}}>
                <Image source={{uri: panUrl}} style={{width: 60, height: 40, borderRadius: 4, marginRight: 12}} />
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 10, color: '#059669', fontWeight: 'bold', textTransform: 'uppercase'}}>✅ SurePass Certified</Text>
                  <Text style={{fontSize: 14, color: '#064E3B', fontWeight: 'bold', marginTop: 2}}>{panVerifiedName}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* GST */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>GST Details (Optional)</Text>
            <TextInput style={styles.kycInput} placeholder="GSTIN Number" autoCapitalize="characters" value={gstNumber} onChangeText={setGstNumber} />
            <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setGstUrl)}>
              <Ionicons name="receipt" size={24} color={gstUrl ? "#10B981" : "#EA580C"} />
              <Text style={styles.uploadBtnText}>{gstUrl ? 'GST Uploaded' : 'Upload GST Certificate'}</Text>
            </TouchableOpacity>
          </View>

          {/* Bank Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payout Bank Details</Text>
            <TextInput style={styles.kycInput} placeholder="Account Holder Name" value={accountHolderName} onChangeText={setAccountHolderName} />
            <TextInput style={styles.kycInput} placeholder="Account Number" keyboardType="number-pad" value={accountNumber} onChangeText={setAccountNumber} />
              <TextInput 
                style={[styles.kycInput, {marginBottom: 10}]} 
                placeholder="IFSC Code (e.g. HDFC0001234)" 
                autoCapitalize="characters"
                maxLength={11}
                value={ifscCode} 
                onChangeText={setIfscCode} 
              /><TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setCancelledChequeUrl)}>
              <Ionicons name="business" size={24} color={cancelledChequeUrl ? "#10B981" : "#EA580C"} />
              <Text style={styles.uploadBtnText}>{cancelledChequeUrl ? 'Cheque Uploaded' : 'Upload Cancelled Cheque'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.submitBtn, isSubmittingKyc && { opacity: 0.7 }]} onPress={handleKycSubmit} disabled={isSubmittingKyc}>
            {isSubmittingKyc ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit for Verification</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={handleLogout}>
            <Text style={{ color: '#EA580C', fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (onboardingStatus === 'pending_verification') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/login');
            }
          }}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
            elevation: 2,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>Back</Text>
        </TouchableOpacity>

        <Ionicons name="time" size={64} color="#EA580C" style={{ marginBottom: 24 }} />
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 12, textAlign: 'center' }}>Documents Under Review</Text>
        <Text style={{ fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 }}>Your KYC documents have been submitted securely to the Happido Superadmin desk. We will notify you once approved.</Text>
        <TouchableOpacity style={{ padding: 16, backgroundColor: '#EA580C', borderRadius: 12, width: '100%', alignItems: 'center' }} onPress={handleLogout}>
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Logout for now</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={StyleSheet.absoluteFill} />

      {/* Top Universal App Header (Minimalist Theme) */}
      <Animated.View entering={FadeInDown.duration(300)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827', letterSpacing: -0.5, flex: 1 }} numberOfLines={1}>{restaurantName}</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            onPress={() => updateOperation('isOnline', !operations?.isOnline)}
            activeOpacity={0.8}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: operations?.isOnline ? '#059669' : '#F1F5F9', 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 24, 
              marginRight: 4,
              borderWidth: 1,
              borderColor: operations?.isOnline ? '#047857' : '#E2E8F0',
              shadowColor: operations?.isOnline ? '#059669' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: operations?.isOnline ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: 2
            }}
          >
            <View style={{ 
              width: 8, height: 8, borderRadius: 4, 
              backgroundColor: operations?.isOnline ? '#A7F3D0' : '#9CA3AF',
              marginRight: 6
            }} />
            <Text style={{ 
              fontSize: 11, 
              fontWeight: '900', 
              color: operations?.isOnline ? '#FFFFFF' : '#64748B', 
              letterSpacing: 0.5 
            }}>
              {operations?.isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsNotifModalOpen(true)}>
            <Ionicons name="notifications-outline" size={24} color="#4B5563" />
            {latestNotif && (
              <View style={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', borderRadius: 10, width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 8, color: '#FFF', fontWeight: '800' }}>!</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            const nextVal = !soundAlerts;
            setSoundAlerts(nextVal);
            if (nextVal) soundService.playOrderChime();
          }}>
            <Ionicons name={soundAlerts ? 'volume-high-outline' : 'volume-mute-outline'} size={24} color={soundAlerts ? '#4B5563' : '#9CA3AF'} />
          </TouchableOpacity>

        </View>
      </Animated.View>

      {/* Main Tab Body */}
      <View style={styles.contentBody}>
        {activeTab === 'dashboard' && (
          <DashboardTab
            isOnline={operations?.isOnline || false}
            onToggleOnline={(val) => updateOperation('isOnline', val)}
            orders={orders}
            menuItems={menuItems}
            menuItemsCount={menuItems.length}
            onOpenMenu={() => {
              setMenuInitialSubView('add');
              setActiveTab('menu');
            }}
            onOpenBulkMenu={() => {
              setMenuInitialSubView('bulk');
              setActiveTab('menu');
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onPrintKOT={(order) => {
              setSelectedKOTOrder(order);
              setIsKOTModalOpen(true);
            }}
            onOpenReviews={() => setIsReviewsModalOpen(true)}
            onOpenEODReport={() => setIsEODModalOpen(true)}
            isRushMode={operations?.isRushMode || false}
            onToggleRushMode={(val) => {
              updateOperation('isRushMode', val);
              if (val) {
                soundService.playActionBeep();
                Alert.alert('Rush Mode Surge Activated 🔥', '+15 mins prep time will automatically be added on all incoming customer orders.');
              } else {
                Alert.alert('Rush Mode Off ✅', 'Kitchen returned to standard prep timings.');
              }
            }}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            isOnline={operations?.isOnline || false}
            onPrintKOT={(order) => {
              setSelectedKOTOrder(order);
              setIsKOTModalOpen(true);
            }}
          />
        )}

        {activeTab === 'menu' && (
          <MenuTab
            menuItems={menuItems}
            onToggleStock={handleToggleStock}
            onDeleteDish={handleDeleteDish}
            onAddNewDish={handleAddNewDish}
            onEditDish={handleEditDish}
            onBulkImport={handleBulkImport}
            initialSubView={menuInitialSubView}
            restaurantName={restaurantName}
            restaurantImageUrl={restaurantImageUrl}
          />
        )}
        {activeTab === 'hub' && (
          <HubTab
            restaurantName={restaurantName}
            restaurantImageUrl={restaurantImageUrl}
            fssaiNumber={fssaiNumber}
            bankDetails={bankDetails}
            address={address}
            coordinates={coordinates}
            soundAlerts={soundAlerts}
            onToggleSound={setSoundAlerts}
            operations={operations}
            onUpdateOperation={updateOperation}
            onLogout={handleLogout}
            onLogoUpdate={handleLogoUpdate}
            onUpdateLocation={async (newAddress, newCoords) => {
              try {
                await api.put('/auth/me/location', { address: newAddress, location: { type: 'Point', coordinates: newCoords } });
                setAddress(newAddress);
                setCoordinates(newCoords);
                showAppAlert('Success', 'Restaurant location updated securely', 'success');
              } catch (e: any) {
                showAppAlert('Error', 'Failed to update location: ' + e.message, 'warning');
              }
            }}
            onOpenReviews={() => setIsReviewsModalOpen(true)}
            onOpenEODReport={() => setIsEODModalOpen(true)}
            showAlert={showAppAlert}
          />
        )}
      </View>

      {/* Modern Floating Bottom Navigation Bar Dock */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavBar}>
          {/* Kitchen / Dashboard */}
          <TouchableOpacity
            style={styles.navTabBtn}
            onPress={() => setActiveTab('dashboard')}
          >
            <View style={[styles.navIconBox, activeTab === 'dashboard' && styles.navIconBoxActive]}>
              <Ionicons
                name={activeTab === 'dashboard' ? 'home' : 'home-outline'}
                size={20}
                color={activeTab === 'dashboard' ? '#EA580C' : '#64748B'}
              />
            </View>
            <Text style={[styles.navTabLabel, activeTab === 'dashboard' && styles.navTabLabelActive]}>
              Kitchen
            </Text>
          </TouchableOpacity>

          {/* Orders (with pending badge) */}
          <TouchableOpacity
            style={styles.navTabBtn}
            onPress={() => setActiveTab('orders')}
          >
            <View style={[styles.navIconBox, activeTab === 'orders' && styles.navIconBoxActive]}>
              <Ionicons
                name={activeTab === 'orders' ? 'receipt' : 'receipt-outline'}
                size={20}
                color={activeTab === 'orders' ? '#EA580C' : '#64748B'}
              />
              {pendingCount > 0 && (
                <View style={styles.navOrderBadge}>
                  <Text style={styles.navOrderBadgeText}>{pendingCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.navTabLabel, activeTab === 'orders' && styles.navTabLabelActive]}>
              Orders
            </Text>
          </TouchableOpacity>

          {/* Menu */}
          <TouchableOpacity
            style={styles.navTabBtn}
            onPress={() => {
              setMenuInitialSubView('list');
              setActiveTab('menu');
            }}
          >
            <View style={[styles.navIconBox, activeTab === 'menu' && styles.navIconBoxActive]}>
              <Ionicons
                name={activeTab === 'menu' ? 'restaurant' : 'restaurant-outline'}
                size={20}
                color={activeTab === 'menu' ? '#EA580C' : '#64748B'}
              />
            </View>
            <Text style={[styles.navTabLabel, activeTab === 'menu' && styles.navTabLabelActive]}>
              Menu
            </Text>
          </TouchableOpacity>

          {/* Hub */}
          <TouchableOpacity
            style={styles.navTabBtn}
            onPress={() => setActiveTab('hub')}
          >
            <View style={[styles.navIconBox, activeTab === 'hub' && styles.navIconBoxActive]}>
              <Ionicons
                name={activeTab === 'hub' ? 'grid' : 'grid-outline'}
                size={20}
                color={activeTab === 'hub' ? '#EA580C' : '#64748B'}
              />
            </View>
            <Text style={[styles.navTabLabel, activeTab === 'hub' && styles.navTabLabelActive]}>
              Hub
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Center Modal */}
      <NotificationCenterModal
        visible={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        newNotification={latestNotif}
        soundAlerts={soundAlerts}
        onToggleSound={(next) => {
          setSoundAlerts(next);
          if (next) soundService.playOrderChime();
        }}
      />

      {/* Kitchen Order Ticket (KOT) Thermal Receipt Slip Modal */}
      <KOTReceiptModal
        visible={isKOTModalOpen}
        onClose={() => setIsKOTModalOpen(false)}
        order={selectedKOTOrder}
        restaurantName={restaurantName}
      />

      {/* Customer Ratings & Reviews Manager Modal */}
      <CustomerReviewsModal
        visible={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        restaurantName={restaurantName}
      />

      {/* Daily End-of-Day (EOD) Z-Report Modal */}
      <DailyEODReportModal
        visible={isEODModalOpen}
        onClose={() => setIsEODModalOpen(false)}
        restaurantName={restaurantName}
        totalSales={orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}
        totalOrders={orders.length}
      />

      {/* Incoming Order Global Modal */}
      <IncomingOrderModal
        visible={!!incomingOrder}
        order={incomingOrder}
        onAccept={handleAcceptIncomingOrder}
        onReject={handleRejectIncomingOrder}
      />

      <CustomAlertModal config={customAlert} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  actionIconBtnActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  notifBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EA580C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  contentBody: {
    flex: 1,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  bottomNavBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 440,
  },
  navTabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  navIconBox: {
    width: 34,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navIconBoxActive: {
    backgroundColor: '#FFF7ED',
  },
  navTabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2,
  },
  navTabLabelActive: {
    color: '#EA580C',
    fontWeight: '900',
  },
  navOrderBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#EA580C',
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  navOrderBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12
  },
  kycInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    gap: 8
  },
  uploadBtnText: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 14
  },
  submitBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16
  }
});
