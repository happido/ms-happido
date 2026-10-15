import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: 'home', route: '/', type: 'ion' },
    { name: 'Food', icon: 'fast-food', route: '/restaurants', type: 'ion' },
    { name: 'Rides', icon: 'car-sport', route: '/map', type: 'ion' },
    { name: 'Blood', icon: 'water', route: '/blood-request', type: 'ion' },
    { name: 'Orders', icon: 'receipt-outline', route: '/orders', type: 'ion' },
  ];

  if (pathname.includes('login') || pathname.includes('register') || pathname.includes('onboarding')) {
    return null;
  }

  // Fallback for Web if expo-router's usePathname() lags or caches incorrectly
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const webPath = window.location.pathname;
    if (webPath.includes('login') || webPath.includes('register') || webPath.includes('onboarding')) {
      return null;
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'magenta' }]}>
      <View style={[styles.container, { backgroundColor: 'magenta' }]}>
        {navItems.map((item) => {
          const isActive = pathname === item.route;
          const color = isActive ? '#EA580C' : '#94A3B8';
          
          return (
            <TouchableOpacity 
              key={item.name} 
              style={styles.navItem} 
              onPress={() => router.push(item.route as any)}
            >
              {item.type === 'ion' ? (
                <Ionicons name={isActive ? item.icon.replace('-outline', '') as any : item.icon as any} size={24} color={color} />
              ) : (
                <MaterialCommunityIcons name={item.icon as any} size={26} color={color} />
              )}
              <Text style={[styles.navText, { color, fontWeight: isActive ? '700' : '500' }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 8 },
    }),
  },
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFF',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
  },
});
