import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useGlobalState } from '@/context/GlobalContext';

// Import all global components
import BottomNavBar from '@/components/BottomNavBar';
import AssistiveTouch from '@/components/AssistiveTouch';
import HappidoAICopilotModal from '@/components/HappidoAICopilotModal';
import SubscriptionModal from '@/components/SubscriptionModal';
import CustomerProfileModal from '@/components/CustomerProfileModal';
import NotificationCenterModal from '@/components/NotificationCenterModal';
import LocationPickerModal from '@/components/LocationPickerModal';
import EmergencyBloodModal from '@/components/EmergencyBloodModal';
import GlobalCartBanner from '@/components/GlobalCartBanner';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GlobalOverlays() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    cartCount, setCartCount,
    showProfileModal, setShowProfileModal,
    showNotificationModal, setShowNotificationModal,
    showLocationModal, setShowLocationModal,
    showSubscriptionModal, setShowSubscriptionModal,
    showAICopilot, setShowAICopilot,
    selectedLocation, setSelectedLocation,
    isVIP, setIsVIP,
    assistiveTouchEnabled, setAssistiveTouchEnabled,
    activeOrder,
    userName, userEmail, userPhone,
    newGlobalNotification
  } = useGlobalState();

  // Determine active tab for BottomNavBar
  let activeTab: any = 'home';
  if (pathname.includes('/restaurants')) activeTab = 'food';
  else if (pathname.includes('/map')) activeTab = 'rides';
  else if (pathname.includes('/blood-request')) activeTab = 'blood';
  else if (pathname.includes('/orders')) activeTab = 'orders';

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setShowProfileModal(false);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggleAssistiveTouch = (val: boolean) => {
    setAssistiveTouchEnabled(val);
  };

  return (
    <>
      {pathname !== '/add-address' && pathname !== '/search' && (
        <AssistiveTouch
          cartCount={cartCount}
          activeOrderId={activeOrder?.id}
          enabled={assistiveTouchEnabled}
          onCartPress={() => router.push('/cart')}
          onCartUpdated={(c) => setCartCount(c)}
        />
      )}

      <HappidoAICopilotModal
        visible={showAICopilot}
        onClose={() => setShowAICopilot(false)}
        onCartUpdated={(c) => setCartCount(c)}
        onNavigateToCart={() => router.push('/cart')}
      />

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={() => setIsVIP(true)}
        isVIP={isVIP}
      />

      {!pathname.includes('/restaurant/') && !pathname.includes('/tracking') && !pathname.includes('/blood-tracking') && !pathname.includes('/volunteer-tracking') && pathname !== '/cart' && pathname !== '/checkout' && !pathname.includes('login') && !pathname.includes('register') && !pathname.includes('onboarding') && (
        <GlobalCartBanner 
          cartCount={cartCount} 
          hasBottomNav={pathname !== '/add-address' && pathname !== '/search'} 
        />
      )}

      {!pathname.includes('/tracking') && !pathname.includes('/restaurant/') && pathname !== '/add-address' && pathname !== '/cart' && pathname !== '/checkout' && pathname !== '/search' && !pathname.includes('login') && !pathname.includes('register') && !pathname.includes('onboarding') && (
        <BottomNavBar activeTab={activeTab} ordersBadge={activeOrder ? 1 : 0} />
      )}

      <CustomerProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userName={userName}
        userEmail={userEmail || "guest@happido.com"}
        userPhone={userPhone || "No Phone"}
        assistiveTouchEnabled={assistiveTouchEnabled}
        onToggleAssistiveTouch={handleToggleAssistiveTouch}
        onLogout={handleLogout}
        onNavigate={(route) => router.push(route as any)}
      />

      <NotificationCenterModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onActionClick={(route) => router.push(route as any)}
        newNotification={newGlobalNotification}
      />

      <LocationPickerModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />

      <EmergencyBloodModal />
    </>
  );
}
