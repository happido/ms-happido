import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import api from '@/utils/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const [query, setQuery] = useState(initialQuery || '');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllRestaurants = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await api.get('/restaurants?lat=14.4673&lng=78.8242');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllRestaurants();
    }, [])
  );

  const matchingRestaurants = restaurants.filter(r => 
    r.restaurantName?.toLowerCase().includes(query.toLowerCase())
  );

  const matchingDishes: any[] = [];
  restaurants.forEach(r => {
    if (r.menu) {
      r.menu.forEach((item: any) => {
        const dishName = item.name || item.itemName || '';
        if (dishName.toLowerCase().includes(query.toLowerCase())) {
          matchingDishes.push({
             ...item,
             name: dishName,
             restaurantId: r._id,
             restaurantName: r.restaurantName,
             restaurantImage: r.documents?.profilePhotoUrl
          });
        }
      });
    }
  });

  const popularCuisines = [
    { name: 'Biryani', image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=200&q=80' },
    { name: 'Dosa', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&q=80' },
    { name: 'Idli', image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=200&q=80' },
    { name: 'Meals', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&q=80' },
    { name: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&q=80' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/restaurants')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            placeholder="Search for restaurants and food"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#EA580C" style={{ marginTop: 40 }} />
      ) : query.length === 0 ? (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchAllRestaurants(true)} tintColor="#EA580C" />
          }
        >
          <Text style={styles.sectionTitle}>Popular Cuisines</Text>
          <View style={styles.cuisinesGrid}>
            {popularCuisines.map((item, index) => (
              <TouchableOpacity key={index} style={styles.cuisineItem} onPress={() => setQuery(item.name)}>
                <Image source={{ uri: item.image }} style={styles.cuisineImg} />
                <Text style={styles.cuisineText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchAllRestaurants(true)} tintColor="#EA580C" />
          }
        >
          
          {matchingDishes.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>Dishes</Text>
              {matchingDishes.map((dish, index) => (
                <Animated.View key={`dish-${index}`} entering={FadeInDown.delay(index * 50)}>
                  <TouchableOpacity style={styles.resultCard} onPress={() => router.push(`/restaurant/${dish.restaurantId}` as any)}>
                    <Image source={{ uri: dish.restaurantImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' }} style={styles.resultImage} />
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{dish.name}</Text>
                      <Text style={styles.resultSub}>₹{dish.price} • {dish.type}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Ionicons name="storefront-outline" size={12} color="#64748B" />
                        <Text style={styles.restaurantRefText}>{dish.restaurantName}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {matchingRestaurants.length > 0 && (
            <View style={[styles.resultsSection, { marginTop: matchingDishes.length > 0 ? 24 : 0 }]}>
              <Text style={styles.sectionTitle}>Restaurants</Text>
              {matchingRestaurants.map((restaurant, index) => (
                <Animated.View key={`res-${restaurant._id}`} entering={FadeInDown.delay(index * 50)}>
                  <TouchableOpacity style={styles.resultCard} onPress={() => router.push(`/restaurant/${restaurant._id}` as any)}>
                    <Image source={{ uri: restaurant.documents?.profilePhotoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80' }} style={styles.resultImage} />
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{restaurant.restaurantName}</Text>
                      <Text style={styles.resultSub}>Restaurant • {restaurant.isVerified ? 'Verified' : 'New'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {matchingDishes.length === 0 && matchingRestaurants.length === 0 && (
            <View style={styles.emptyState}>
              <LottieView
                source={require('../../assets/empty.json')}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySub}>We couldn't find anything matching "{query}"</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFF',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cuisinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cuisineItem: {
    width: '28%',
    alignItems: 'center',
    marginBottom: 16,
  },
  cuisineImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  cuisineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  resultsSection: {
    marginBottom: 8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 16,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  resultSub: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  restaurantRefText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
