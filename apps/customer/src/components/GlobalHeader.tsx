import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useGlobalState } from '@/context/GlobalContext';

export default function GlobalHeader() {
  const {
    userName,
    selectedLocation,
    setShowLocationModal,
    isVIP,
    setShowSubscriptionModal,
    setShowNotificationModal,
    setShowProfileModal,
  } = useGlobalState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={() => setShowLocationModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={16} color="#EA580C" />
            <Text style={styles.locationText} numberOfLines={1}>{selectedLocation}</Text>
            <Ionicons name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text style={styles.greeting}>Hey, <Text style={styles.userName}>{userName}</Text> 👋</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity 
            style={[
              styles.notifHeaderBtn, 
              { width: 'auto', backgroundColor: isVIP ? '#F59E0B' : '#F1F5F9', paddingHorizontal: 16, borderRadius: 21, flexDirection: 'row', gap: 6, borderWidth: isVIP ? 0 : 1, overflow: 'hidden' }
            ]}
            onPress={() => setShowSubscriptionModal(true)}
          >
            {isVIP && (
              <LinearGradient
                colors={['#FBBF24', '#D97706']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <Ionicons name="star" size={16} color={isVIP ? '#FFFFFF' : '#94A3B8'} style={{ zIndex: 1 }} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: isVIP ? '#FFFFFF' : '#64748B', letterSpacing: 0.5, zIndex: 1 }}>
              {isVIP ? 'GOLD' : 'UPGRADE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notifHeaderBtn}
            onPress={() => setShowNotificationModal(true)}
          >
            <Ionicons name="notifications-outline" size={22} color="#0F172A" />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowProfileModal(true)} style={styles.profileAvatar}>
            <LinearGradient colors={['#F97316', '#EA580C']} style={StyleSheet.absoluteFill} />
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
