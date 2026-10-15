import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface BloodEmergencyModalProps {
  visible: boolean;
  request: any;
  onAccept: (requestId: string) => void;
  onClose: () => void;
}

export default function BloodEmergencyModal({ visible, request, onAccept, onClose }: BloodEmergencyModalProps) {
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (visible) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [visible]);

  if (!visible || !request) return null;

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const hospitalName = request.hospitalName || 'City Hospital';
  const locationText = request.location?.address || 'Location Hidden (Privacy)';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp.springify().damping(15)} exiting={FadeOutDown} style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name="water" size={24} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.headerTitle}>URGENT BLOOD MATCH</Text>
              <Text style={styles.headerSubtitle}>Someone nearby needs your help!</Text>
            </View>
          </View>

          {/* Blood Details */}
          <Animated.View style={[styles.bloodGroupContainer, pulseStyle]}>
            <Text style={styles.bloodGroupText}>{request.bloodGroup}</Text>
          </Animated.View>
          
          <Text style={styles.urgencyText}>
            Urgency: <Text style={{ color: request.urgency === 'high' ? '#EF4444' : '#F59E0B', fontWeight: '800' }}>{request.urgency?.toUpperCase()}</Text>
          </Text>

          {/* Details */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Ionicons name="medical" size={16} color="#94A3B8" />
              <Text style={styles.detailText}>{hospitalName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color="#94A3B8" />
              <Text style={styles.detailText}>{locationText}</Text>
            </View>
            <Text style={styles.privacyNote}>Note: Requester details are kept strictly anonymous for privacy.</Text>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.donateBtn} onPress={() => onAccept(request.id || request._id)}>
              <Text style={styles.donateText}>I Will Donate</Text>
              <Ionicons name="heart" size={18} color="#fff" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  bloodGroupContainer: {
    alignSelf: 'center',
    backgroundColor: '#EF4444',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  bloodGroupText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
  },
  urgencyText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  detailsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  privacyNote: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 15,
  },
  dismissBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  donateBtn: {
    flex: 1.5,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  donateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
