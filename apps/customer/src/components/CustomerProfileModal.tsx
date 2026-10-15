import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomerProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  walletBalance?: number;
  totalOrders?: number;
  assistiveTouchEnabled?: boolean;
  onToggleAssistiveTouch?: (enabled: boolean) => void;
  onLogout: () => void;
  onNavigate: (route: string) => void;
}

export default function CustomerProfileModal({
  visible,
  onClose,
  userName,
  userEmail = 'happido@gmail.com',
  userPhone = '+91 95024 25359',
  walletBalance = 0,
  totalOrders = 0,
  assistiveTouchEnabled = true,
  onToggleAssistiveTouch,
  onLogout,
  onNavigate,
}: CustomerProfileModalProps) {
  const initial = (userName || 'User').charAt(0).toUpperCase();

  if (!visible) return null;

  const modalBody = (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheetContainer}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Account</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* User Info Card */}
            <View style={styles.userCard}>
              <View style={styles.avatarCircle}>
                <LinearGradient colors={['#F97316', '#EA580C']} style={StyleSheet.absoluteFill} />
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.userInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.nameText}>{userName || 'Happido Customer'}</Text>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                </View>
                <Text style={styles.subText}>{userEmail}</Text>
                <Text style={styles.phoneText}>{userPhone}</Text>
              </View>
            </View>

            {/* Wallet & Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Happido Wallet</Text>
                <Text style={styles.statVal}>₹{walletBalance.toFixed(2)}</Text>
                {walletBalance > 0 ? (
                  <Text style={styles.statSub}>+ ₹50 Cashback</Text>
                ) : (
                  <Text style={[styles.statSub, { color: '#94A3B8' }]}>No active offers</Text>
                )}
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Orders</Text>
                <Text style={styles.statVal}>{totalOrders}</Text>
                <Text style={[styles.statSub, { color: totalOrders === 0 ? '#94A3B8' : '#EA580C' }]}>
                  {totalOrders === 0 ? 'Start ordering!' : 'Food & Rides'}
                </Text>
              </View>
            </View>

            {/* Account Options List */}
            <View style={styles.optionsList}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onClose();
                  onNavigate('/orders');
                }}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="receipt-outline" size={20} color="#EA580C" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Orders & History</Text>
                  <Text style={styles.optionSubtitle}>View all food orders and rides</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onClose();
                  onNavigate('/cart');
                }}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="cart-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>My Cart</Text>
                  <Text style={styles.optionSubtitle}>View items ready to checkout</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onClose();
                  onNavigate('/blood-request');
                }}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="water-outline" size={20} color="#DC2626" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Blood Donor Profile</Text>
                  <Text style={styles.optionSubtitle}>Emergency donor status (O+ Eligible)</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onClose();
                  onNavigate('/map');
                }}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="navigate-outline" size={20} color="#16A34A" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Saved Addresses</Text>
                  <Text style={styles.optionSubtitle}>Home, Work, and Favorites</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* AssistiveTouch Toggle Setting */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.settingsSectionTitle}>Assistant & Quick Access</Text>
              <View style={styles.settingToggleItem}>
                <View style={[styles.optionIconCircle, { backgroundColor: '#0F172A' }]}>
                  <Ionicons name="radio-button-on" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>AssistiveTouch</Text>
                  <Text style={styles.optionSubtitle}>Movable floating quick actions</Text>
                </View>
                <Switch
                  value={assistiveTouchEnabled}
                  onValueChange={onToggleAssistiveTouch}
                  trackColor={{ false: '#CBD5E1', true: '#EA580C' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Log Out Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={styles.logoutBtnText}>Sign Out of Happido</Text>
            </TouchableOpacity>
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statLabel: {
    fontSize: 11,
    color: '#9A3412',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C2410C',
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '600',
    marginTop: 2,
  },
  optionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
});
