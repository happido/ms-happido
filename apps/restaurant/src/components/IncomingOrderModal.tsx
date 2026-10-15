import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { OrderData } from './OrderPipelineCard';

const { width } = Dimensions.get('window');

interface IncomingOrderModalProps {
  visible: boolean;
  order: OrderData | null;
  onAccept: (orderId: string, prepTime: number) => void;
  onReject: (orderId: string) => void;
}

export default function IncomingOrderModal({ visible, order, onAccept, onReject }: IncomingOrderModalProps) {
  const [prepTime, setPrepTime] = useState<number>(20);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 seconds to accept

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible && order) {
      setTimeLeft(60);
      setPrepTime(20);
      
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Auto-reject if time expires
            onReject(order._id);
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View entering={FadeInDown.springify().damping(15)} exiting={FadeOutDown} style={styles.card}>
          
          <View style={styles.header}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerTitle}>New Incoming Order</Text>
            <Text style={[styles.timerText, { color: timeLeft < 15 ? '#EF4444' : '#F59E0B' }]}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.orderMeta}>
              <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.orderTotal}>₹{order.totalAmount}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Order Items</Text>
            <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
              {order.items?.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <View style={[styles.vegIcon, { borderColor: item.isVeg === false ? '#EF4444' : '#10B981' }]}>
                      <View style={[styles.vegDot, { backgroundColor: item.isVeg === false ? '#EF4444' : '#10B981' }]} />
                    </View>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  </View>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Set Prep Time</Text>
            <View style={styles.timeOptionsRow}>
              {[10, 20, 30, 45].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeBtn, prepTime === time && styles.activeTimeBtn]}
                  onPress={() => setPrepTime(time)}
                >
                  <Text style={[styles.timeBtnText, prepTime === time && styles.activeTimeBtnText]}>{time}m</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(order._id)}>
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(order._id, prepTime)}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
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
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: Platform.OS === 'web' ? Math.min(width * 0.9, 500) : '100%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    marginBottom: 24,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsList: {
    maxHeight: 150,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  vegIcon: {
    width: 12,
    height: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 2,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  itemQty: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  timeOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTimeBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  timeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTimeBtnText: {
    color: '#10B981',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  rejectBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
