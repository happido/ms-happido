import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

interface IPhoneQuickActionDockProps {
  cartCount: number;
  activeOrderId?: string;
  onCartPress?: () => void;
  onRequestFoodSubmit?: (requestNote: string) => void;
}

type ActionType = 'cart' | 'order_food' | 'required_food' | 'history' | null;

interface ActionModalConfig {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  primaryButtonText: string;
  secondaryButtonText: string;
}

export default function IPhoneQuickActionDock({
  cartCount,
  activeOrderId = 'HP-9042',
  onCartPress,
  onRequestFoodSubmit,
}: IPhoneQuickActionDockProps) {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [requiredFoodNote, setRequiredFoodNote] = useState('');
  const [dietaryType, setDietaryType] = useState<'regular' | 'patient' | 'emergency'>('regular');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const getModalConfig = (action: ActionType): ActionModalConfig => {
    switch (action) {
      case 'cart':
        return {
          title: 'Open Your Cart',
          description: `You have ${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your cart from Happido Kitchen. Would you like to review and proceed to checkout?`,
          icon: 'cart',
          iconColor: '#EA580C',
          iconBg: '#FFF7ED',
          primaryButtonText: 'View Cart',
          secondaryButtonText: 'Not Now',
        };
      case 'order_food':
        return {
          title: 'Order Food Permission',
          description: 'Happido would like to access nearby restaurants and show live menus for your delivery location.',
          icon: 'fast-food',
          iconColor: '#F59E0B',
          iconBg: '#FEF3C7',
          primaryButtonText: 'Browse Food',
          secondaryButtonText: 'Cancel',
        };
      case 'required_food':
        return {
          title: 'Required Food Request',
          description: 'Submit special dietary, patient nutrition, or emergency food relief requirements to Happido kitchens.',
          icon: 'nutrition',
          iconColor: '#10B981',
          iconBg: '#D1FAE5',
          primaryButtonText: 'Submit Request',
          secondaryButtonText: 'Cancel',
        };
      case 'history':
        return {
          title: 'View Order History',
          description: `Track live order #${activeOrderId} and review your past receipts and invoices.`,
          icon: 'receipt',
          iconColor: '#6366F1',
          iconBg: '#EEF2FF',
          primaryButtonText: 'View History',
          secondaryButtonText: 'Dismiss',
        };
      default:
        return {
          title: '',
          description: '',
          icon: 'help',
          iconColor: '#64748B',
          iconBg: '#F1F5F9',
          primaryButtonText: 'Confirm',
          secondaryButtonText: 'Cancel',
        };
    }
  };

  const handleConfirmAction = () => {
    const action = selectedAction;
    setSelectedAction(null);

    if (action === 'cart') {
      if (onCartPress) {
        onCartPress();
      } else {
        router.push('/cart');
      }
    } else if (action === 'order_food') {
      router.push('/restaurants');
    } else if (action === 'required_food') {
      if (onRequestFoodSubmit) {
        onRequestFoodSubmit(requiredFoodNote);
      }
      showToast('🍲 Food requirement submitted to kitchen!');
      setRequiredFoodNote('');
    } else if (action === 'history') {
      router.push('/checkout');
    }
  };

  const modalConfig = getModalConfig(selectedAction);

  return (
    <>
      {/* Toast Feedback */}
      {toastMessage && (
        <Animated.View entering={FadeInUp} exiting={FadeOutDown} style={styles.dockToast}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.dockToastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* iPhone Multi-Icon Floating Dock */}
      <View style={styles.dockWrapper}>
        <View style={styles.dockContainer}>
          {/* Action 1: View Cart */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setSelectedAction('cart')}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#EA580C' }]}>
              <Ionicons name="cart" size={18} color="#FFFFFF" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.actionLabel}>View Cart</Text>
          </TouchableOpacity>

          <View style={styles.dockDivider} />

          {/* Action 2: Order Food */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setSelectedAction('order_food')}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="fast-food" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Order Food</Text>
          </TouchableOpacity>

          <View style={styles.dockDivider} />

          {/* Action 3: Required Food */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setSelectedAction('required_food')}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#10B981' }]}>
              <Ionicons name="nutrition" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Req Food</Text>
          </TouchableOpacity>

          <View style={styles.dockDivider} />

          {/* Action 4: See History */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setSelectedAction('history')}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#6366F1' }]}>
              <Ionicons name="time" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* iPhone Permission & Action Modal Dialog */}
      <Modal
        visible={selectedAction !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedAction(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedAction(null)}
          />

          <View style={styles.iosAlertCard}>
            {/* Apple-style Icon Header */}
            <View style={[styles.iosAlertIconWrapper, { backgroundColor: modalConfig.iconBg }]}>
              <Ionicons name={modalConfig.icon} size={28} color={modalConfig.iconColor} />
            </View>

            {/* Apple Alert Title & Description */}
            <Text style={styles.iosAlertTitle}>{modalConfig.title}</Text>
            <Text style={styles.iosAlertDesc}>{modalConfig.description}</Text>

            {/* Specific form for "Required Food" */}
            {selectedAction === 'required_food' && (
              <View style={styles.requiredFoodForm}>
                <View style={styles.dietaryChips}>
                  <TouchableOpacity
                    style={[styles.chip, dietaryType === 'regular' && styles.chipActive]}
                    onPress={() => setDietaryType('regular')}
                  >
                    <Text style={[styles.chipText, dietaryType === 'regular' && styles.chipTextActive]}>
                      Meal Request
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, dietaryType === 'patient' && styles.chipActive]}
                    onPress={() => setDietaryType('patient')}
                  >
                    <Text style={[styles.chipText, dietaryType === 'patient' && styles.chipTextActive]}>
                      Patient Diet
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, dietaryType === 'emergency' && styles.chipActive]}
                    onPress={() => setDietaryType('emergency')}
                  >
                    <Text style={[styles.chipText, dietaryType === 'emergency' && styles.chipTextActive]}>
                      Relief Food
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.noteInput}
                  placeholder="Specify dietary requirements or instructions..."
                  placeholderTextColor="#94A3B8"
                  value={requiredFoodNote}
                  onChangeText={setRequiredFoodNote}
                  multiline={true}
                  numberOfLines={2}
                />
              </View>
            )}

            {/* Apple-style Actions Row */}
            <View style={styles.iosAlertActionsRow}>
              <TouchableOpacity
                style={[styles.iosAlertBtn, styles.iosCancelBtn]}
                onPress={() => setSelectedAction(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.iosCancelBtnText}>{modalConfig.secondaryButtonText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iosAlertBtn, styles.iosConfirmBtn, { backgroundColor: modalConfig.iconColor }]}
                onPress={handleConfirmAction}
                activeOpacity={0.85}
              >
                <Text style={styles.iosConfirmBtnText}>{modalConfig.primaryButtonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 998,
    pointerEvents: 'box-none',
  },
  dockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
    width: '92%',
    maxWidth: 420,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.2,
  },
  dockDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 2,
  },

  // Modal Overlay & Apple-style Alert
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iosAlertCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 24,
    zIndex: 1000,
  },
  iosAlertIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iosAlertTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  iosAlertDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  requiredFoodForm: {
    width: '100%',
    marginBottom: 16,
  },
  dietaryChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 6,
  },
  chip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#10B981',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  noteInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  iosAlertActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  iosAlertBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosCancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  iosCancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  iosConfirmBtn: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  iosConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  dockToast: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 9999,
  },
  dockToastText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
});
