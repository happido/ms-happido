import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface PartnerNotification {
  id: string;
  type: 'order' | 'payment' | 'rider' | 'review' | 'system';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  amount?: number;
}

const INITIAL_NOTIFICATIONS: PartnerNotification[] = [];

interface Props {
  newNotification?: PartnerNotification | null;
  visible: boolean;
  onClose: () => void;
  soundAlerts: boolean;
  onToggleSound: (enabled: boolean) => void;
}

export default function NotificationCenterModal({
  visible,
  onClose,
  soundAlerts,
  onToggleSound,
  newNotification,
}: Props) {
  const [notifications, setNotifications] = useState<PartnerNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'orders' | 'payments' | 'system'>('all');
  useEffect(() => {
    if (newNotification) {
      setNotifications(prev => {
        // Prevent duplicates
        if (prev.find(n => n.id === newNotification.id)) return prev;
        return [newNotification, ...prev];
      });
    }
  }, [newNotification]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'orders') return n.type === 'order' || n.type === 'rider';
    if (filter === 'payments') return n.type === 'payment';
    if (filter === 'system') return n.type === 'system' || n.type === 'review';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: PartnerNotification['type']) => {
    switch (type) {
      case 'order':
        return { name: 'receipt', color: '#EA580C', bg: '#FFF7ED' };
      case 'rider':
        return { name: 'bicycle', color: '#2563EB', bg: '#EFF6FF' };
      case 'payment':
        return { name: 'wallet', color: '#059669', bg: '#ECFDF5' };
      case 'review':
        return { name: 'star', color: '#D97706', bg: '#FEF3C7' };
      default:
        return { name: 'flash', color: '#7C3AED', bg: '#F5F3FF' };
    }
  };

  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }}>

      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.headerIcon}>
                <Ionicons name="notifications" size={20} color="#EA580C" />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.title}>Notification Center</Text>
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount} New</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.subtitle}>Real-time updates on orders, payouts & store</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Audio Chime Banner */}
          <View style={styles.soundBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Ionicons
                name={soundAlerts ? 'volume-high' : 'volume-mute'}
                size={18}
                color={soundAlerts ? '#EA580C' : '#9CA3AF'}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.soundTitle}>Loud Kitchen Order Chime</Text>
                <Text style={styles.soundSub}>
                  {soundAlerts ? 'Alert sounds continuously for new orders' : 'Audio chime is muted'}
                </Text>
              </View>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={onToggleSound}
              trackColor={{ false: '#D1D5DB', true: '#FED7AA' }}
              thumbColor={soundAlerts ? '#EA580C' : '#9CA3AF'}
            />
          </View>

          {/* Filter Chips & Mark Read */}
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {(['all', 'orders', 'payments', 'system'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterChip, filter === tab && styles.filterChipActive]}
                  onPress={() => setFilter(tab)}
                >
                  <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                    {tab === 'all'
                      ? `All (${notifications.length})`
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={styles.markReadBtn}>
                <Text style={styles.markReadText}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notifications Scroll */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll}>
            {filtered.map((item) => {
              const icon = getIcon(item.type);
              return (
                <View
                  key={item.id}
                  style={[styles.card, !item.isRead && styles.cardUnread]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
                    <Ionicons name={icon.name as any} size={20} color={icon.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTopRow}>
                      <Text style={[styles.itemTitle, !item.isRead && styles.itemTitleBold]}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                    {item.amount ? (
                      <View style={styles.amountPill}>
                        <Text style={styles.amountText}>Amount: ₹{item.amount.toLocaleString('en-IN')}</Text>
                      </View>
                    ) : null}
                  </View>

                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
              );
            })}
            {filtered.length === 0 && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
                <Text style={{ marginTop: 12, color: '#9CA3AF', fontWeight: '600', fontSize: 14 }}>No notifications yet!</Text>
              </View>
            )}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  sheet: {
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  soundBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  soundTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
  },
  soundSub: {
    fontSize: 10,
    color: '#C2410C',
    marginTop: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#EA580C',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  markReadBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  listScroll: {
    maxHeight: 380,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderRadius: 12,
  },
  cardUnread: {
    backgroundColor: '#FFFBF7',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  itemTitleBold: {
    fontWeight: '900',
    color: '#111827',
  },
  itemTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  itemDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 2,
  },
  amountPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  amountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
    marginTop: 6,
  },
  doneBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  doneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
});
