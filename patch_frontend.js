const fs = require('fs');

const content = `
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import api from '@/utils/api';

const { width } = Dimensions.get('window');

const FoodHeader = ({ title, backgroundColor, bannerText, activeTab, setActiveTab }: { title?: string, backgroundColor: string, bannerText?: string, activeTab: string, setActiveTab: (t: string) => void }) => {
  const [isVegMode, setIsVegMode] = useState(false);
  
  return (
    <View style={[styles.headerContainer, { backgroundColor, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 40 }]}>
      <View style={styles.headerTop}>
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="location" size={16} color="#FFF" />
            <Text style={styles.locationTitle}>45/150-128</Text>
            <Ionicons name="chevron-down" size={16} color="#FFF" />
          </View>
          <Text style={styles.locationSub}>TarakaRama Nagar, Kadapa...</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person-circle-outline" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { flex: 1, backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 4 }]}>
          <Ionicons name="search" size={20} color="#666" style={{marginLeft: 16}} />
          <TextInput 
            placeholder="Search for 'Biryani'"
            style={[styles.searchInput, { fontSize: 16, fontWeight: '500', color: '#333' }]}
            placeholderTextColor="#888"
          />
          <View style={{ borderLeftWidth: 1, borderLeftColor: '#E2E8F0', paddingLeft: 12, marginRight: 16 }}>
             <MaterialCommunityIcons name="microphone" size={20} color="#EA580C" />
          </View>
        </View>
        
        <View style={styles.vegToggle}>
          <Text style={styles.vegText}>VEG</Text>
          <MaterialCommunityIcons name={isVegMode ? "toggle-switch" : "toggle-switch-off"} size={36} color={isVegMode ? "#16A34A" : "#CCC"} onPress={() => setIsVegMode(!isVegMode)} />
        </View>
      </View>

      {bannerText && (
        <View style={{ alignItems: 'center', marginTop: 24 }}>
           <Text style={{ fontSize: 32, fontWeight: '900', color: '#FDE047', fontStyle: 'italic', letterSpacing: 2 }}>{bannerText}</Text>
           <View style={{ backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4 }}>
             <Text style={{ color: '#FDE047', fontSize: 12, fontWeight: '800' }}>ORDER NOW</Text>
           </View>
        </View>
      )}
      
      {/* Top Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabsScroll, { marginTop: 24 }]}>
        <TouchableOpacity style={styles.tabWrapper} onPress={() => setActiveTab('ALL')}>
          <View style={[styles.tab, activeTab === 'ALL' && styles.activeTabBg]}>
            <Text style={activeTab === 'ALL' ? styles.activeTabText : styles.tabText}>TOP RATED</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabWrapper} onPress={() => setActiveTab('OFFERS')}>
          <View style={[styles.tab, activeTab === 'OFFERS' && styles.activeTabBg]}>
            <Text style={activeTab === 'OFFERS' ? styles.activeTabText : styles.tabText}>FOOD IN 15 MINS</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const TallOffersList = ({ items }: { items: any[] }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, marginTop: -20, paddingBottom: 20 }}>
      {items.map((item: any, index: number) => (
        <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).springify()} style={[styles.tallOfferCard, { backgroundColor: item.bgColor }]}>
          <Text style={styles.tallOfferTitle}>{item.title}</Text>
          <View style={styles.tallOfferBadge}>
            <Text style={styles.tallOfferSubtitle}>{item.subtitle}</Text>
          </View>
          <Image source={{uri: item.image}} style={styles.tallOfferImg} />
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const CircularCategories = ({ items }: { items: any[] }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 20, paddingVertical: 16 }}>
      {items.map((item: any, index: number) => (
        <Animated.View key={item.id} entering={FadeInRight.delay(index * 50).springify()} style={{ alignItems: 'center' }}>
          <Image source={{uri: item.image}} style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 8 }} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>{item.title}</Text>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const FilterPills = ({ items }: { items: string[] }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 16 }}>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.filterPill}>
          <Text style={styles.filterPillText}>{item}</Text>
          {item === 'Sort by' && <Ionicons name="chevron-down" size={14} color="#333" style={{marginLeft: 4}} />}
          {item === 'Filter' && <Ionicons name="options-outline" size={14} color="#333" style={{marginLeft: 4}} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const RichRestaurantCard = ({ item }: { item: any }) => {
  return (
    <TouchableOpacity style={styles.richCard} activeOpacity={0.9}>
      <View style={styles.richImgContainer}>
        <Image source={{ uri: item.image }} style={styles.richImg} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.richGradient} />
        
        <View style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={20} color="#FFF" />
        </View>
        <View style={styles.richAddBtn}>
          <Ionicons name="add" size={20} color="#16A34A" />
        </View>

        <View style={styles.richOfferOverlay}>
          <Text style={styles.richOfferText}>{item.offer}</Text>
        </View>
      </View>
      <View style={styles.richInfo}>
        <Text style={styles.richName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.richMetaRow}>
          <MaterialCommunityIcons name="star-circle" size={16} color="#16A34A" />
          <Text style={styles.richRating}>{item.rating} ({item.ratingCount})</Text>
        </View>
        <View style={[styles.richMetaRow, {marginTop: 2}]}>
          <Text style={[styles.richCuisine, { fontWeight: '700', color: '#1C1C1C' }]}>{item.discountPrice}</Text>
          <Text style={[styles.richCuisine, { textDecorationLine: 'line-through', marginLeft: 4 }]}>{item.originalPrice}</Text>
        </View>
        <Text style={[styles.richCuisine, { marginTop: 4 }]} numberOfLines={1}>{item.cuisine}</Text>
      </View>
    </TouchableOpacity>
  );
};

const RestaurantHorizontalList = ({ title, items }: { title: string, items: any[] }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 }}>
         <Text style={styles.sectionTitle}>{title}</Text>
         <Text style={{ color: '#EA580C', fontWeight: '700' }}>View All {'>'}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.richScroll}>
        {items.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).springify()}>
            <RichRestaurantCard item={item} />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const VerticalRestaurantCard = ({ item }: { item: any }) => {
  return (
    <TouchableOpacity style={styles.verticalCard} activeOpacity={0.9}>
      <View style={styles.verticalImgContainer}>
        <Image source={{ uri: item.image }} style={styles.verticalImg} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.verticalGradient} />
        
        <View style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={24} color="#FFF" />
          <Ionicons name="ellipsis-vertical" size={20} color="#FFF" style={{marginTop: 12}} />
        </View>

        <View style={styles.verticalOfferOverlay}>
          <Text style={styles.verticalOfferText}>{item.offer}</Text>
        </View>
      </View>
      
      <View style={styles.verticalInfoRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.verticalName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.verticalMetaRow}>
            <MaterialCommunityIcons name="star-circle" size={18} color="#16A34A" />
            <Text style={styles.verticalMetaText}>{item.rating} ({item.ratingCount})</Text>
            <Text style={styles.verticalDot}>•</Text>
            <Text style={styles.verticalMetaText}>{item.time}</Text>
          </View>
          <Text style={styles.verticalCuisine} numberOfLines={1}>{item.cuisine} • {item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RestaurantVerticalList = ({ title, subtitle, items }: { title: string, subtitle?: string, items: any[] }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{subtitle}</Text>}
      </View>
      <View style={styles.verticalListContainer}>
        {items.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).springify()}>
            <VerticalRestaurantCard item={item} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default function RestaurantsScreen() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const response = await api.get(\`/restaurants/feed?tab=\${activeTab}\`);
        if (response.data && response.data.length > 0) {
          setFeed(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic feed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [activeTab]);

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'theme_header':
        return <FoodHeader key={widget.id} title={widget.title} backgroundColor={widget.backgroundColor} bannerText={widget.bannerText} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'tall_offers_list':
        return <TallOffersList key={widget.id} items={widget.items} />;
      case 'circular_categories':
        return <CircularCategories key={widget.id} items={widget.items} />;
      case 'filter_pills':
        return <FilterPills key={widget.id} items={widget.items} />;
      case 'restaurant_vertical_list':
        return <RestaurantVerticalList key={widget.id} title={widget.title} subtitle={widget.subtitle} items={widget.items} />;
      case 'restaurant_horizontal_list':
        return <RestaurantHorizontalList key={widget.id} title={widget.title} items={widget.items} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {loading ? <ActivityIndicator size="large" color="#EA580C" style={{marginTop: 100}} /> : <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} bounces={false}>
        {feed.map(widget => renderWidget(widget))}
        <View style={{height: 100}} />
      </ScrollView>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  mainScroll: { flex: 1 },
  
  // Header
  headerContainer: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  locationTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginHorizontal: 6 },
  locationSub: { color: '#D1D5DB', fontSize: 13, marginTop: 4 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 0 },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 12 },
  
  vegToggle: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 12, alignItems: 'center', justifyContent: 'center' },
  vegText: { fontSize: 10, fontWeight: '800', color: '#16A34A', marginBottom: -4 },
  
  tabsScroll: { gap: 12 },
  tabWrapper: { overflow: 'hidden', borderRadius: 24 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
  activeTabBg: { backgroundColor: '#FFF' },
  tabText: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#EA580C', fontSize: 14, fontWeight: '800' },
  
  // Tall Offers
  tallOfferCard: { width: 110, height: 150, borderRadius: 16, padding: 12, overflow: 'hidden' },
  tallOfferTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  tallOfferBadge: { backgroundColor: 'rgba(255,0,0,0.8)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  tallOfferSubtitle: { color: '#FFF', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  tallOfferImg: { position: 'absolute', bottom: -10, right: -10, width: 80, height: 80, borderRadius: 40 },

  // Filter Pills
  filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  filterPillText: { fontSize: 13, fontWeight: '600', color: '#333' },

  // Sections
  sectionContainer: { marginTop: 12, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1C1C1C' },
  
  // Rich Cards (Horizontal)
  richScroll: { paddingHorizontal: 16, gap: 16 },
  richCard: { width: 150, overflow: 'hidden' },
  richImgContainer: { width: 150, height: 160, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F1F5F9', position: 'relative' },
  richImg: { width: '100%', height: '100%' },
  richGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  heartIcon: { position: 'absolute', top: 12, right: 12, alignItems: 'center' },
  richAddBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#FFF', borderRadius: 8, padding: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  richOfferOverlay: { position: 'absolute', bottom: 12, left: 12 },
  richOfferText: { color: '#FFF', fontSize: 16, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 },
  
  richInfo: { marginTop: 8 },
  richName: { fontSize: 15, fontWeight: '800', color: '#1C1C1C', marginBottom: 2 },
  richMetaRow: { flexDirection: 'row', alignItems: 'center' },
  richRating: { fontSize: 13, fontWeight: '700', color: '#444', marginLeft: 4 },
  richCuisine: { fontSize: 13, color: '#666' },

  // Vertical Cards
  verticalListContainer: { paddingHorizontal: 16, gap: 24 },
  verticalCard: { width: '100%', overflow: 'hidden' },
  verticalImgContainer: { width: '100%', height: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: '#F1F5F9', position: 'relative' },
  verticalImg: { width: '100%', height: '100%' },
  verticalGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  verticalOfferOverlay: { position: 'absolute', bottom: 16, left: 16 },
  verticalOfferText: { color: '#FFF', fontSize: 24, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 },
  verticalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12, paddingHorizontal: 4 },
  verticalName: { fontSize: 20, fontWeight: '800', color: '#1C1C1C', marginBottom: 2 },
  verticalCuisine: { fontSize: 14, color: '#666', marginTop: 2 },
  verticalMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  verticalMetaText: { fontSize: 14, fontWeight: '700', color: '#444', marginLeft: 4 },
  verticalDot: { fontSize: 14, color: '#999', marginHorizontal: 8 },
});
`;
fs.writeFileSync('apps/customer/src/app/restaurants.tsx', content);
