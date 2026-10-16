import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import api from '../../utils/api';
import { loadMapplsSDK } from '../../utils/mappls';
import * as Location from 'expo-location';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function VolunteerTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [requestData, setRequestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLoc, setCurrentLoc] = useState<any>(null);
  const [mapplsLoaded, setMapplsLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      loadMapplsSDK(['direction']).then((loaded) => {
        if (loaded) setMapplsLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await api.get(`/blood/request/${id}`);
        setRequestData(response.data);
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setCurrentLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        } else {
          // Fallback to demo location
          setCurrentLoc({ lat: 17.4300, lng: 78.4600 });
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // Initialize Mappls Map
  useEffect(() => {
    if (Platform.OS === 'web' && mapplsLoaded && currentLoc && !mapRef.current) {
      const container = document.getElementById('mappls-volunteer-map');
      if (container && (window as any).mappls?.Map) {
        mapRef.current = new (window as any).mappls.Map(container, {
          center: [currentLoc.lat, currentLoc.lng],
          zoom: 14,
          zoomControl: false,
          fullscreenControl: false,
          scrollZoom: true,
          backgroundColor: '#F8FAFC'
        });

        // Volunteer Marker
        new (window as any).mappls.Marker({
          map: mapRef.current,
          position: { lat: currentLoc.lat, lng: currentLoc.lng },
          html: '<div style="font-size:24px;">🦸</div>',
        });

        // Hospital Marker
        if (requestData?.location?.coordinates) {
          const hLat = requestData.location.coordinates[1];
          const hLng = requestData.location.coordinates[0];
          new (window as any).mappls.Marker({
            map: mapRef.current,
            position: { lat: hLat, lng: hLng },
            html: '<div style="font-size:24px;">🏥</div>',
          });

          if ((window as any).mappls?.direction) {
            (window as any).mappls.direction({
              map: mapRef.current,
              start: { label: 'Volunteer', geoposition: `${currentLoc.lat},${currentLoc.lng}` },
              end: { label: 'Hospital', geoposition: `${hLat},${hLng}` },
              Profile: ['biking'],
              divId: 'mappls-volunteer-dir',
            });
          }
        }
      }
    }
  }, [mapplsLoaded, currentLoc, requestData]);

  useEffect(() => {
    // Socket setup to emit location
    const setupSocket = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId && requestData) {
        const socket = io('http://localhost:5005');
        socketRef.current = socket;

        // Simulate moving volunteer
        let simLat = currentLoc?.lat || 17.4300;
        let simLng = currentLoc?.lng || 78.4600;
        const targetLat = requestData.location.coordinates[1];
        const targetLng = requestData.location.coordinates[0];

        const interval = setInterval(() => {
          simLat += (targetLat - simLat) * 0.05;
          simLng += (targetLng - simLng) * 0.05;
          setCurrentLoc({ lat: simLat, lng: simLng });

          socket.emit('volunteerLocationUpdate', {
            requesterId: requestData.requester._id,
            volunteerId: userId,
            location: { latitude: simLat, longitude: simLng }
          });
        }, 3000);

        return () => {
          clearInterval(interval);
          socket.disconnect();
        };
      }
    };
    if (currentLoc) setupSocket();
  }, [requestData]);

  if (loading || !requestData) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Map Section */}
      <View style={{ flex: 1 }}>
        {Platform.OS === 'web' ? (
          <View style={StyleSheet.absoluteFill}>
            <div id="mappls-volunteer-map" style={{ width: '100%', height: '100%' }} />
            <div id="mappls-volunteer-dir" style={{ display: 'none' }} />
            {!mapplsLoaded && (
              <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }]}>
                <ActivityIndicator size="large" color="#0284C7" />
                <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Loading Mappls...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="hospital-marker" size={48} color="#0284C7" />
          </View>
        )}

        {/* Back Button Overlay */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Floating Bottom Card */}
      <Animated.View entering={FadeInDown.springify()} style={styles.bottomCard}>
        <View style={styles.headerRow}>
           <Text style={styles.missionText}>MISSION ACTIVE</Text>
           <View style={styles.liveBadge}><Text style={styles.liveText}>● LIVE TRACKING</Text></View>
        </View>

        <Text style={styles.hospitalName}>{requestData.hospitalName || 'City Hospital'}</Text>
        <Text style={styles.subText}>Urgent: {requestData.bloodGroup} Blood Needed</Text>

        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.navBtn}>
             <Ionicons name="navigate" size={20} color="#FFF" />
             <Text style={styles.navBtnText}>Open Maps</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.callBtn}>
             <Ionicons name="call" size={24} color="#10B981" />
           </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute', top: 50, left: 20,
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  bottomCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
    marginTop: -20,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  missionText: { fontSize: 13, fontWeight: '800', color: '#0284C7', letterSpacing: 1 },
  liveBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveText: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  hospitalName: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  subText: { fontSize: 16, color: '#E11D48', fontWeight: '600', marginTop: 4, marginBottom: 20 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  navBtn: { flex: 1, backgroundColor: '#0284C7', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 12, marginRight: 12 },
  navBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  callBtn: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D1FAE5' }
});
