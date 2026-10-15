import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'expo-router';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmergencyBloodModal() {
  const [request, setRequest] = useState<any>(null);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    const setupSocket = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const socket = io('http://localhost:5005');
        socketRef.current = socket;
        
        socket.emit('joinRoom', userId);

        socket.on('newBloodRequest', (data) => {
          // If the current user is NOT the requester, show the alert
          // For demo purposes, we will show it if they are online.
          setRequest(data);
          
          // Slide in animation
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 12,
          }).start();
        });
      }
    };
    setupSocket();

    // Pulse Animation for the background ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleAccept = async () => {
    if (!request) return;
    try {
      await api.put(`/blood/request/${request.id}/accept`);
      
      const reqId = request.id;
      setRequest(null);
      // Route volunteer to navigation map
      router.push(`/volunteer-tracking/${reqId}`);
    } catch (e) {
      console.log('Error accepting blood request:', e);
    }
  };

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setRequest(null));
  };

  if (!request) return null;

  return (
    <Modal visible={!!request} transparent animationType="none">
      <View style={styles.overlay}>
        
        {/* Flashing Red Background */}
        <Animated.View style={[styles.pulseBg, { transform: [{ scale: pulseAnim }] }]} />

        <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="alert-decagram" size={64} color="#E11D48" />
          </View>
          
          <Text style={styles.title}>EMERGENCY ALERT</Text>
          <Text style={styles.subtitle}>Blood Request Nearby</Text>
          
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="water" size={24} color="#E11D48" />
              <Text style={styles.bloodGroupText}>{request.bloodGroup} Blood</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="hospital-building" size={20} color="#64748B" />
              <Text style={styles.detailText}>{request.hospitalName || 'City Hospital'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="person" size={20} color="#64748B" />
              <Text style={styles.detailText}>Requested by {request.requesterName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="warning" size={20} color="#E11D48" />
              <Text style={[styles.detailText, { color: '#E11D48', fontWeight: '800' }]}>{request.urgency} Urgency</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <Text style={styles.acceptBtnText}>ACCEPT & NAVIGATE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
            <Text style={styles.dismissBtnText}>I can't help right now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pulseBg: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    ...(Platform.OS === 'web' && { maxWidth: 400 }),
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -48,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#E11D48',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 24,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodGroupText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
    marginLeft: 12,
  },
  acceptBtn: {
    width: '100%',
    backgroundColor: '#E11D48',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dismissBtn: {
    paddingVertical: 12,
  },
  dismissBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  }
});
