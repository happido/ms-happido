import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface GlobalState {
  cartCount: number;
  setCartCount: (count: number) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  showNotificationModal: boolean;
  setShowNotificationModal: (show: boolean) => void;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
  showSubscriptionModal: boolean;
  setShowSubscriptionModal: (show: boolean) => void;
  showAICopilot: boolean;
  setShowAICopilot: (show: boolean) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  userCoords: { lat: number; lng: number } | null;
  setUserCoords: (coords: { lat: number; lng: number } | null) => void;
  isVIP: boolean;
  setIsVIP: (vip: boolean) => void;
  assistiveTouchEnabled: boolean;
  setAssistiveTouchEnabled: (enabled: boolean) => void;
  activeOrder: any;
  setActiveOrder: (order: any) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userPhone: string;
  setUserPhone: (phone: string) => void;
  newGlobalNotification: any | null;
  setNewGlobalNotification: (notif: any) => void;
}

const GlobalContext = createContext<GlobalState | null>(null);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAICopilot, setShowAICopilot] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Detecting location...');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isVIP, setIsVIP] = useState(false);
  const [assistiveTouchEnabled, setAssistiveTouchEnabled] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [newGlobalNotification, setNewGlobalNotification] = useState<any | null>(null);

  const value = {
    cartCount, setCartCount,
    showProfileModal, setShowProfileModal,
    showNotificationModal, setShowNotificationModal,
    showLocationModal, setShowLocationModal,
    showSubscriptionModal, setShowSubscriptionModal,
    showAICopilot, setShowAICopilot,
    selectedLocation, setSelectedLocation,
    userCoords, setUserCoords,
    isVIP, setIsVIP,
    assistiveTouchEnabled, setAssistiveTouchEnabled,
    activeOrder, setActiveOrder,
    userName, setUserName,
    userEmail, setUserEmail,
    userPhone, setUserPhone,
    newGlobalNotification, setNewGlobalNotification,
  };

  React.useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Load cached location instantly if available
        const cachedLocation = await AsyncStorage.getItem('lastKnownLocation');
        if (cachedLocation) {
          setSelectedLocation(cachedLocation);
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cachedLocation) setSelectedLocation('Location permission denied');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setUserCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });

        // Use dynamic import for api to avoid circular dependencies
        const { default: api } = await import('@/utils/api');
        const res = await api.get('/maps/geocode', {
          params: { latlng: `${loc.coords.latitude},${loc.coords.longitude}` }
        });
        
        if (res.data && res.data.results && res.data.results.length > 0) {
          const address = res.data.results[0].formatted_address;
          setSelectedLocation(address);
          await AsyncStorage.setItem('lastKnownLocation', address);
        }
      } catch (err) {
        console.log('Failed to fetch/geocode location automatically', err);
      }
    };
    
    fetchLocation();
  }, []);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
}
