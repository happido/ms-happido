const fs = require('fs');
let file = fs.readFileSync('apps/customer/src/app/restaurants.tsx', 'utf8');

const verticalComponents = `
const VerticalRestaurantCard = ({ item }: { item: any }) => {
  return (
    <TouchableOpacity style={styles.verticalCard} activeOpacity={0.9}>
      <View style={styles.verticalImgContainer}>
        <Image source={{ uri: item.image }} style={styles.verticalImg} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.verticalGradient} />
        
        <View style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={22} color="#FFF" />
        </View>

        <View style={styles.verticalOfferOverlay}>
          <Text style={styles.verticalOfferText}>{item.offer}</Text>
        </View>
      </View>
      
      <View style={styles.verticalInfoRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.verticalName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.verticalCuisine} numberOfLines={1}>{item.cuisine}</Text>
        </View>
        <View style={styles.verticalRatingBadge}>
          <Text style={styles.verticalRatingText}>{item.rating}</Text>
          <MaterialCommunityIcons name="star" size={14} color="#FFF" style={{marginLeft: 2}} />
        </View>
      </View>
      
      <View style={styles.verticalMetaRow}>
        <Ionicons name="time-outline" size={16} color="#555" />
        <Text style={styles.verticalMetaText}>{item.time}</Text>
        <Text style={styles.verticalDot}>•</Text>
        <Ionicons name="location-outline" size={16} color="#555" />
        <Text style={styles.verticalMetaText}>{item.distance || '2.5 km'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const RestaurantVerticalList = ({ title, items }: { title: string, items: any[] }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
`;

file = file.replace('const RestaurantHorizontalList =', verticalComponents + '\nconst RestaurantHorizontalList =');
file = file.replace(`      case 'restaurant_horizontal_list':`, `      case 'restaurant_vertical_list':
        return <RestaurantVerticalList key={widget.id} title={widget.title} items={widget.items} />;
      case 'restaurant_horizontal_list':`);

// Revert richCard width for horizontal and stack text
file = file.replace(`richCard: { width: 240, overflow: 'hidden' },`, `richCard: { width: 150, overflow: 'hidden' },`);
file = file.replace(`richImgContainer: { width: 240, height: 140`, `richImgContainer: { width: 150, height: 160`);

// Make horizontal text stack logically
const oldHorizontalMeta = `        <View style={styles.richMetaRow}>
          <MaterialCommunityIcons name="star-circle" size={16} color="#16A34A" />
          <Text style={styles.richRating}>{item.rating}</Text>
          <Text style={styles.richDot}>•</Text>
          <Text style={styles.richTime}>{item.time}</Text>
          <Text style={styles.richDot}>•</Text>
          <Text style={styles.richTime}>{item.distance || '2.5 km'}</Text>
        </View>
        <Text style={styles.richCuisine} numberOfLines={1}>{item.cuisine}</Text>`;

const newHorizontalMeta = `        <View style={styles.richMetaRow}>
          <MaterialCommunityIcons name="star-circle" size={16} color="#16A34A" />
          <Text style={styles.richRating}>{item.rating}</Text>
          <Text style={styles.richDot}>•</Text>
          <Text style={styles.richTime}>{item.time}</Text>
        </View>
        <View style={[styles.richMetaRow, {marginTop: 2}]}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={[styles.richCuisine, {marginLeft: 2, marginRight: 6}]}>{item.distance || '2.5 km'}</Text>
          <Text style={styles.richCuisine} numberOfLines={1}>{item.cuisine}</Text>
        </View>`;

file = file.replace(oldHorizontalMeta, newHorizontalMeta);

// Add Vertical Styles
const verticalStyles = `
  // Vertical Cards
  verticalListContainer: { paddingHorizontal: 16, gap: 24 },
  verticalCard: { width: '100%', overflow: 'hidden' },
  verticalImgContainer: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F1F5F9', position: 'relative' },
  verticalImg: { width: '100%', height: '100%' },
  verticalGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  verticalOfferOverlay: { position: 'absolute', bottom: 16, left: 16 },
  verticalOfferText: { color: '#FFF', fontSize: 22, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 },
  verticalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12 },
  verticalName: { fontSize: 18, fontWeight: '800', color: '#1C1C1C', marginBottom: 2 },
  verticalCuisine: { fontSize: 14, color: '#666' },
  verticalRatingBadge: { flexDirection: 'row', backgroundColor: '#16A34A', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, alignItems: 'center' },
  verticalRatingText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  verticalMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  verticalMetaText: { fontSize: 13, fontWeight: '700', color: '#555', marginLeft: 4 },
  verticalDot: { fontSize: 12, color: '#999', marginHorizontal: 8 },
`;
file = file.replace('  // Rich Cards', verticalStyles + '\n  // Rich Cards');

// Update search bar styling in FoodHeader
const oldSearchBar = `        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={{marginLeft: 12}} />
          <TextInput 
            placeholder="Search for 'Pizza'"
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
          <MaterialCommunityIcons name="microphone" size={20} color="#EA580C" style={{marginRight: 12}} />
        </View>`;

const newSearchBar = `        <View style={[styles.searchBar, { backgroundColor: '#F8FAFC', borderRadius: 24, paddingVertical: 2, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4 }]}>
          <Ionicons name="search" size={20} color="#64748B" style={{marginLeft: 16}} />
          <TextInput 
            placeholder="Search for 'Pizza' or 'Burger'..."
            style={[styles.searchInput, { fontSize: 15, fontWeight: '500', color: '#1E293B' }]}
            placeholderTextColor="#94A3B8"
          />
          <View style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 20, marginRight: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: {width:0, height:1} }}>
             <MaterialCommunityIcons name="microphone" size={18} color="#EA580C" />
          </View>
        </View>`;

file = file.replace(oldSearchBar, newSearchBar);
// Need FadeInDown import from reanimated
if (!file.includes('FadeInDown')) {
    file = file.replace('FadeInRight', 'FadeInRight, FadeInDown');
}

fs.writeFileSync('apps/customer/src/app/restaurants.tsx', file);
console.log('Patched restaurants.tsx');
