import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface IncomingDispatchModalProps {
  visible: boolean;
  order: any;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string) => void;
}

export default function IncomingDispatchModal({ visible, order, onAccept, onDecline }: IncomingDispatchModalProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const progressWidth = useSharedValue(width - 80);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible && order) {
      setTimeLeft(15);
      progressWidth.value = width - 80;
      progressWidth.value = withTiming(0, { duration: 15000 });
      
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, order]);

  if (!visible || !order) return null;

  const progressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const restaurantName = order.restaurant?.name || 'Restaurant';
  const customerLoc = order.deliveryLocation?.address || 'Customer Location';
  // Fake earnings estimate for UI effect
  const estEarnings = Math.floor(Math.random() * 40) + 40; 

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View entering={FadeInDown.springify().damping(15)} exiting={FadeOutDown} style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerTitle}>New Delivery Request</Text>
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, progressStyle]} />
          </View>

          {/* Details */}
          <View style={styles.content}>
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <Ionicons name="restaurant" size={20} color="#EA580C" />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.label}>Pickup</Text>
                <Text style={styles.value} numberOfLines={1}>{restaurantName}</Text>
              </View>
            </View>

            <View style={styles.dottedLine} />

            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="location" size={20} color="#10B981" />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.label}>Dropoff</Text>
                <Text style={styles.value} numberOfLines={2}>{customerLoc}</Text>
              </View>
            </View>
            
            <View style={styles.earningsBox}>
              <Text style={styles.earningsLabel}>Est. Earnings</Text>
              <Text style={styles.earningsValue}>₹{estEarnings}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={() => onDecline(order._id)}>
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => onAccept(order._id)}>
              <Text style={styles.acceptText}>Accept Order</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  timerText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  content: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textCol: {
    flex: 1,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  dottedLine: {
    width: 2,
    height: 20,
    backgroundColor: '#334155',
    marginLeft: 19,
    marginVertical: 5,
  },
  earningsBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  earningsLabel: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  earningsValue: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#334155',
  },
  declineText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  acceptText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
