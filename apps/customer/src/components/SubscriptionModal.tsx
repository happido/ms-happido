import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  isVIP: boolean;
}

export default function SubscriptionModal({ visible, onClose, onSubscribe, isVIP }: SubscriptionModalProps) {
  if (!visible) return null;

  const modalBody = (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      
      <Animated.View entering={SlideInDown.springify().damping(15)} style={styles.modalContainer}>
        {isVIP ? (
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.goldBadge}>
                <Ionicons name="star" size={24} color="#FBBF24" />
              </View>
              <Text style={styles.title}>You are a Gold Member!</Text>
              <Text style={styles.subtitle}>Enjoy your exclusive benefits.</Text>
            </View>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.benefitText}>Free Delivery on all orders</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.benefitText}>Priority Support</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.benefitText}>Exclusive VIP discounts</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Awesome</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Upgrade to Gold</Text>
              <Text style={styles.subtitle}>Unlock premium features and save more.</Text>
            </View>
            
            <View style={styles.pricingCard}>
              <LinearGradient colors={['#FBBF24', '#D97706']} style={StyleSheet.absoluteFill} borderRadius={16} />
              <Text style={styles.planName}>Happido Gold</Text>
              <Text style={styles.planPrice}>₹199<Text style={styles.planDuration}>/month</Text></Text>
              
              <View style={styles.planBenefits}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={[styles.benefitText, { color: '#FFFFFF' }]}>Free Delivery</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={[styles.benefitText, { color: '#FFFFFF' }]}>Priority Support</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={[styles.benefitText, { color: '#FFFFFF' }]}>Exclusive VIP discounts</Text>
                </View>
              </View>
            </View>

            <View style={styles.paymentMethods}>
              <Text style={styles.paymentTitle}>Quick Payment</Text>
              <View style={styles.paymentOptions}>
                <View style={styles.paymentOption}>
                  <Ionicons name="card-outline" size={24} color="#64748B" />
                  <Text style={styles.paymentText}>UPI / Card</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.subscribeBtn} 
              onPress={() => {
                onSubscribe();
                onClose();
              }}
            >
              <LinearGradient colors={['#F97316', '#EA580C']} style={StyleSheet.absoluteFill} borderRadius={12} />
              <Text style={styles.subscribeBtnText}>Pay ₹199 & Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );

  if (Platform.OS === 'web') {
    return modalBody;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: height * 0.45,
    width: '100%',
    maxWidth: 480,
    padding: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  goldBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  pricingCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  planBenefits: {
    gap: 8,
  },
  paymentMethods: {
    marginBottom: 24,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  subscribeBtn: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    zIndex: 1,
  },
  closeBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
});
