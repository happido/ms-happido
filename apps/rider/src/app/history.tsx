import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BottomNav from '../components/BottomNav';

export default function HistoryScreen() {
  const [rides, setRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/rides/history');
      setRides(res.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch ride history');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRide = ({ item, index }: { item: any, index: number }) => {
    const isCompleted = item.status === 'completed';
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)} style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: isCompleted ? '#ECFDF5' : '#FEF2F2' }]}>
            <Text style={[styles.statusText, { color: isCompleted ? '#10B981' : '#EF4444' }]}>
              {isCompleted ? 'Completed' : 'Cancelled'}
            </Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locRow}>
            <View style={styles.dotStart} />
            <Text style={styles.locText} numberOfLines={1}>Pickup Location (Lat: {item.pickupLocation?.coordinates[1]?.toFixed(2)})</Text>
          </View>
          <View style={styles.locLine} />
          <View style={styles.locRow}>
            <View style={styles.dotEnd} />
            <Text style={styles.locText} numberOfLines={1}>Dropoff Location (Lat: {item.dropoffLocation?.coordinates[1]?.toFixed(2)})</Text>
          </View>
        </View>

        <View style={styles.rideFooter}>
          <View style={styles.vehicleInfo}>
            <Ionicons name="car-outline" size={16} color="#64748B" />
            <Text style={styles.vehicleText}>{item.vehicleType?.toUpperCase() || 'AUTO'}</Text>
          </View>
          <Text style={styles.fareText}>₹{item.fare}</Text>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1C1C1C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride History</Text>
        <View style={{width: 44}} />
      </View>

      <View style={styles.listContainer}>
        {rides.length === 0 ? (
          <Text style={styles.emptyText}>No rides found. Get online to start earning!</Text>
        ) : (
          <FlatList
            data={rides}
            keyExtractor={item => item._id}
            renderItem={renderRide}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rideCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotStart: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', marginRight: 12,
  },
  dotEnd: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginRight: 12,
  },
  locLine: {
    width: 2, height: 16, backgroundColor: '#E2E8F0', marginLeft: 4, marginVertical: 2,
  },
  locText: {
    fontSize: 14, color: '#1E293B', fontWeight: '500', flex: 1,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  fareText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 40,
    fontSize: 16,
  }
});
