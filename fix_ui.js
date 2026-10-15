const fs = require('fs');
const file = '/Users/apple/MS Happido/apps/customer/src/app/restaurants.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Hide Header
content = content.replace("import { useRouter } from 'expo-router';", "import { useRouter, Stack } from 'expo-router';");
content = content.replace("<View style={styles.container}>", "<View style={styles.container}>\n      <Stack.Screen options={{ headerShown: false }} />");

// 2. Add Hero Promo and fix tabs styling in FoodHeader
const oldHeader = `      <View style={styles.searchRow}>
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
      </ScrollView>`;

const newHeader = `      
      {/* Hero Banner Area */}
      <View style={styles.heroContainer}>
        <View style={{flex: 1}}>
          <Text style={styles.heroSubtitle}>CELEBRATE</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <TouchableOpacity style={styles.heroBtn}>
            <Text style={styles.heroBtnText}>ORDER NOW</Text>
          </TouchableOpacity>
        </View>
        <Image source={{uri: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=300'}} style={styles.heroImg} />
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
        <View style={styles.tabWrapper}>
          <View style={styles.tab}>
            <Ionicons name="grid" size={14} color="#FFF" style={{marginRight: 4}} />
            <Text style={styles.activeTabText}>ALL</Text>
          </View>
          <View style={styles.activeIndicator} />
        </View>
        <View style={styles.tabWrapper}>
          <View style={styles.tab}>
            <Ionicons name="storefront" size={14} color="#F1F5F9" style={{marginRight: 4}} />
            <Text style={styles.tabText}>STORE</Text>
          </View>
        </View>
        <View style={styles.tabWrapper}>
          <View style={styles.tab}>
            <MaterialIcons name="local-offer" size={14} color="#F1F5F9" style={{marginRight: 4}} />
            <Text style={styles.tabText}>OFFERS</Text>
          </View>
        </View>
        <View style={styles.tabWrapper}>
          <View style={styles.tab}>
            <Ionicons name="flash" size={14} color="#F1F5F9" style={{marginRight: 4}} />
            <Text style={styles.tabText}>BOLT</Text>
          </View>
        </View>
      </ScrollView>`;

content = content.replace(oldHeader, newHeader);

// 3. Fix Categories layout
const oldCat = `          <Image source={{ uri: item.image }} style={styles.categoryImg} />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(100,0,0,0.8)']} style={styles.categoryGradient} />
          <Text style={styles.categoryTitle}>{item.title}</Text>`;
const newCat = `          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Image source={{ uri: item.image }} style={styles.categoryImg} />`;
content = content.replace(oldCat, newCat);


// 4. Update Styles
const newStyles = `
  // Hero Styles
  heroContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20, alignItems: 'center' },
  heroSubtitle: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  heroTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', fontFamily: 'serif', marginBottom: 12 },
  heroBtn: { backgroundColor: 'transparent', borderColor: '#FFF', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, alignSelf: 'flex-start' },
  heroBtnText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  heroImg: { width: 120, height: 100, resizeMode: 'contain' },

  // Updated Tabs
  tabWrapper: { alignItems: 'center' },
  activeIndicator: { height: 3, backgroundColor: '#FFF', width: 30, borderRadius: 2, marginTop: 4 },

  // Updated Categories
  categoriesScroll: { paddingHorizontal: 16, gap: 12, paddingVertical: 20, backgroundColor: '#8E0038' },
  categoryCard: { width: 100, height: 120, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#D4AF37', backgroundColor: '#6F002A', alignItems: 'center', paddingTop: 12 },
  categoryImg: { width: 80, height: 80, position: 'absolute', bottom: -10, resizeMode: 'cover', borderRadius: 40 },
  categoryTitle: { color: '#FFF', fontSize: 12, fontWeight: '800', textAlign: 'center', zIndex: 2 },
`;

content = content.replace("  categoriesScroll: { paddingHorizontal: 16, gap: 12, paddingVertical: 20, backgroundColor: '#8E0038' },", newStyles + "\n  // old \n  __categoriesScroll:");


// 5. Fix scroll padding
content = content.replace("<View style={{height: 100}} />", "<View style={{height: 150}} />");

fs.writeFileSync(file, content);
console.log('UI Fixed');
