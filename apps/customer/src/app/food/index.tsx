import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import api from '../../utils/api';

// Rapido Brand Colors
const RAPIDO_YELLOW = '#F9C935';
const RAPIDO_BLACK = '#1C1C1C';

export default function FoodDashboard() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/restaurants');
      setRestaurants(res.data || []);
    } catch (error) {
      console.log('Error fetching restaurants', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRestaurant = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <TouchableOpacity 
        style={styles.restaurantCard} 
        onPress={() => router.push(`/restaurant/${item._id}`)}
      >
        <Image 
          source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600' }} 
          style={styles.restaurantImage} 
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.restaurantName} numberOfLines={1}>{item.name || 'Restaurant Name'}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.0'}</Text>
            </View>
          </View>
          <Text style={styles.restaurantDesc} numberOfLines={2}>{item.description || 'Delicious food delivered fast.'}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.footerText}>30-40 mins</Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="bicycle-outline" size={16} color="#64748B" />
              <Text style={styles.footerText}>Free Delivery</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/restaurants')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.locationTitleBox}>
          <Text style={styles.deliverToText}>Delivering to</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.currentLocationText}>Current Location</Text>
            <Ionicons name="chevron-down" size={16} color="#1E293B" style={{marginLeft: 4}}/>
          </View>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
          <Ionicons name="cart" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Craving Something?</Text>
            <Text style={styles.bannerSub}>Get up to 50% OFF on your first 3 food orders!</Text>
          </View>
          <Image source={{uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=300'}} style={styles.bannerImage} />
        </View>
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Top Restaurants Nearby</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={RAPIDO_BLACK} style={{marginTop: 40}} />
        ) : (
          <FlatList
            data={restaurants}
            keyExtractor={item => item._id}
            renderItem={renderRestaurant}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    zIndex: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  cartBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  locationTitleBox: { alignItems: 'center' },
  deliverToText: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
  currentLocationText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  
  bannerContainer: { padding: 20 },
  banner: {
    backgroundColor: RAPIDO_BLACK, borderRadius: 20, flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  bannerTextContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  bannerTitle: { color: RAPIDO_YELLOW, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  bannerSub: { color: '#FFF', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  bannerImage: { width: 120, height: '100%' },

  listContainer: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  
  restaurantCard: {
    backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  restaurantImage: { width: '100%', height: 160 },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  restaurantName: { fontSize: 18, fontWeight: '800', color: '#1E293B', flex: 1, marginRight: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { color: '#FFF', fontWeight: '800', fontSize: 12, marginLeft: 4 },
  restaurantDesc: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  footerText: { fontSize: 13, fontWeight: '600', color: '#475569', marginLeft: 6 }
});
