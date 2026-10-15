import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price?: number;
  isVeg?: boolean;
  isPromo49?: boolean;
}

export interface OrderData {
  _id: string;
  orderNumber?: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  rider?: {
    name?: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'ready_for_pickup' | 'arrived_at_restaurant' | 'completed' | 'cancelled' | 'dispatched' | 'delivered';
  cancellationReason?: string;
  createdAt?: string;
  paymentMethod?: string;
  notes?: string;
  isRush20Min?: boolean;
  pickupOtp?: string;
}

interface OrderPipelineCardProps {
  order: OrderData;
  onAccept?: (orderId: string) => void;
  onStartPrep?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
  onPrintKOT?: (order: OrderData) => void;
  index?: number;
}

export const OrderPipelineCard: React.FC<OrderPipelineCardProps> = ({
  order,
  onAccept,
  onStartPrep,
  onReject,
  onMarkReady,
  onComplete,
  onPrintKOT,
  index = 0,
}) => {
  const shortId = (order._id || '').slice(-4).toUpperCase();
  const [timeRemainingStr, setTimeRemainingStr] = useState('...');
  const [slaColor, setSlaColor] = useState('#10B981'); // Default green

  useEffect(() => {
    if (!['pending', 'accepted', 'preparing'].includes(order.status)) {
      setTimeRemainingStr('-');
      setSlaColor('#9CA3AF');
      return;
    }

    const slaMinutes = order.isRush20Min ? 7 : 15;
    const createdAtTime = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
    const targetTime = createdAtTime + slaMinutes * 60000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMs = targetTime - now;
      
      const isNegative = diffMs < 0;
      const absDiff = Math.abs(diffMs);
      const m = Math.floor(absDiff / 60000);
      const s = Math.floor((absDiff % 60000) / 1000);
      
      let timeStr = '';
      if (isNegative && m > 99) {
        timeStr = `-${Math.floor(m / 60)}h ${m % 60}m`;
      } else {
        timeStr = `${isNegative ? '-' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }

      setTimeRemainingStr(timeStr);

      if (isNegative) {
        setSlaColor('#EF4444'); // Red (breached)
      } else if (m < 3) {
        setSlaColor('#F59E0B'); // Orange (warning)
      } else {
        setSlaColor('#10B981'); // Green (good)
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt, order.status, order.isRush20Min]);

  const getStatusLabel = () => {
    switch (order.status) {
      case 'pending': return 'PENDING';
      case 'accepted': return 'ACCEPTED';
      case 'preparing': return 'PREPARING';
      case 'ready': return 'READY FOR PICKUP';
      case 'ready_for_pickup': return 'RIDER ASSIGNED';
      case 'arrived_at_restaurant': return 'RIDER ARRIVED';
      case 'dispatched': return 'ON THE WAY';
      case 'delivered': return 'DELIVERED';
      case 'completed': return 'COMPLETED';
      case 'cancelled': return 'CANCELLED';
      default: return 'ORDER';
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <View style={styles.cleanCard}>
        {order.isRush20Min && (
          <View style={styles.rushBanner}>
            <Ionicons name="flash" size={12} color="#FFFFFF" />
            <Text style={styles.rushBannerText}>20 MIN RUSH</Text>
          </View>
        )}
        {/* Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderLabel}>{getStatusLabel()}</Text>
            <Text style={styles.orderId}>#{shortId}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.timeLabel}>PREP SLA</Text>
            <Text style={[styles.timeText, { color: slaColor, fontWeight: '700' }]}>{timeRemainingStr}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Customer Info (Minimalist) */}
        {order.customer?.name && (
          <View style={styles.customerRow}>
            <Ionicons name="person-circle-outline" size={20} color="#9CA3AF" />
            <Text style={styles.customerName}>{order.customer.name}</Text>
          </View>
        )}

        {/* Assigned Rider Info */}
        {order.status === 'arrived_at_restaurant' && (
          <View style={{ backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, color: '#DC2626', fontWeight: '700' }}>🚨 Rider Waiting Outside</Text>
          </View>
        )}
        
        {order.rider?.name && ['ready_for_pickup', 'arrived_at_restaurant', 'dispatched', 'delivered', 'completed'].includes(order.status) && (
          <View style={[styles.customerRow, { backgroundColor: '#EEF2FF', padding: 8, borderRadius: 8, marginTop: 4 }]}>
            <Ionicons name="bicycle" size={20} color="#4F46E5" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#3730A3' }}>
                Rider: {order.rider.name}
              </Text>
              {order.rider.phone && (
                <Text style={{ fontSize: 12, color: '#4338CA', marginTop: 2 }}>
                  {order.rider.phone}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Pickup OTP Display */}
        {order.pickupOtp && ['preparing', 'ready', 'ready_for_pickup', 'arrived_at_restaurant'].includes(order.status) && (
          <View style={{ backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8, marginTop: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FDE68A' }}>
            <Text style={{ fontSize: 12, color: '#D97706', fontWeight: '700', marginBottom: 4 }}>PICKUP PIN</Text>
            <Text style={{ fontSize: 24, color: '#B45309', fontWeight: '900', letterSpacing: 4 }}>{order.pickupOtp}</Text>
          </View>
        )}

        {/* Items */}
        <View style={styles.itemsList}>
          {order.items?.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemIndex}>{i + 1}.</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.isPromo49 && (
                      <View style={styles.promo49Badge}>
                        <Text style={styles.promo49Text}>₹49 STORE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemQty}>Qty {item.quantity}</Text>
                </View>
              </View>
              {item.price ? (
                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
              ) : null}
            </View>
          ))}
        </View>

        {order.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>Note: {order.notes}</Text>
          </View>
        ) : null}

        {order.status === 'cancelled' && order.cancellationReason ? (
          <View style={[styles.notesBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Text style={[styles.notesText, { color: '#DC2626' }]}>
              Reason: {order.cancellationReason}
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />
        
        {/* Total & KOT */}
        <View style={styles.totalRow}>
          {onPrintKOT && (
            <TouchableOpacity onPress={() => onPrintKOT(order)} style={styles.kotBtn}>
              <Ionicons name="print-outline" size={16} color="#6B7280" />
              <Text style={styles.kotBtnText}>Print KOT</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.totalLabel}>TOTAL: ₹{order.totalAmount?.toFixed(2)}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {['pending', 'accepted'].includes(order.status) && onAccept && (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#10B981', flex: 1 }]} onPress={() => onAccept(order._id)}>
              <Text style={styles.primaryBtnText}>ACCEPT ORDER</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'preparing' && onMarkReady && (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#10B981', flex: 1 }]} onPress={() => onMarkReady(order._id)}>
              <Text style={styles.primaryBtnText}>MARK READY</Text>
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </TouchableOpacity>
          )}

          {order.status === 'ready' && onComplete && (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#EA580C', flex: 1 }]} onPress={() => onComplete(order._id)}>
              <Text style={styles.primaryBtnText}>HAND OVER TO RIDER</Text>
            </TouchableOpacity>
          )}

          {['pending', 'accepted'].includes(order.status) && onReject && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => onReject(order._id)}>
              <Text style={[styles.secondaryBtnText, { color: '#EF4444' }]}>REJECT</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cleanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'right',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'right',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  itemsList: {
    gap: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  itemIndex: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  notesBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  notesText: {
    fontSize: 13,
    color: '#B45309',
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  kotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  kotBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#D4AF37', // Gold accent
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    gap: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
  },
  rushBanner: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 16,
  },
  rushBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  promo49Badge: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promo49Text: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
