import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const RAPIDO_BLACK = '#1C1C1C';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
        <Ionicons name="home" size={24} color={pathname === '/' ? RAPIDO_BLACK : '#94A3B8'} />
        <Text style={[styles.navLabel, pathname === '/' && { color: RAPIDO_BLACK }]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/wallet')}>
        <Ionicons name="wallet-outline" size={24} color={pathname === '/wallet' ? RAPIDO_BLACK : '#94A3B8'} />
        <Text style={[styles.navLabel, pathname === '/wallet' && { color: RAPIDO_BLACK }]}>Earnings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/performance')}>
        <Ionicons name="stats-chart" size={24} color={pathname === '/performance' ? RAPIDO_BLACK : '#94A3B8'} />
        <Text style={[styles.navLabel, pathname === '/performance' && { color: RAPIDO_BLACK }]}>Performance</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/help')}>
        <Ionicons name="menu" size={24} color={pathname === '/help' ? RAPIDO_BLACK : '#94A3B8'} />
        <Text style={[styles.navLabel, pathname === '/help' && { color: RAPIDO_BLACK }]}>Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
