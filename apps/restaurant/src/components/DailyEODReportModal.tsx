import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  visible: boolean;
  onClose: () => void;
  restaurantName?: string;
  totalSales?: number;
  totalOrders?: number;
}

export default function DailyEODReportModal({
  visible,
  onClose,
  restaurantName = 'Happido Kitchen',
  totalSales = 0,
  totalOrders = 0,
}: Props) {
  const commPercent = 0.12; // 12% Happido commission
  const commission = Math.round(totalSales * commPercent);
  const gstCollected = Math.round(totalSales * 0.05);
  const packagingTotal = totalOrders * 20;
  const netBankSettlement = totalSales - commission + packagingTotal;

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      Alert.alert('Printer Connected 🖨️', 'Printing End-of-Day (EOD) Z-Report summary...');
    }
  };

  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }}>

      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="document-text" size={18} color="#EA580C" />
              <Text style={styles.modalHeaderTitle}>Daily End-of-Day (EOD) Z-Report</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Thermal Slip Body */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            <View style={styles.reportSlip}>
              <View style={styles.centerHeader}>
                <Text style={styles.brandTitle}>{restaurantName.toUpperCase()}</Text>
                <Text style={styles.brandSub}>DAILY AUDIT & SETTLEMENT SLIP</Text>
                <Text style={styles.brandSub}>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Closing: 23:00</Text>
              </View>

              <Text style={styles.dottedDivider}>================================</Text>

              {/* Summary KPIs */}
              <View style={styles.kpiRow}>
                <Text style={styles.kpiLabel}>TOTAL COMPLETED ORDERS:</Text>
                <Text style={styles.kpiValueBold}>{totalOrders} Orders</Text>
              </View>
              <View style={styles.kpiRow}>
                <Text style={styles.kpiLabel}>CANCELLED / REJECTED:</Text>
                <Text style={styles.kpiValue}>0 Orders (0%)</Text>
              </View>
              <View style={styles.kpiRow}>
                <Text style={styles.kpiLabel}>AVERAGE PREP TIME:</Text>
                <Text style={styles.kpiValue}>18 mins</Text>
              </View>

              <Text style={styles.dottedDivider}>--------------------------------</Text>

              {/* Financial Breakup */}
              <Text style={styles.sectionHeader}>FINANCIAL BREAKDOWN (INR)</Text>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Gross Food Sales</Text>
                <Text style={styles.calcVal}>₹{totalSales.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Packaging Charges Collected</Text>
                <Text style={styles.calcVal}>+ ₹{packagingTotal.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>GST 5% (CGST + SGST)</Text>
                <Text style={styles.calcVal}>+ ₹{gstCollected.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={[styles.calcLabel, { color: '#DC2626' }]}>Happido Platform Fee (12%)</Text>
                <Text style={[styles.calcVal, { color: '#DC2626' }]}>- ₹{commission.toLocaleString('en-IN')}</Text>
              </View>

              <Text style={styles.solidDivider}>================================</Text>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>NET BANK SETTLEMENT</Text>
                <Text style={styles.totalVal}>₹{netBankSettlement.toLocaleString('en-IN')}</Text>
              </View>
              <Text style={styles.settleNote}>Scheduled for auto NEFT transfer at 06:00 AM</Text>

              <Text style={styles.dottedDivider}>--------------------------------</Text>

              {/* Payment Mode Distribution */}
              <Text style={styles.sectionHeader}>PAYMENT METHOD SPLIT</Text>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>UPI / GooglePay / PhonePe (92%)</Text>
                <Text style={styles.calcVal}>₹{(totalSales * 0.92).toFixed(0)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Cards / NetBanking (8%)</Text>
                <Text style={styles.calcVal}>₹{(totalSales * 0.08).toFixed(0)}</Text>
              </View>

              <Text style={styles.dottedDivider}>--------------------------------</Text>

              {/* Top Selling Dishes Today */}
              <Text style={styles.sectionHeader}>TOP DISHES SOLD TODAY</Text>
              {totalSales === 0 ? (
                <View style={{ paddingVertical: 8, alignItems: 'center' }}>
                  <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 10, color: '#9CA3AF' }}>
                    No items sold today.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.topItemRow}>
                    <Text style={styles.topItemName}>1. Best Selling Item</Text>
                    <Text style={styles.topItemCount}>- units</Text>
                  </View>
                </>
              )}

              <Text style={styles.solidDivider}>================================</Text>
              <View style={styles.footerNote}>
                <Text style={styles.footerText}>*** MANAGER AUDIT VERIFIED ***</Text>
                <Text style={styles.footerText}>Happido Merchant POS Gateway</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Bar */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
              <Ionicons name="print-outline" size={17} color="#FFFFFF" />
              <Text style={styles.printButtonText}>Print Z-Report Slip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeSlipButton} onPress={onClose}>
              <Text style={styles.closeSlipText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '92%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  scroll: {
    maxHeight: 480,
  },
  reportSlip: {
    backgroundColor: '#FFFEFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
  },
  centerHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  brandTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  brandSub: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  dottedDivider: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 4,
  },
  solidDivider: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 4,
  },
  sectionHeader: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1.5,
  },
  kpiLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#6B7280',
  },
  kpiValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#111827',
  },
  kpiValueBold: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: '#111827',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1.5,
  },
  calcLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#4B5563',
  },
  calcVal: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
  totalVal: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  settleNote: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  topItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  topItemName: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#374151',
    flex: 1,
  },
  topItemCount: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 6,
  },
  footerText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  printButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
  },
  printButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeSlipButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeSlipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
});
