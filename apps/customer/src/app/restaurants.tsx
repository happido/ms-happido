import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Dimensions, Platform, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import api from '@/utils/api';
import LottieView from 'lottie-react-native';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { VoiceSearchModal } from '@/components/VoiceSearchModal';


const { width } = Dimensions.get('window');

const FoodHeader = ({ title, backgroundColor, bannerText, activeTab, setActiveTab, searchQuery, setSearchQuery, isVegMode, setIsVegMode, onMicPress }: { title?: string, backgroundColor: string, bannerText?: string, activeTab: string, setActiveTab: (t: string) => void, searchQuery: string, setSearchQuery: (s: string) => void, isVegMode: boolean, setIsVegMode: (v: boolean) => void, onMicPress: () => void }) => {
  const router = useRouter();
  return (
    <View style={[styles.headerContainer, { backgroundColor, paddingBottom: 24, paddingTop: 16 }]}>

      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { flex: 1, backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 4, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }]}>
          <Ionicons name="search" size={20} color="#666" style={{marginLeft: 16}} />
          <TouchableOpacity onPress={() => router.push('/search')} style={{ flex: 1 }}>
            <TextInput 
              placeholder="Search for 'Biryani'"
              style={[styles.searchInput, { fontSize: 16, fontWeight: '500', color: '#333' }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
              placeholderTextColor="#888"
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onMicPress} style={{ borderLeftWidth: 1, borderLeftColor: '#E2E8F0', paddingLeft: 12, marginRight: 16 }}>
             <MaterialCommunityIcons name="microphone" size={20} color="#EA580C" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.vegToggle}>
          <Text style={styles.vegText}>VEG</Text>
          <MaterialCommunityIcons name={isVegMode ? "toggle-switch" : "toggle-switch-off"} size={36} color={isVegMode ? "#16A34A" : "#CCC"} onPress={() => setIsVegMode(!isVegMode)} />
        </View>
      </View>

      {bannerText && (
        <View style={{ alignItems: 'center', marginTop: 24 }}>
           <Text style={{ fontSize: 32, fontWeight: '900', color: '#EA580C', fontStyle: 'italic', letterSpacing: 2 }}>{bannerText}</Text>
           <View style={{ backgroundColor: '#EA580C', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4, marginBottom: 16 }}>
             <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>ORDER NOW</Text>
           </View>
           
           <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}>
             <View style={{ height: 1, width: 40, backgroundColor: '#E2E8F0' }} />
             <Text style={{ color: '#EA580C', fontSize: 11, fontWeight: '700', marginHorizontal: 12, letterSpacing: 1 }}>FLAT ₹200 OFF & MORE</Text>
             <View style={{ height: 1, width: 40, backgroundColor: '#E2E8F0' }} />
           </View>
        </View>
      )}
      
      
    </View>
  );
};

const FeedTabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingBottom: 20, paddingTop: 12 }}>
      <TouchableOpacity 
        onPress={() => setActiveTab('OFFERS')} 
        style={{ flex: 1, borderRadius: 24, overflow: 'hidden' }}
      >
        <LinearGradient 
          colors={activeTab === 'OFFERS' ? ['#F97316', '#EA580C'] : ['#FFF', '#FFF']}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: activeTab === 'OFFERS' ? 0 : 1, borderColor: '#E2E8F0', borderRadius: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="flash" size={14} color={activeTab === 'OFFERS' ? '#FFF' : '#EA580C'} />
            <Text style={{ color: activeTab === 'OFFERS' ? '#FFF' : '#EA580C', fontSize: 12, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center' }}>20 MINS</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => setActiveTab('49_STORE')} 
        style={{ flex: 1, borderRadius: 24, overflow: 'hidden' }}
      >
        <LinearGradient 
          colors={activeTab === '49_STORE' ? ['#F97316', '#EA580C'] : ['#FFF', '#FFF']}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: activeTab === '49_STORE' ? 0 : 1, borderColor: '#E2E8F0', borderRadius: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="pricetag" size={14} color={activeTab === '49_STORE' ? '#FFF' : '#EA580C'} />
            <Text style={{ color: activeTab === '49_STORE' ? '#FFF' : '#EA580C', fontSize: 12, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center' }}>₹49 STORE</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setActiveTab('ALL')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: activeTab === 'ALL' ? '#EA580C' : '#E2E8F0', backgroundColor: activeTab === 'ALL' ? '#FFF5F5' : '#FFF' }}>
        <Text style={{ color: activeTab === 'ALL' ? '#EA580C' : '#64748B', fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' }}>TOP RATED</Text>
      </TouchableOpacity>
    </View>
  );
};

const TallOffersList = ({ items }: { items: any[] }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 16, paddingBottom: 16 }}>
      {items.map((item: any, index: number) => (
        <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).springify()} style={[styles.tallOfferCard, { backgroundColor: item.bgColor }]}>
          <Text style={styles.tallOfferTitle}>{item.title ? item.title.replace(/\n/g, ' ') : ''}</Text>
          <View style={styles.tallOfferBadge}>
            <Text style={styles.tallOfferSubtitle}>{item.subtitle ? item.subtitle.replace(/\n/g, '\n') : ''}</Text>
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

const FilterPills = ({ items, activeSort, activeFilters, openSortModal, openFilterModal }: { items: string[], activeSort: string, activeFilters: string[], openSortModal: () => void, openFilterModal: () => void }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 16 }}>
      {items.map((item, index) => {
        const isSort = item === 'Sort by';
        const isFilter = item === 'Filter';
        const isActive = (isSort && activeSort !== 'relevance') || (isFilter && activeFilters.length > 0);
        
        return (
          <TouchableOpacity 
            key={index} 
            style={[styles.filterPill, isActive && { backgroundColor: '#EA580C', borderColor: '#EA580C' }]}
            onPress={() => {
              if (isSort) openSortModal();
              if (isFilter) openFilterModal();
            }}
          >
            <Text style={[styles.filterPillText, isActive && { color: '#FFF' }]}>
              {isSort && activeSort !== 'relevance' ? `Sort: ${activeSort}` : 
               isFilter && activeFilters.length > 0 ? `Filters (${activeFilters.length})` : item}
            </Text>
            {isSort && <Ionicons name="chevron-down" size={14} color={isActive ? "#FFF" : "#333"} style={{marginLeft: 4}} />}
            {isFilter && <Ionicons name="options-outline" size={14} color={isActive ? "#FFF" : "#333"} style={{marginLeft: 4}} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const DishGrid = ({ title, subtitle, items }: { title: string, subtitle: string, items: any[] }) => {
  const router = useRouter();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>{subtitle}</Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {items.map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={{ width: '48%', backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' }}
            onPress={() => router.push(`/restaurant/${item.restaurantId}`)}
          >
            <Image source={{uri: item.image}} style={{ width: '100%', height: 120 }} />
            <View style={{ padding: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={[{ borderWidth: 1, padding: 1, borderRadius: 2, alignItems: 'center', justifyContent: 'center' }, { borderColor: item.isVeg ? '#059669' : '#DC2626', width: 12, height: 12 }]} >
                  <View style={[{ borderRadius: 1 }, { backgroundColor: item.isVeg ? '#059669' : '#DC2626', width: 6, height: 6 }]} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A', flex: 1, marginLeft: 6 }} numberOfLines={1}>{item.name}</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }} numberOfLines={1}>{item.restaurantName}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#EA580C' }}>₹{item.price}</Text>
                <View style={{ backgroundColor: '#FFF5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#EA580C' }}>ADD</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const RichRestaurantCard = ({ item }: { item: any }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.richCard} activeOpacity={0.9} onPress={() => router.push(`/restaurant/${item.id || item._id || item.restaurantId}`)}>
      <View style={styles.richImgContainer}>
        <Image source={{ uri: item.image }} style={styles.richImg} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.richGradient} />
        
        <View style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={20} color="#FFF" />
        </View>

        {item.promoTag ? (
          <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#EA580C', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }}>
            <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }}>{item.promoTag.toUpperCase()}</Text>
          </View>
        ) : null}

        {item.offer ? (
          <View style={styles.richOfferOverlay}>
            <Text style={styles.richOfferText}>{item.offer}</Text>
          </View>
        ) : null}

        {item.isClosed && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderRadius: 16 }]}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>CLOSED</Text>
          </View>
        )}
      </View>
      <View style={[styles.richInfo, item.isClosed && { opacity: 0.6 }]}>
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

const RestaurantHorizontalList = ({ title, items, onViewAll }: { title: string, items: any[], onViewAll?: () => void }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 }}>
         <Text style={styles.sectionTitle}>{title}</Text>
         <TouchableOpacity onPress={onViewAll}>
           <Text style={{ color: '#EA580C', fontWeight: '700' }}>View All {'>'}</Text>
         </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.richScroll}>
        {items.map((item, index) => (
          <Animated.View key={item.id || index} entering={FadeInRight.delay(index * 100).springify()}>
            <RichRestaurantCard item={item} />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const VerticalRestaurantCard = ({ item }: { item: any }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.verticalCard} activeOpacity={0.9} onPress={() => router.push(`/restaurant/${item.id || item._id || item.restaurantId}`)}>
      <View style={styles.verticalImgContainer}>
        <Image source={{ uri: item.image }} style={styles.verticalImg} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.verticalGradient} />
        
        <View style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={24} color="#FFF" />
          <Ionicons name="ellipsis-vertical" size={20} color="#FFF" style={{marginTop: 12}} />
        </View>

        {item.promoTag ? (
          <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#EA580C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }}>
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>{item.promoTag.toUpperCase()}</Text>
          </View>
        ) : null}

        {item.offer ? (
          <View style={styles.verticalOfferOverlay}>
            <Text style={styles.verticalOfferText}>{item.offer}</Text>
          </View>
        ) : null}

        {item.isClosed && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderRadius: 16 }]}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 18, letterSpacing: 1.5 }}>CLOSED</Text>
          </View>
        )}
      </View>
      
      <View style={[styles.verticalInfoRow, item.isClosed && { opacity: 0.6 }]}>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isVegMode, setIsVegMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [activeSort, setActiveSort] = useState('relevance');
  
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const { isListening, spokenText, startVoiceSearch, stopVoiceSearch } = useVoiceSearch();
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleViewAll = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const maxPriceParam = activeTab === '49_STORE' ? '&maxPrice=49' : '';
        const sortParam = activeSort !== 'relevance' ? `&sort=${activeSort}` : '';
        const filterParam = activeFilters.length > 0 ? `&filter=${activeFilters.join(',')}` : '';
        const response = await api.get(`/restaurants/feed?tab=${activeTab}&search=${encodeURIComponent(debouncedSearch)}&veg=${isVegMode}&lat=14.4673&lng=78.8242${maxPriceParam}${sortParam}${filterParam}`);
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
  }, [activeTab, debouncedSearch, isVegMode, activeSort, activeFilters]);

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'theme_header':
        return <FoodHeader key={widget.id} title={widget.title} backgroundColor={widget.backgroundColor} bannerText={widget.bannerText} activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isVegMode={isVegMode} setIsVegMode={setIsVegMode} onMicPress={startVoiceSearch} />;
      case 'tall_offers_list':
        return <TallOffersList key={widget.id} items={widget.items} />;
      case 'circular_categories':
        return <CircularCategories key={widget.id} items={widget.items} />;
      case 'filter_pills':
        return (
          <View key={widget.id}>
            <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <FilterPills 
              items={widget.items} 
              activeSort={activeSort}
              activeFilters={activeFilters}
              openSortModal={() => setSortModalVisible(true)}
              openFilterModal={() => setFilterModalVisible(true)}
            />
          </View>
        );
      case 'restaurant_vertical_list':
        return <RestaurantVerticalList key={widget.id} title={widget.title} subtitle={widget.subtitle} items={widget.items} />;
      case 'restaurant_horizontal_list':
        return <RestaurantHorizontalList key={widget.id} title={widget.title} items={widget.items} onViewAll={handleViewAll} />;
      case 'dish_grid':
        return <DishGrid key={widget.id} title={widget.title} subtitle={widget.subtitle} items={widget.items} />;
      default:
        return null;
    }
  };

  const hasRestaurants = feed.some(w => w.type === 'restaurant_vertical_list' || w.type === 'dish_grid');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {loading && feed.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 150 }}>
          <LottieView
            autoPlay
            loop
            source={require('../../assets/animations/searching_hand.json')}
            style={{ width: 150, height: 150 }}
          />
        </View>
      ) : <ScrollView ref={scrollRef} style={styles.mainScroll} showsVerticalScrollIndicator={false} bounces={false}>
        {feed.map(widget => renderWidget(widget))}
        
        {!hasRestaurants && !loading && (
          <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 20 }}>
            <LottieView
              autoPlay
              loop
              source={require('../../assets/empty.json')}
              style={{ width: 250, height: 250 }}
            />
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1C1C1C', marginTop: 16 }}>No Feeds Available</Text>
            <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 }}>We couldn't find any restaurants matching your filters. Try adjusting them!</Text>
          </View>
        )}
        
        <View style={{height: 100}} />
      </ScrollView>}

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} transparent={true} animationType="slide" onRequestClose={() => setSortModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Sort by</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1C1C1C" />
              </TouchableOpacity>
            </View>
            <View style={styles.bottomSheetContent}>
              {[
                { id: 'relevance', label: 'Relevance (Default)' },
                { id: 'rating', label: 'Rating: High to Low' },
                { id: 'time', label: 'Delivery Time: Low to High' },
                { id: 'cost_asc', label: 'Cost: Low to High' },
                { id: 'cost_desc', label: 'Cost: High to Low' }
              ].map(option => (
                <TouchableOpacity 
                  key={option.id} 
                  style={styles.bottomSheetOption}
                  onPress={() => {
                    setActiveSort(option.id);
                    setSortModalVisible(false);
                  }}
                >
                  <Text style={[styles.bottomSheetOptionText, activeSort === option.id && { color: '#EA580C', fontWeight: '800' }]}>{option.label}</Text>
                  {activeSort === option.id && <Ionicons name="checkmark-circle" size={24} color="#EA580C" />}
                  {activeSort !== option.id && <Ionicons name="ellipse-outline" size={24} color="#E2E8F0" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent={true} animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
          <View style={[styles.bottomSheet, { height: '60%' }]} onStartShouldSetResponder={() => true}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1C1C1C" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.bottomSheetContent}>
              <Text style={styles.filterSectionTitle}>Cuisines</Text>
              <View style={styles.filterChipContainer}>
                {['Biryani', 'South Indian', 'North Indian', 'Chinese', 'Fast Food', 'Desserts'].map(cuisine => {
                  const isSelected = activeFilters.includes(cuisine);
                  return (
                    <TouchableOpacity 
                      key={cuisine}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                      onPress={() => {
                        if (isSelected) {
                          setActiveFilters(activeFilters.filter(f => f !== cuisine));
                        } else {
                          setActiveFilters([...activeFilters, cuisine]);
                        }
                      }}
                    >
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>{cuisine}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.filterSectionTitle}>Rating</Text>
              <View style={styles.filterChipContainer}>
                {['Ratings 4.5+', 'Ratings 4.0+'].map(rating => {
                  const isSelected = activeFilters.includes(rating);
                  return (
                    <TouchableOpacity 
                      key={rating}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                      onPress={() => {
                        // Mutually exclusive for ratings
                        let newFilters = activeFilters.filter(f => !f.startsWith('Ratings'));
                        if (!isSelected) {
                          newFilters.push(rating);
                        }
                        setActiveFilters(newFilters);
                      }}
                    >
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>{rating}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity style={styles.clearBtn} onPress={() => setActiveFilters([])}>
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <VoiceSearchModal visible={isListening} spokenText={spokenText} onClose={stopVoiceSearch} />
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
  tallOfferCard: { width: 130, height: 180, borderRadius: 20, padding: 14, overflow: 'hidden' },
  tallOfferTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  tallOfferBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
  tallOfferSubtitle: { color: '#FFF', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  tallOfferImg: { position: 'absolute', bottom: -10, right: -10, width: 90, height: 90, borderRadius: 45 },

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

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  bottomSheet: { width: '100%', maxWidth: 420, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  bottomSheetTitle: { fontSize: 20, fontWeight: '900', color: '#1C1C1C' },
  bottomSheetContent: { paddingBottom: 20 },
  bottomSheetOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  bottomSheetOptionText: { fontSize: 16, color: '#333', fontWeight: '600' },
  
  filterSectionTitle: { fontSize: 16, fontWeight: '800', color: '#1C1C1C', marginTop: 16, marginBottom: 12 },
  filterChipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  filterChipActive: { backgroundColor: '#EA580C', borderColor: '#EA580C' },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#333' },
  filterChipTextActive: { color: '#FFF' },
  bottomSheetFooter: { flexDirection: 'row', gap: 16, marginTop: 16 },
  clearBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  clearBtnText: { fontSize: 16, fontWeight: '700', color: '#64748B' },
  applyBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#EA580C', alignItems: 'center' },
  applyBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
