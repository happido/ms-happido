import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface SettlementRecord {
  id: string;
  date: string;
  grossAmount: number;
  commission: number;
  tax: number;
  netAmount: number;
  status: 'settled' | 'processing';
  method: string;
  utrNumber: string;
}

const DEMO_SETTLEMENTS: SettlementRecord[] = [];

interface PaymentsTabProps {
  restaurantName?: string;
  bankDetails?: { accountNumber: string; ifscCode: string };
  showAlert?: (title: string, message: string, animationType?: 'success' | 'lock' | 'warning') => void;
}

export default function PaymentsTab({ restaurantName = 'Restaurant', bankDetails, showAlert }: PaymentsTabProps) {
  const [filter, setFilter] = useState<'all' | 'settled' | 'processing'>('all');

  const filtered = DEMO_SETTLEMENTS.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const totalSettledMonth = DEMO_SETTLEMENTS.filter((s) => s.status === 'settled').reduce(
    (sum, s) => sum + s.netAmount,
    0
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Overview Balance Card */}
      <View style={styles.balanceCard}>
        <LinearGradient
          colors={['#111827', '#1F2937']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceGradient}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={styles.balanceLabel}>Next Settlement Amount</Text>
              <Text style={styles.balanceValue}>₹0.00</Text>
            </View>
            <View style={styles.dailyPill}>
              <Ionicons name="time" size={12} color="#FFFFFF" />
              <Text style={styles.dailyPillText}>Daily 11:00 AM</Text>
            </View>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceFooter}>
            <View>
              <Text style={styles.balanceFooterLabel}>Current Month Payouts</Text>
              <Text style={styles.balanceFooterValue}>₹0.00</Text>
            </View>
            <TouchableOpacity
              style={styles.statementBtn}
              onPress={() => Alert.alert('GST Invoice', 'Monthly GST tax statement emailed to your registered address.')}
            >
              <Ionicons name="download-outline" size={14} color="#1F2937" />
              <Text style={styles.statementBtnText}>Statement</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Linked Bank Account Card */}
      <View style={styles.accountCard}>
        <View style={styles.accountCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.bankIconWrap}>
              <Ionicons name="card" size={18} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.accountBankName}>{bankDetails?.ifscCode ? `Bank (IFSC: ${bankDetails.ifscCode})` : 'HDFC Bank Ltd'}</Text>
              <Text style={styles.accountNumber}>
                A/C: •••••••• {bankDetails?.accountNumber ? bankDetails.accountNumber.slice(-4) : '4189'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={12} color="#059669" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                if (showAlert) {
                  showAlert(
                    'Bank Details Locked 🔒', 
                    'For security purposes, penny-drop verified bank details cannot be edited directly. To change your payout account, please contact Partner Support to initiate a new KYC verification cycle.',
                    'lock'
                  );
                } else {
                  Alert.alert(
                    'Bank Details Locked 🔒', 
                    'For security purposes, penny-drop verified bank details cannot be edited directly. To change your payout account, please contact Partner Support to initiate a new KYC verification cycle.'
                  );
                }
              }}
            >
              <Ionicons name="pencil-outline" size={18} color="#6B7280" style={{ padding: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.upiRow}>
          <Text style={styles.upiLabel}>Linked UPI ID:</Text>
          <Text style={styles.upiValue}>{restaurantName.toLowerCase().replace(/\s+/g, '')}@okhdfcbank</Text>
        </View>
      </View>

      {/* Happido Pricing & Commission Chart */}
      <View style={styles.infoCard}>
        <Text style={[styles.infoTitle, { fontSize: 16, color: '#EA580C', marginBottom: 12 }]}>Happido Partner Pricing Chart</Text>
        
        {/* Standard Orders */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 8, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' }}>Standard Orders</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Base Commission</Text>
            <Text style={[styles.infoRowValue, { color: '#059669' }]}>8.0% Flat</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Payment Gateway Fee</Text>
            <Text style={styles.infoRowValue}>2.0%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Onboarding / Hidden Fees</Text>
            <Text style={[styles.infoRowValue, { color: '#059669' }]}>₹0</Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 16 }} />

        {/* ₹49 Quick Store Orders */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 8, backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' }}>₹49 Quick Store (20 Min)</Text>
          <Text style={{ fontSize: 11, color: '#64748B', marginBottom: 10 }}>Fixed flat-fee payout model for hyper-local quick items.</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Customer Pays</Text>
            <Text style={styles.infoRowValue}>₹49</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoRowLabel, { fontWeight: '700', color: '#111827' }]}>Restaurant Payout</Text>
            <Text style={[styles.infoRowValue, { color: '#059669', fontSize: 14 }]}>₹20 Guaranteed</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Rider Payout</Text>
            <Text style={styles.infoRowValue}>₹20</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Happido Platform Fee</Text>
            <Text style={styles.infoRowValue}>₹9</Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F172A' }}>The Happido Promise</Text>
          </View>
          <Text style={{ fontSize: 11, color: '#475569', lineHeight: 16 }}>No forced discounts. No mandatory ad campaigns. Compare this to the 25%-40% effective deductions on competitors.</Text>
        </View>
      </View>

      {/* Settlement History Header & Filter */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Settlement History</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {(['all', 'settled', 'processing'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.historyFilterChip, filter === tab && styles.historyFilterChipActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.historyFilterText,
                  filter === tab && styles.historyFilterTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Settlements List */}
      {filtered.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <Ionicons name="receipt-outline" size={40} color="#CBD5E1" />
          <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13, fontWeight: '600' }}>No settlements yet.</Text>
          <Text style={{ marginTop: 4, color: '#94A3B8', fontSize: 11, textAlign: 'center', marginHorizontal: 40 }}>
            Once you start receiving orders, your daily payouts will appear here.
          </Text>
        </View>
      ) : (
        filtered.map((item) => (
          <View key={item.id} style={styles.settlementCard}>
            <View style={styles.settlementTop}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.settlementId}>{item.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'settled' ? styles.statusSettled : styles.statusProcessing,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === 'settled' ? styles.statusSettledText : styles.statusProcessingText,
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.settlementDate}>{item.date}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.settlementAmount}>₹{item.netAmount.toLocaleString('en-IN')}</Text>
                <Text style={styles.settlementMethod}>{item.method}</Text>
              </View>
            </View>

            <View style={styles.settlementBreakdown}>
              <Text style={styles.breakdownText}>
                Gross: ₹{item.grossAmount} • Fee: -₹{item.commission} • Tax: -₹{item.tax}
              </Text>
              <Text style={styles.utrText}>{item.utrNumber}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  balanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 3,
  },
  balanceGradient: {
    padding: 18,
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  dailyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  dailyPillText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 14,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceFooterLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceFooterValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  statementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statementBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accountCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountBankName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  accountNumber: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  upiLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginRight: 6,
  },
  upiValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  infoCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  infoRowLabel: {
    fontSize: 11,
    color: '#7C2D12',
  },
  infoRowValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A3412',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  historyFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  historyFilterChipActive: {
    backgroundColor: '#1F2937',
  },
  historyFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  historyFilterTextActive: {
    color: '#FFFFFF',
  },
  settlementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  settlementTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settlementId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusSettled: {
    backgroundColor: '#ECFDF5',
  },
  statusProcessing: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusSettledText: {
    color: '#059669',
  },
  statusProcessingText: {
    color: '#D97706',
  },
  settlementDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  settlementAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  settlementMethod: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  settlementBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
  },
  breakdownText: {
    fontSize: 10,
    color: '#6B7280',
  },
  utrText: {
    fontSize: 9,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
});
