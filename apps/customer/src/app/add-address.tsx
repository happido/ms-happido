import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { MapView, Marker } from '../utils/maps';
import { loadMapplsSDK } from '../utils/mappls';

export default function AddAddressScreen() {
  const router = useRouter();
  const [region, setRegion] = useState({
    latitude: 14.4673, // Default to Kadapa
    longitude: 78.8242,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [formattedAddress, setFormattedAddress] = useState('Detecting location...');
  const [doorNo, setDoorNo] = useState('');
  const [streetName, setStreetName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [otherName, setOtherName] = useState('');
  const [isLocating, setIsLocating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mapplsLoaded, setMapplsLoaded] = useState(false);
  const mapRef = useRef<any>(null);

  // Dynamically load Mappls Web SDK
  useEffect(() => {
    if (Platform.OS === 'web') {
      loadMapplsSDK().then((loaded) => {
        if (loaded) setMapplsLoaded(true);
      });
    }
  }, []);

  // Initialize Mappls Map
  useEffect(() => {
    if (Platform.OS === 'web' && mapplsLoaded && !mapRef.current) {
      const initMap = () => {
        const container = document.getElementById('mappls-map-container');
        if (container) {
          // @ts-ignore
          mapRef.current = new window.mappls.Map(container, {
            center: [region.latitude, region.longitude],
            zoom: 16,
            zoomControl: false,
            fullscreenControl: false,
            logoControl: false,
            attributionControl: false,
            scrollZoom: true,
            backgroundColor: '#F8FAFC'
          });

          // Listen for drag events to update the pin location
          mapRef.current.addListener('moveend', () => {
            const center = mapRef.current.getCenter();
            onRegionChangeComplete({
              latitude: center.lat,
              longitude: center.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            });
          });
        } else {
          setTimeout(initMap, 100);
        }
      };
      initMap();
    }
  }, [mapplsLoaded]);

  // Update Mappls map center if region changes externally (e.g. Locate Me)
  useEffect(() => {
    if (Platform.OS === 'web' && mapRef.current) {
      mapRef.current.setCenter([region.latitude, region.longitude]);
    }
  }, [region.latitude, region.longitude]);

  const handleLocateMe = async () => {
    setIsLocating(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setIsLocating(false);
      setFormattedAddress('Permission denied. Please move the pin.');
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({});
      setRegion(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
      await reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (e) {
      console.log("Error fetching location", e);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    // Only fetch location initially if we don't have it
    if (!region.latitude || !region.longitude) {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setRegion(prev => ({ ...prev, latitude, longitude }));
            reverseGeocode(latitude, longitude);
          },
          (error) => {
            console.warn('Error getting location:', error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    }

    // Force hide Mappls logo and watermarks via injected stylesheet
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleEl = document.createElement('style');
      styleEl.id = 'mappls-hide-watermark';
      styleEl.innerHTML = `
        .mapboxgl-ctrl-bottom-left,
        .mapboxgl-ctrl-bottom-right,
        .maplibregl-ctrl-bottom-left,
        .maplibregl-ctrl-bottom-right,
        .mmi-logo,
        .mapboxgl-ctrl-logo,
        .maplibregl-ctrl-logo,
        .mapboxgl-ctrl-attrib,
        .maplibregl-ctrl-attrib,
        .leaflet-control-attribution,
        .leaflet-bottom,
        div[style*="background-image"][style*="mapmyindia"],
        div[style*="background-image"][style*="mappls"],
        a[href*="mapmyindia"],
        a[href*="mappls"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          z-index: -9999 !important;
        }
      `;
      if (!document.getElementById('mappls-hide-watermark')) {
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    setFormattedAddress('Fetching address...');
    try {
      // Use expo-location first
      let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const addr = [place.name, place.street, place.district, place.city, place.region].filter(Boolean).join(', ');
        setFormattedAddress(addr || 'Unknown Location');
        return;
      }
    } catch (e) {
      console.log('Expo reverse geocode failed, using Nominatim fallback');
    }

    const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (googleApiKey) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
          // Find the most detailed result (usually the first one)
          const result = data.results[0];
          
          let doorNumber = '';
          let route = '';
          let neighborhood = '';
          let city = '';
          
          result.address_components.forEach((comp: any) => {
            if (comp.types.includes('street_number') || comp.types.includes('premise')) doorNumber = comp.long_name;
            if (comp.types.includes('route')) route = comp.long_name;
            if (comp.types.includes('neighborhood') || comp.types.includes('sublocality')) neighborhood = comp.long_name;
            if (comp.types.includes('locality')) city = comp.long_name;
          });

          // Auto-fill door number if Google provides it!
          if (doorNumber && doorNo === '') {
            setDoorNo(doorNumber);
          }
          
          if ((route || neighborhood) && streetName === '') {
            setStreetName([route, neighborhood].filter(Boolean).join(', '));
          }

          const addressComponents = [
            route,
            neighborhood,
            city
          ].filter(Boolean);
          
          // Deduplicate identical adjacent parts (e.g., "Taraka Rama Nagar, Taraka Rama Nagar")
          const uniqueAddressComponents = addressComponents.filter((item, pos, arr) => {
            return pos === 0 || item !== arr[pos - 1];
          });
          
          const addressString = uniqueAddressComponents.join(', ');
          
          setFormattedAddress(addressString || result.formatted_address);
          return;
        }
      } catch (e) {
        console.log('Google Maps Geocoding failed, falling back to OSM');
      }
    }

    // Fallback to nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'HappidoApp/1.0' } }
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        
        // Auto-fill door number if Nominatim magically has it
        if ((addr.house_number || addr.house_name) && doorNo === '') {
          setDoorNo(addr.house_number || addr.house_name);
        }

        const street = addr.road || addr.pedestrian || addr.street;
        const area = addr.neighbourhood || addr.suburb || addr.hamlet || addr.residential;
        
        if ((street || area) && streetName === '') {
          // Deduplicate street and area if they are exactly the same
          setStreetName(street === area ? street : [street, area].filter(Boolean).join(', '));
        }

        const addressComponents = [
          street,
          area,
          addr.city || addr.town || addr.village,
          addr.state
        ].filter(Boolean);

        const uniqueAddressComponents = addressComponents.filter((item, pos, arr) => {
          return pos === 0 || item !== arr[pos - 1];
        });

        const addressString = uniqueAddressComponents.join(', ');
        setFormattedAddress(addressString || 'Unknown Location');
      } else {
        setFormattedAddress('Unknown Location');
      }
    } catch (e) {
      setFormattedAddress('Unknown Location');
    }
  };

  const onRegionChangeComplete = (newRegion: any) => {
    setRegion(newRegion);
    reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const handleSaveAddress = async () => {
    if (!doorNo.trim()) {
      alert("Please enter Door / Flat No.");
      return;
    }
    
    setIsSaving(true);
    try {
      let finalTitle = addressType === 'home' ? 'Home' : addressType === 'work' ? 'Work (Office)' : 'Other';
      if (addressType === 'other' && otherName.trim()) {
        finalTitle = otherName.trim();
      }

      const newAddress = {
        id: Date.now().toString(),
        type: addressType,
        title: finalTitle,
        address: `${doorNo}, ${streetName}, ${landmark ? landmark + ', ' : ''}${formattedAddress}`,
        coordinates: {
          lat: region.latitude,
          lng: region.longitude
        }
      };

      const existingData = await AsyncStorage.getItem('savedAddresses');
      let addresses = existingData ? JSON.parse(existingData) : [];
      
      // If replacing Home or Work, remove ALL existing ones of that type (to clean up old duplicates)
      if (addressType === 'home' || addressType === 'work') {
        const hasDefault = addresses.some((a: any) => a.type === addressType && a.isDefault);
        if (hasDefault) {
          (newAddress as any).isDefault = true;
        }
        addresses = addresses.filter((a: any) => a.type !== addressType);
      }
      
      // If it's the first address, make it default
      if (addresses.length === 0) {
        (newAddress as any).isDefault = true;
      }
      
      addresses.push(newAddress);
      await AsyncStorage.setItem('savedAddresses', JSON.stringify(addresses));
      
      // Optional: Set as current selected location instantly
      await AsyncStorage.setItem('lastKnownLocation', newAddress.address);
      
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (e) {
      console.log("Error saving address", e);
      alert("Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }} 
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Delivery Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        {Platform.OS !== 'web' && MapView ? (
          <View style={StyleSheet.absoluteFill}>
            <MapView
              style={StyleSheet.absoluteFill}
              region={region}
              onRegionChangeComplete={onRegionChangeComplete}
              showsUserLocation
            />
            {/* Center Pin Overlay */}
            <View style={styles.centerPinContainer} pointerEvents="none">
              <Ionicons name="location" size={40} color="#EA580C" style={styles.pinIcon} />
            </View>
          </View>
        ) : (
          <View style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {Platform.OS === 'web' && (
              mapplsLoaded ? (
                <div id="mappls-map-container" style={{ width: '100%', height: '100%' }} />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#EA580C" />
                  <Text style={{ marginTop: 12, color: '#64748B' }}>Loading Mappls...</Text>
                </View>
              )
            )}
            {Platform.OS === 'web' && mapplsLoaded && (
              <View style={styles.centerPinContainer} pointerEvents="none">
                <Ionicons name="location" size={40} color="#EA580C" style={styles.pinIcon} />
              </View>
            )}
          </View>
        )}

        {/* Locate Me Floating Button */}
        <TouchableOpacity 
          style={styles.locateMeBtn} 
          onPress={handleLocateMe}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="#EA580C" />
          ) : (
            <Ionicons name="locate" size={24} color="#0F172A" />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.formContainer}
      >
        <View style={styles.bottomSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            <View style={styles.locationDisplayRow}>
              <View style={styles.locationDisplayIcon}>
                <Ionicons name="location" size={24} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationDisplayLabel}>Selected Location</Text>
                <Text style={styles.locationDisplayText}>{formattedAddress}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>HOUSE / FLAT / BLOCK NO. *</Text>
              <TextInput
                style={styles.input}
                placeholder="House No, Flat, or Block"
                value={doorNo}
                onChangeText={setDoorNo}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>APARTMENT / ROAD / AREA *</Text>
              <TextInput
                style={styles.input}
                placeholder="Apartment, Road, or Area"
                value={streetName}
                onChangeText={setStreetName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DIRECTIONS TO REACH (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Landmark (Optional)"
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>

            <Text style={styles.inputLabel}>SAVE AS</Text>
            <View style={styles.typeChipsRow}>
              <TouchableOpacity 
                style={[styles.typeChip, addressType === 'home' && styles.typeChipActive]} 
                onPress={() => setAddressType('home')}
              >
                <Ionicons name="home" size={18} color={addressType === 'home' ? '#EA580C' : '#64748B'} />
                <Text style={[styles.typeChipText, addressType === 'home' && styles.typeChipTextActive]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeChip, addressType === 'work' && styles.typeChipActive]} 
                onPress={() => setAddressType('work')}
              >
                <Ionicons name="briefcase" size={18} color={addressType === 'work' ? '#EA580C' : '#64748B'} />
                <Text style={[styles.typeChipText, addressType === 'work' && styles.typeChipTextActive]}>Work</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeChip, addressType === 'other' && styles.typeChipActive]} 
                onPress={() => setAddressType('other')}
              >
                <Ionicons name="location" size={18} color={addressType === 'other' ? '#EA580C' : '#64748B'} />
                <Text style={[styles.typeChipText, addressType === 'other' && styles.typeChipTextActive]}>Other</Text>
              </TouchableOpacity>
            </View>

            {addressType === 'other' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SAVE AS NAME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name (e.g. Friend's House)"
                  value={otherName}
                  onChangeText={setOtherName}
                />
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.saveBtn, 
                (!doorNo.trim() || !streetName.trim() || (addressType === 'other' && !otherName.trim()) || isLocating) ? styles.saveBtnDisabled : styles.saveBtnActive
              ]} 
              onPress={handleSaveAddress}
              disabled={isSaving || !doorNo.trim() || !streetName.trim() || (addressType === 'other' && !otherName.trim()) || isLocating}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={[
                  styles.saveBtnText,
                  (!doorNo.trim() || isLocating) ? styles.saveBtnTextDisabled : {}
                ]}>Save Address</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: Platform.OS === 'ios' ? 40 : 24 }} />

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFF',
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webMapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40, // Offset so the bottom tip of pin points to center
    zIndex: 2,
    alignItems: 'center',
  },
  pinIcon: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locateMeBtn: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#FFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  formContainer: {
    flexShrink: 0,
    width: '100%',
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    maxHeight: Platform.OS === 'web' ? 600 : '75%',
  },
  locationDisplayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  locationDisplayIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  locationDisplayLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  locationDisplayText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  typeChipsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  typeChipActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF5F5',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeChipTextActive: {
    color: '#EA580C',
  },
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnActive: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  saveBtnTextDisabled: {
    color: '#94A3B8',
  },
});
