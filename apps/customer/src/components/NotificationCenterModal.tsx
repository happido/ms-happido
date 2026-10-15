import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItem {
  id: string;
  type: 'order' | 'blood' | 'offer' | 'wallet';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationCenterModalProps {
  visible: boolean;
  onClose: () => void;
  onActionClick: (route: string) => void;
  newNotification?: NotificationItem | null;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Status Update 🛵',
    message: 'Your food from Happido Kitchen is being prepared! Delivery partner assigned.',
    time: '5 mins ago',
    read: false,
  },
  {
    id: '2',
    type: 'blood',
    title: '🚨 Urgent Blood Needed',
    message: 'Apollo Hospitals Banjara Hills urgently needs O+ blood for surgery.',
    time: '25 mins ago',
    read: false,
  },
  {
    id: '3',
    type: 'offer',
    title: 'Weekend Special: 50% OFF 🎉',
    message: 'Use code TASTE50 to get up to ₹120 off on all restaurants in Hyderabad.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'wallet',
    title: 'Cashback Credited 💳',
    message: '₹50.00 promotional cashback has been added to your Happido Wallet.',
    time: '1 day ago',
    read: true,
  },
];

export default function NotificationCenterModal({
  visible,
  onClose,
  onActionClick,
  newNotification
}: NotificationCenterModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    if (newNotification) {
      setNotifications(prev => {
        if (prev.find(n => n.id === newNotification.id)) return prev;
        return [newNotification, ...prev];
      });
    }
  }, [newNotification]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return { name: 'bicycle' as const, bg: '#FFF7ED', color: '#EA580C' };
      case 'blood':
        return { name: 'water' as const, bg: '#FEF2F2', color: '#DC2626' };
      case 'offer':
        return { name: 'pricetag' as const, bg: '#FEF3C7', color: '#D97706' };
      case 'wallet':
        return { name: 'wallet' as const, bg: '#F0FDF4', color: '#16A34A' };
      default:
        return { name: 'notifications' as const, bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!visible) return null;

  const modalBody = (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheetContainer}>
        <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.modalTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadCountBadge}>
                  <Text style={styles.unreadCountText}>{unreadCount} new</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.markReadText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotice}>
                <Ionicons name="notifications-off-outline" size={44} color="#94A3B8" />
                <Text style={styles.emptyNoticeText}>No notifications yet</Text>
              </View>
            ) : (
              notifications.map((item) => {
                const icon = getIcon(item.type);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notifCard, !item.read && styles.unreadCard]}
                    onPress={() => {
                      if (item.type === 'order') onActionClick('/checkout');
                      if (item.type === 'blood') onActionClick('/blood-request');
                      if (item.type === 'offer') onActionClick('/restaurants');
                      onClose();
                    }}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
                      <Ionicons name={icon.name} size={20} color={icon.color} />
                    </View>
                    <View style={styles.notifContent}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]}>{item.title}</Text>
                        {!item.read && <View style={styles.dot} />}
                      </View>
                      <Text style={styles.notifMessage}>{item.message}</Text>
                      <Text style={styles.notifTime}>{item.time}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
  );

  if (Platform.OS === 'web') {
    return modalBody;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {modalBody}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      } as any,
      default: {
        flex: 1,
      },
    }),
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadCountBadge: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadCountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  markReadText: {
    fontSize: 13,
    color: '#EA580C',
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  unreadCard: {
    backgroundColor: '#FFFBF5',
    borderColor: '#FED7AA',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
  notifMessage: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  emptyNotice: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyNoticeText: {
    marginTop: 10,
    color: '#94A3B8',
    fontSize: 14,
  },
});
