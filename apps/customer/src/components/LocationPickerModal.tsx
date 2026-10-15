import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface SavedAddress {
  id: string;
  type: 'home' | 'work' | 'other';
  title: string;
  address: string;
  isDefault?: boolean;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (loc: string) => void;
}

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: '1',
    type: 'home',
    title: 'Home',
    address: 'Flat 402, Signature Heights, Road No. 12, Banjara Hills, Hyderabad',
    isDefault: true,
  },
  {
    id: '2',
    type: 'work',
    title: 'Work (Office)',
    address: 'Building 4, Mindspace IT Park, Hitech City, Madhapur, Hyderabad',
  },
  {
    id: '3',
    type: 'other',
    title: 'Gym',
    address: 'Cult Fit, Jubilee Hills Road No. 36, Hyderabad',
  },
];

export default function LocationPickerModal({
  visible,
  onClose,
  currentLocation,
  onSelectLocation,
}: LocationPickerModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  useEffect(() => {
    if (visible) {
      loadSavedAddresses();
    }
  }, [visible]);

  const loadSavedAddresses = async () => {
    try {
      const data = await AsyncStorage.getItem('savedAddresses');
      if (data) {
        setSavedAddresses(JSON.parse(data));
      } else {
        setSavedAddresses([]);
      }
    } catch (e) {
      console.log('Failed to load saved addresses', e);
      setSavedAddresses([]);
    }
  };

  const handleSelect = async (addr: SavedAddress) => {
    setSelectedId(addr.id);
    const formattedSelection = `${addr.title} • ${addr.address.split(',')[0]?.trim() || addr.address}`;
    onSelectLocation(formattedSelection);
    await AsyncStorage.setItem('lastKnownLocation', formattedSelection);
    onClose();
  };

  const handleUseCurrentGPS = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Try Google Maps Geocoding API first for highest accuracy
      let addressString = '';
      const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (googleApiKey) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
          );
          const data = await response.json();
          if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            let route = '';
            let neighborhood = '';
            let city = '';
            
            result.address_components.forEach((comp: any) => {
              if (comp.types.includes('route')) route = comp.long_name;
              if (comp.types.includes('neighborhood') || comp.types.includes('sublocality')) neighborhood = comp.long_name;
              if (comp.types.includes('locality')) city = comp.long_name;
            });

            const addressComponents = [route, neighborhood, city].filter(Boolean);
            const uniqueAddressComponents = addressComponents.filter((item, pos, arr) => {
              return pos === 0 || item !== arr[pos - 1];
            });
            
            addressString = uniqueAddressComponents.join(', ') || result.formatted_address;
          }
        } catch (e) {
          console.log('Google Maps Geocoding failed, falling back to OSM');
        }
      }

      // Web fallback: Use OpenStreetMap Nominatim API if Google fails or is missing
      if (!addressString || addressString === '') {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'HappidoApp/1.0' } }
          );
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const street = addr.road || addr.pedestrian || addr.street;
            const area = addr.neighbourhood || addr.suburb || addr.hamlet || addr.residential;
            
            const addressComponents = [
              street,
              area,
              addr.city || addr.town || addr.village,
              addr.state
            ].filter(Boolean);

            const uniqueAddressComponents = addressComponents.filter((item, pos, arr) => {
              return pos === 0 || item !== arr[pos - 1];
            });

            addressString = uniqueAddressComponents.join(', ');
          }
        } catch (error) {
          console.log('Reverse geocoding failed', error);
        }
      }

      if (addressString) {
        const fullLoc = `Current Location • ${addressString}`;
        onSelectLocation(fullLoc);
        await AsyncStorage.setItem('lastKnownLocation', fullLoc);
      } else {
        const fallbackLoc = 'Current Location • Unknown Address';
        onSelectLocation(fallbackLoc);
        await AsyncStorage.setItem('lastKnownLocation', fallbackLoc);
      }
      onClose();
    } catch (e) {
      console.log('Location fetch error:', e);
      alert('Could not fetch location');
    } finally {
      setIsLocating(false);
    }
  };

  if (!visible) return null;

  const modalBody = (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheetContainer}>
        <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Delivery Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Search Location Input */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for area, landmark, or street..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Current GPS Location Action */}
          <TouchableOpacity style={styles.gpsRow} onPress={handleUseCurrentGPS} disabled={isLocating}>
            <View style={styles.gpsIcon}>
              <Ionicons name="locate" size={20} color="#EA580C" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.gpsTitle}>
                {isLocating ? 'Locating you...' : 'Use Current Location'}
              </Text>
              <Text style={styles.gpsSubtitle}>
                {isLocating ? 'Fetching GPS coordinates' : 'GPS enabled • Tap to fetch location'}
              </Text>
            </View>
            {isLocating ? (
              <ActivityIndicator color="#EA580C" size="small" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Saved Addresses</Text>

          {/* Saved Addresses List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 25 }}>
            {savedAddresses.length === 0 && (
              <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center', marginVertical: 16 }}>No saved addresses yet.</Text>
            )}
            {savedAddresses.map((addr) => {
              const isSelected = selectedId === addr.id;
              const iconName = addr.type === 'home' ? 'home' : addr.type === 'work' ? 'business' : 'location';

              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addressItem, isSelected && styles.addressItemSelected]}
                  onPress={() => handleSelect(addr)}
                >
                  <View style={[styles.addrIcon, isSelected && styles.addrIconSelected]}>
                    <Ionicons name={iconName} size={18} color={isSelected ? '#EA580C' : '#64748B'} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.addrTitle, isSelected && styles.addrTitleSelected]}>{addr.title}</Text>
                      {addr.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>DEFAULT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addrText} numberOfLines={2}>{addr.address}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#EA580C" />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Add New Address Button */}
            <TouchableOpacity style={styles.addNewBtn} onPress={() => { onClose(); router.push('/add-address'); }}>
              <Ionicons name="add-circle-outline" size={20} color="#EA580C" style={{ marginRight: 8 }} />
              <Text style={styles.addNewText}>Add New Address</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
  );

  if (Platform.OS === 'web') {
    return modalBody;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {modalBody}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      } as any,
      default: {
        flex: 1,
      },
    }),
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  dismissArea: { flex: 1 },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  gpsIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
  },
  gpsSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  addressItemSelected: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBF5',
  },
  addrIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addrIconSelected: {
    backgroundColor: '#FFF7ED',
  },
  addrTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  addrTitleSelected: {
    color: '#0F172A',
  },
  defaultBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  addrText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 6,
  },
  addNewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
  },
});
