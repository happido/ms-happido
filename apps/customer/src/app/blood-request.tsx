import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing, FadeInUp, FadeInDown } from 'react-native-reanimated';
import api from '../utils/api';

const { width } = Dimensions.get('window');

export default function BloodRequestScreen() {
  const router = useRouter();
  const [bloodGroup, setBloodGroup] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [urgency, setUrgency] = useState('Critical');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Heartbeat pulse animation for the broadcast button
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.05, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const requestBlood = async () => {
    if (!bloodGroup || !hospitalName) {
      Alert.alert('Error', 'Please specify a blood group and hospital name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/blood/request', {
        bloodGroup: bloodGroup.toUpperCase(),
        hospitalName,
        urgency,
        location: {
          type: 'Point',
          coordinates: [78.4700, 17.4400] // Default mock coords (Hyderabad for this demo)
        }
      });
      
      router.push(`/blood-tracking/${res.data._id}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to broadcast request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#991B1B', '#DC2626']} style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Broadcast</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.infoBox}>
        <Ionicons name="shield-checkmark" size={20} color="#10B981" />
        <Text style={styles.infoText}>Your identity remains 100% anonymous. We use secure VoIP to connect you with donors.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.card}>
        <Text style={styles.label}>Required Blood Group</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="water" size={20} color="#DC2626" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. O+, A-, B+"
            placeholderTextColor="#94A3B8"
            value={bloodGroup}
            onChangeText={setBloodGroup}
            autoCapitalize="characters"
            maxLength={3}
          />
        </View>

        <Text style={styles.label}>Hospital Location</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="medical" size={20} color="#DC2626" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Apollo Hospitals, Jubilee Hills"
            placeholderTextColor="#94A3B8"
            value={hospitalName}
            onChangeText={setHospitalName}
          />
        </View>

        <Text style={styles.label}>Urgency Level</Text>
        <View style={styles.urgencyRow}>
          {['High', 'Critical'].map(level => (
            <TouchableOpacity 
              key={level} 
              style={[styles.urgencyBtn, urgency === level && styles.urgencyBtnActive]}
              onPress={() => setUrgency(level)}
            >
              <Text style={[styles.urgencyText, urgency === level && styles.urgencyTextActive]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View style={animatedStyle}>
          <TouchableOpacity 
            style={styles.broadcastBtn} 
            onPress={requestBlood}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#DC2626', '#991B1B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.broadcastGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="radio" size={24} color="#FFF" />
                  <Text style={styles.broadcastBtnText}>Broadcast SOS to Donors</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC2626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFF',
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  urgencyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyBtnActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#E11D48',
  },
  urgencyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  urgencyTextActive: {
    color: '#E11D48',
  },
  broadcastBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  broadcastGradient: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  broadcastBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
