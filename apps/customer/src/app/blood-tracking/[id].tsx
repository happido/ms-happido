import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import api from '../../utils/api';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
// Google Maps Removed

interface VolunteerLocation {
  latitude: number;
  longitude: number;
}

export default function BloodTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [requestData, setRequestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [volunteerLocation, setVolunteerLocation] = useState<VolunteerLocation | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [volunteerInfo, setVolunteerInfo] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  // Pulse animation for waiting state
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.in(Easing.ease) })
      ),
      -1, true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1, true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const fetchRequest = async () => {
    try {
      const response = await api.get(`/blood/request/${id}`);
      setRequestData(response.data);
      if (response.data.acceptedBy && response.data.acceptedBy.length > 0) {
         setVolunteerInfo(response.data.acceptedBy[0]);
      }
    } catch (error) {
      console.log('Error fetching blood request', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();

    const setupSocket = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const socket = io('http://localhost:5005');
        socketRef.current = socket;

        socket.emit('joinRoom', userId);

        socket.on('bloodRequestAccepted', (data) => {
          if (data.requestId === id) {
            setVolunteerInfo(data.acceptedBy);
            setEstimatedTime(12); // Mock initial ETA
          }
        });

        socket.on('volunteerLocationUpdate', (data: { volunteerId: string; location: VolunteerLocation }) => {
          setVolunteerLocation(data.location);
          setEstimatedTime(prev => Math.max(1, prev - 0.2));
        });
      }
    };

    setupSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id]);

  if (loading || !requestData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E11D48" />
          <Text style={styles.loadingText}>Loading tracking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAccepted = !!volunteerInfo;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Broadcast</Text>
        <View style={styles.headerRight}>
          <View style={styles.liveIndicator}>
            <Animated.View style={[styles.liveDot, pulseStyle]} />
            <View style={styles.liveDotCore} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* MAP */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.mapContainer}>
          <View style={[styles.nativeMapPlaceholder, { flex: 1, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
            <MaterialCommunityIcons name="hospital-marker" size={48} color="#E11D48" />
            <Text style={{ marginTop: 12 }}>MapmyIndia Integration Pending</Text>
          </View>

          {/* Searching Overlay */}
          {!isAccepted && (
            <View style={styles.searchingOverlay}>
              <Animated.View style={[styles.pulseRing, pulseStyle]} />
              <Animated.View style={[styles.pulseRing, pulseStyle, { animationDelay: '500ms' } as any]} />
              <View style={styles.radarCenter}>
                <MaterialCommunityIcons name="radar" size={32} color="#FFF" />
              </View>
              <Text style={styles.searchingText}>Locating nearby volunteers...</Text>
            </View>
          )}
        </Animated.View>

        {/* ETA & STATUS */}
        {isAccepted ? (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.etaCard}>
            <LinearGradient
              colors={['#0284C7', '#0369A1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.etaGradient}
            >
              <View style={styles.etaLeft}>
                <Text style={styles.etaLabel}>Volunteer Arriving In</Text>
                <View style={styles.etaTimeRow}>
                  <Text style={styles.etaTime}>{Math.ceil(estimatedTime)}</Text>
                  <Text style={styles.etaUnit}>mins</Text>
                </View>
              </View>
              <View style={styles.etaRight}>
                <View style={styles.etaIconCircle}>
                  <Text style={{ fontSize: 24 }}>🦸</Text>
                </View>
                <Text style={styles.etaStatusText}>On the way</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        ) : (
           <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.etaCard, { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FEF3C7', padding: 20 }]}>
             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <MaterialCommunityIcons name="broadcast" size={24} color="#D97706" />
               <View style={{ marginLeft: 12 }}>
                 <Text style={{ fontSize: 16, fontWeight: '800', color: '#92400E' }}>Broadcast Active</Text>
                 <Text style={{ fontSize: 13, color: '#B45309', marginTop: 2 }}>Waiting for a match to respond.</Text>
               </View>
             </View>
           </Animated.View>
        )}

        {/* REQUEST DETAILS */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.infoCard}>
          <View style={styles.infoRow}>
             <View style={[styles.iconBox, { backgroundColor: '#FFE4E6' }]}>
               <MaterialCommunityIcons name="water" size={20} color="#E11D48" />
             </View>
             <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Blood Group Needed</Text>
                <Text style={styles.infoValue}>{requestData.bloodGroup}</Text>
             </View>
             <View style={styles.urgencyBadge}>
                <Text style={styles.urgencyText}>{requestData.urgencyLevel}</Text>
             </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
             <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
               <MaterialCommunityIcons name="hospital-building" size={20} color="#475569" />
             </View>
             <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Destination Hospital</Text>
                <Text style={styles.infoValue}>{requestData.hospitalName || 'City Hospital'}</Text>
             </View>
          </View>
        </Animated.View>

        {/* VOLUNTEER INFO */}
        {volunteerInfo && (
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.volunteerCard}>
            <Text style={styles.volunteerTitle}>Responding Volunteer</Text>
            <View style={styles.volunteerRow}>
              <View style={styles.volunteerAvatar}>
                <Text style={{ fontSize: 24 }}>🦸</Text>
              </View>
              <View style={styles.volunteerDetails}>
                <Text style={styles.volunteerName}>{volunteerInfo.name}</Text>
                <Text style={styles.volunteerRole}>Matched Donor</Text>
              </View>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => {
                  const phone = volunteerInfo.phone || '';
                  if (phone) Linking.openURL(`tel:${phone}`);
                }}
              >
                <Ionicons name="call" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  headerRight: { alignItems: 'flex-end' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFE4E6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E11D48', position: 'absolute', left: 10 },
  liveDotCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E11D48', marginRight: 6 },
  liveText: { fontSize: 11, fontWeight: '900', color: '#E11D48', letterSpacing: 1 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: '600' },
  container: { flex: 1, padding: 16 },

  mapContainer: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', height: 280, position: 'relative' },
  webMapContainer: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  nativeMapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  
  searchingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(225, 29, 72, 0.4)',
  },
  radarCenter: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#E11D48',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  searchingText: { color: '#FFF', fontWeight: '700', fontSize: 15, marginTop: 40, letterSpacing: 0.5 },

  etaCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  etaGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
  etaLeft: {},
  etaLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  etaTimeRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  etaTime: { fontSize: 40, fontWeight: '900', color: '#FFFFFF' },
  etaUnit: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginLeft: 6 },
  etaRight: { alignItems: 'center' },
  etaIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  etaStatusText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },

  infoCard: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoTextCol: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  urgencyBadge: { backgroundColor: '#FFE4E6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  urgencyText: { color: '#E11D48', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  volunteerCard: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  volunteerTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  volunteerRow: { flexDirection: 'row', alignItems: 'center' },
  volunteerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
  volunteerDetails: { flex: 1, marginLeft: 16 },
  volunteerName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  volunteerRole: { fontSize: 13, color: '#0284C7', fontWeight: '600', marginTop: 2 },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
});
