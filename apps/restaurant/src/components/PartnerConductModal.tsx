import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PartnerConductModal({ visible, onClose }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(200)} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.iconBg}>
              <Ionicons name="shield-checkmark" size={20} color="#EA580C" />
            </View>
            <Text style={styles.headerTitle}>Partner Code of Conduct</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Happido strictly enforces these guidelines to maintain a tier-1 customer experience. Violations will result in financial penalties or permanent delisting.
          </Text>

          {/* Rule 1 */}
          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Ionicons name="fast-food" size={18} color="#059669" />
              <Text style={styles.ruleTitle}>1. Uncompromising Food Quality</Text>
            </View>
            <Text style={styles.ruleDesc}>
              Partners must use fresh ingredients and adhere strictly to FSSAI standards. Serving stale, spoiled, or unhygienic food carries a zero-tolerance policy and immediate termination.
            </Text>
          </View>

          {/* Rule 2 */}
          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Ionicons name="cube" size={18} color="#2563EB" />
              <Text style={styles.ruleTitle}>2. Spill-Proof Packaging</Text>
            </View>
            <Text style={styles.ruleDesc}>
              All liquid and semi-liquid items MUST be sealed in spill-proof containers. Any refunds triggered by customer complaints regarding spillage will be 100% borne by the restaurant.
            </Text>
          </View>

          {/* Rule 3 */}
          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Ionicons name="timer" size={18} color="#D97706" />
              <Text style={styles.ruleTitle}>3. Strict Prep Time Adherence</Text>
            </View>
            <Text style={styles.ruleDesc}>
              You must mark the food as "Ready" within the designated prep buffer. Delays exceeding 10 minutes from the estimated prep time will result in a ₹50 penalty applied to your daily settlement.
            </Text>
          </View>

          {/* Rule 4 */}
          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Ionicons name="close-circle" size={18} color="#DC2626" />
              <Text style={styles.ruleTitle}>4. Cancellation Policy</Text>
            </View>
            <Text style={styles.ruleDesc}>
              Auto-rejecting orders or cancelling after accepting an order severely hurts the customer experience. A ₹100 penalty fee is strictly enforced for merchant-initiated cancellations.
            </Text>
          </View>
          
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.agreeBtn} onPress={onClose}>
            <Text style={styles.agreeText}>I Agree & Understand</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 9999,
    padding: Platform.OS === 'web' ? 20 : 0,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderRadius: Platform.OS === 'web' ? 24 : undefined,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBg: {
    backgroundColor: '#FFF7ED',
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  ruleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  ruleDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  agreeBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  agreeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
