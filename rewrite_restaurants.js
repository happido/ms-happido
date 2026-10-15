const fs = require('fs');
const file = '/Users/apple/MS Happido/apps/customer/src/app/restaurants.tsx';

const newContent = `
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, SafeAreaView, Switch, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { MOCK_SWIGGY_FEED } from '../utils/mockSwiggyFeed';

const { width } = Dimensions.get('window');

const FoodHeader = ({ title, backgroundColor }: { title: string, backgroundColor: string }) => {
  const [isVegMode, setIsVegMode] = useState(false);
  
  return (
    <View style={[styles.headerContainer, { backgroundColor }]}>
      <View style={styles.headerTop}>
        <View style={styles.addressContainer}>
          <Text style={styles.addressTitle}>
             <Ionicons name="location-sharp" size={16} color="#FFF" /> Home
             <Ionicons name="chevron-down" size={16} color="#FFF" />
          </Text>
          <Text style={styles.addressSubtitle} numberOfLines={1}>TarakaRama Nagar, Kadapa, An...</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="menu" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={{marginLeft: 12}} />
          <TextInput 
            placeholder="Search for 'Pizza'"
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
          <MaterialCommunityIcons name="microphone" size={20} color="#EA580C" style={{marginRight: 12}} />
        </View>
        
        <View style={styles.vegToggle}>
          <Text style={styles.vegText}>VEG</Text>
          <Switch 
            value={isVegMode}
            onValueChange={setIsVegMode}
            trackColor={{ false: '#d1d1d1', true: '#16A34A' }}
            thumbColor={isVegMode ? '#FFF' : '#FFF'}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>
      
      {/* Top Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        <View style={[styles.tab, styles.activeTab]}>
          <Ionicons name="grid" size={14} color="#FFF" style={{marginRight: 4}} />
          <Text style={styles.activeTabText}>ALL</Text>
        </View>
        <View style={styles.tab}>
          <Ionicons name="storefront" size={14} color="#F1F5F9" style={{marginRight: 4}} />
          <Text style={styles.tabText}>STORE</Text>
        </View>
        <View style={styles.tab}>
          <MaterialIcons name="local-offer" size={14} color="#F1F5F9" style={{marginRight: 4}} />
          <Text style={styles.tabText}>OFFERS</Text>
        </View>
        <View style={styles.tab}>
          <Ionicons name="flash" size={14} color="#F1F5F9" style={{marginRight: 4}} />
          <Text style={styles.tabText}>BOLT</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const QuickCategories = ({ items }: { items: any[] }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
      {items.map((item, index) => (
        <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).springify()} style={styles.categoryCard}>
          <Image source={{ uri: item.image }} style={styles.categoryImg} />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(100,0,0,0.8)']} style={styles.categoryGradient} />
          <Text style={styles.categoryTitle}>{item.title}</Text>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const RichRestaurantCard = ({ item }: { item: any }) => {
  return (
    <TouchableOpacity style={styles.richCard} activeOpacity={0.9}>
      <View style={styles.richImgContainer}>
        <Image source={{ uri: item.image }} style={styles.richImg} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.richGradient} />
        
        <View style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={20} color="#FFF" />
        </View>

        <View style={styles.richOfferOverlay}>
          <Text style={styles.richOfferText}>{item.offer}</Text>
        </View>
      </View>
      <View style={styles.richInfo}>
        <Text style={styles.richName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.richMetaRow}>
          <Ionicons name="star-circle" size={16} color="#16A34A" />
          <Text style={styles.richRating}>{item.rating}</Text>
          <Text style={styles.richDot}>•</Text>
          <Text style={styles.richTime}>{item.time}</Text>
        </View>
        <Text style={styles.richCuisine} numberOfLines={1}>{item.cuisine}</Text>
      </View>
    </TouchableOpacity>
  );
};

const RestaurantHorizontalList = ({ title, items }: { title: string, items: any[] }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
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

export default function RestaurantsScreen() {
  const [feed, setFeed] = useState<any[]>(MOCK_SWIGGY_FEED);

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'theme_header':
        return <FoodHeader key={widget.id} title={widget.title} backgroundColor={widget.backgroundColor} />;
      case 'quick_categories':
        return <QuickCategories key={widget.id} items={widget.items} />;
      case 'restaurant_horizontal_list':
        return <RestaurantHorizontalList key={widget.id} title={widget.title} items={widget.items} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} bounces={false}>
        {feed.map(widget => renderWidget(widget))}
        
        {/* Bottom spacer */}
        <View style={{height: 100}} />
      </ScrollView>
      
      {/* Footer Banner */}
      <View style={styles.footerBanner}>
        <LinearGradient colors={['#7E3AF2', '#E024CE']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.footerGradient}>
          <Text style={styles.footerText}>Hurry, ₹50 Free Cash</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mainScroll: { flex: 1 },
  
  // Header
  headerContainer: { paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  addressContainer: { flex: 1 },
  addressTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  addressSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20, alignItems: 'center' },
  searchBar: { flex: 1, height: 48, backgroundColor: '#FFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  searchInput: { flex: 1, height: '100%', fontSize: 16, color: '#333' },
  vegToggle: { height: 48, backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center' },
  vegText: { fontSize: 10, fontWeight: '800', color: '#16A34A', marginBottom: -4 },
  
  tabsScroll: { paddingHorizontal: 16, gap: 24, marginTop: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#FFF' },
  tabText: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  activeTabText: { fontSize: 13, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },

  // Categories
  categoriesScroll: { paddingHorizontal: 16, gap: 12, paddingVertical: 20, backgroundColor: '#8E0038' },
  categoryCard: { width: 100, height: 130, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#D4AF37' },
  categoryImg: { width: '100%', height: '100%' },
  categoryGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  categoryTitle: { position: 'absolute', bottom: 12, left: 8, color: '#FFF', fontSize: 12, fontWeight: '800', textAlign: 'center', width: '100%' },

  // Sections
  sectionContainer: { marginTop: 24, paddingBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1C1C1C', paddingHorizontal: 16, marginBottom: 16 },
  
  // Rich Cards
  richScroll: { paddingHorizontal: 16, gap: 16 },
  richCard: { width: 140, overflow: 'hidden' },
  richImgContainer: { width: 140, height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F1F5F9', position: 'relative' },
  richImg: { width: '100%', height: '100%' },
  richGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  heartIcon: { position: 'absolute', top: 12, right: 12 },
  richOfferOverlay: { position: 'absolute', bottom: 12, left: 12 },
  richOfferText: { color: '#FFF', fontSize: 16, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 },
  
  richInfo: { marginTop: 12 },
  richName: { fontSize: 15, fontWeight: '800', color: '#1C1C1C', marginBottom: 4 },
  richMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  richRating: { fontSize: 13, fontWeight: '800', color: '#333', marginLeft: 4 },
  richDot: { fontSize: 12, color: '#999', marginHorizontal: 6 },
  richTime: { fontSize: 13, fontWeight: '700', color: '#333' },
  richCuisine: { fontSize: 13, color: '#666' },

  footerBanner: { position: 'absolute', bottom: 60, left: 0, right: 0, height: 50 },
  footerGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#FFF', fontSize: 16, fontWeight: '900' }
});
`;

fs.writeFileSync(file, newContent);
console.log("restaurants.tsx completely rewritten");
