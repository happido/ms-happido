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
import { OrderData } from './OrderPipelineCard';

interface Props {
  visible: boolean;
  onClose: () => void;
  order: OrderData | null;
  restaurantName?: string;
}

export default function KOTReceiptModal({
  visible,
  onClose,
  order,
  restaurantName = 'Happido Kitchen',
}: Props) {
  if (!order) return null;

  const shortId =
    order._id.length > 6
      ? order._id.substring(order._id.length - 5).toUpperCase()
      : order._id;

  const subtotal =
    order.items?.reduce((s, i) => s + (i.price || 0) * i.quantity, 0) || order.totalAmount;
  const packagingFee = 20;
  const gstTax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + packagingFee + gstTax;

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      Alert.alert('Printer Connected 🖨️', 'Sending Kitchen Order Ticket to Thermal Bluetooth/USB Printer...');
    }
  };

  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }}>

      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header with Close */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="receipt" size={18} color="#EA580C" />
              <Text style={styles.modalHeaderTitle}>Kitchen Order Ticket (KOT)</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Thermal Paper Bill Slip */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.slipScroll}>
            <View style={styles.paperSlip}>
              {/* Restaurant Branding */}
              <View style={styles.slipHeader}>
                <Text style={styles.slipStoreName}>{restaurantName.toUpperCase()}</Text>
                <Text style={styles.slipStoreSub}>FSSAI Lic: 13621014000389</Text>
                <Text style={styles.slipStoreSub}>Banjara Hills, Hyderabad, AP</Text>
                <Text style={styles.slipStoreSub}>GSTIN: 36AAACH1234F1Z5</Text>
              </View>

              <Text style={styles.dottedDivider}>--------------------------------</Text>

              {/* Order Metadata */}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>KOT TOKEN:</Text>
                <Text style={styles.metaBold}>#{shortId}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>ORDER TYPE:</Text>
                <Text style={styles.metaValue}>Online Delivery (Happido)</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>DATE & TIME:</Text>
                <Text style={styles.metaValue}>Today, 17:20 IST</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>CUSTOMER:</Text>
                <Text style={styles.metaBold}>{order.customer?.name || 'Customer'}</Text>
              </View>
              {order.customer?.phone && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>PHONE:</Text>
                  <Text style={styles.metaValue}>{order.customer.phone}</Text>
                </View>
              )}

              <Text style={styles.dottedDivider}>--------------------------------</Text>

              {/* Items Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol, { flex: 2 }]}>ITEM</Text>
                <Text style={[styles.tableCol, { width: 36, textAlign: 'center' }]}>QTY</Text>
                <Text style={[styles.tableCol, { width: 60, textAlign: 'right' }]}>AMT</Text>
              </View>

              <Text style={styles.dottedDivider}>--------------------------------</Text>

              {/* Items List */}
              {order.items?.map((item, idx) => (
                <View key={idx} style={styles.itemLine}>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={item.isVeg === false ? styles.nonVegTag : styles.vegTag}>
                      {item.isVeg === false ? '[NV]' : '[V] '}
                    </Text>
                    <Text style={styles.itemText} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={[styles.itemText, { width: 36, textAlign: 'center' }]}>
                    {item.quantity}x
                  </Text>
                  <Text style={[styles.itemText, { width: 60, textAlign: 'right' }]}>
                    ₹{((item.price || 0) * item.quantity).toFixed(0)}
                  </Text>
                </View>
              ))}

              {/* Kitchen Special Note */}
              {order.notes ? (
                <>
                  <Text style={styles.dottedDivider}>--------------------------------</Text>
                  <View style={styles.kotNoteBox}>
                    <Text style={styles.kotNoteTitle}>SPECIAL CHEF INSTRUCTIONS:</Text>
                    <Text style={styles.kotNoteDesc}>"{order.notes}"</Text>
                  </View>
                </>
              ) : null}

              <Text style={styles.dottedDivider}>--------------------------------</Text>

              {/* Price Breakdown */}
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Subtotal</Text>
                <Text style={styles.calcValue}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Restaurant Packaging Charge</Text>
                <Text style={styles.calcValue}>₹{packagingFee.toFixed(2)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>SGST (2.5%) + CGST (2.5%)</Text>
                <Text style={styles.calcValue}>₹{gstTax.toFixed(2)}</Text>
              </View>

              <Text style={styles.solidDivider}>================================</Text>

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
                <Text style={styles.grandTotalValue}>₹{grandTotal.toFixed(2)}</Text>
              </View>

              <Text style={styles.paymentMethod}>PAYMENT: ONLINE PREPAID (100% SETTLED)</Text>

              <Text style={styles.solidDivider}>================================</Text>

              <View style={styles.slipFooter}>
                <Text style={styles.footerMsg}>** KITCHEN COPY & PARCEL BILL **</Text>
                <Text style={styles.footerMsg}>Powered by Happido Partner Suite</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
              <Ionicons name="print" size={18} color="#FFFFFF" />
              <Text style={styles.printBtnText}>Print KOT Slip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeSlipBtn} onPress={onClose}>
              <Text style={styles.closeSlipText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Darker overlay for focus
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#F8FAFC', // Soft background to contrast the white paper slip
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
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
  slipScroll: {
    maxHeight: 460,
  },
  paperSlip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    // Add a jagged paper bottom effect using border if possible, or just keep it sleek
  },
  slipHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  slipStoreName: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  slipStoreSub: {
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1.5,
  },
  metaLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#6B7280',
  },
  metaValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#111827',
  },
  metaBold: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: '#111827',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  tableCol: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: '#374151',
  },
  itemLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  vegTag: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#059669',
    fontWeight: '800',
  },
  nonVegTag: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '800',
  },
  itemText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#111827',
  },
  kotNoteBox: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  kotNoteTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
  },
  kotNoteDesc: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#78350F',
    marginTop: 2,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1.5,
  },
  calcLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#6B7280',
  },
  calcValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#111827',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  grandTotalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  grandTotalValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  paymentMethod: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    textAlign: 'center',
    marginVertical: 4,
  },
  slipFooter: {
    alignItems: 'center',
    marginTop: 6,
  },
  footerMsg: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    color: '#9CA3AF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  printBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
  },
  printBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeSlipBtn: {
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
