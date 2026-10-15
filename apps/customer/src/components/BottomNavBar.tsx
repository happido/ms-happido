import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavBarProps {
  activeTab?: 'home' | 'food' | 'rides' | 'blood' | 'orders';
  ordersBadge?: number;
}

export default function BottomNavBar({ activeTab = 'home', ordersBadge = 1 }: BottomNavBarProps) {
  const router = useRouter();

  const tabs = [
    { id: 'home', label: 'Home', icon: 'home-outline' as const, activeIcon: 'home' as const, route: '/' },
    { id: 'food', label: 'Food', icon: 'fast-food-outline' as const, activeIcon: 'fast-food' as const, route: '/restaurants' },
    { id: 'rides', label: 'Rides', icon: 'car-sport-outline' as const, activeIcon: 'car-sport' as const, route: '/map' },
    { id: 'blood', label: 'Blood', icon: 'water-outline' as const, activeIcon: 'water' as const, route: '/blood-request' },
    { id: 'orders', label: 'Orders', icon: 'receipt-outline' as const, activeIcon: 'receipt' as const, route: '/orders', badge: ordersBadge },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const iconName = isActive ? tab.activeIcon : tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabBtn}
              onPress={() => router.replace(tab.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                <Ionicons
                  name={iconName}
                  size={20}
                  color={isActive ? '#EA580C' : '#64748B'}
                />
                {tab.badge && tab.badge > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 999,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: '100%',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.08)',
        borderWidth: 1,
        borderColor: '#E2E8F0',
      },
      default: {
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 38,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'relative',
  },
  activeIconWrapper: {
    backgroundColor: '#FFF7ED',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 4,
    backgroundColor: '#EA580C',
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  activeLabel: {
    color: '#EA580C',
    fontWeight: '800',
  },
});
