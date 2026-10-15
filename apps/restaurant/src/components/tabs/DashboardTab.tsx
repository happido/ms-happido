
import AIPredictionChart from '../AIPredictionChart';
import AIInsightCard from '../AIInsightCard';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { OrderPipelineCard, OrderData } from '../OrderPipelineCard';

interface Props {
  isOnline: boolean;
  onToggleOnline: (val: boolean) => void;
  orders: OrderData[];
  menuItems: any[];
  menuItemsCount: number;
  onOpenMenu: () => void;
  onOpenBulkMenu: () => void;
  onNavigateTab: (tab: 'dashboard' | 'orders' | 'menu' | 'hub') => void;
  onUpdateOrderStatus: (orderId: string, status: OrderData['status']) => void;
  onPrintKOT?: (order: OrderData) => void;
  onOpenReviews?: () => void;
  onOpenEODReport?: () => void;
  isRushMode?: boolean;
  onToggleRushMode?: (val: boolean) => void;
}

export default function DashboardTab({
  isOnline,
  onToggleOnline,
  orders,
  onUpdateOrderStatus,
  onPrintKOT,
  isRushMode = false,
  onToggleRushMode,
  onNavigateTab,
  menuItems
}: Props) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('Today');

  const aiInsights = [
    {
      id: '0',
      type: 'promo',
      title: '₹49 Store Optimization',
      description: 'Your ₹49 Desserts are driving 30% of new customer traffic. Suggest adding a ₹49 Drink to maximize acquisition.',
      actionText: 'Auto-Configure',
      impactText: '+ 20% New Cust.'
    },
    {
      id: '1',
      type: 'promo',
      title: 'Dynamic Promo Suggestion',
      description: 'Traffic is currently 15% lower than normal. AI suggests creating a 15% off Happy Hour promo to boost sales.',
      actionText: 'Apply Promo',
      impactText: '+ ₹3,200 Est.'
    },
    {
      id: '2',
      type: 'combo',
      title: 'Menu Combo Optimization',
      description: 'Apriori analysis shows 68% of customers order Margherita Pizza with Coke. Create a Combo to increase AOV.',
      actionText: 'Create Combo',
      impactText: '+ 12% AOV'
    },
    {
      id: '3',
      type: 'inventory',
      title: 'Predictive Inventory Alert',
      description: 'Based on current order velocity and historical demand, you are projected to run out of Paneer by 7:30 PM.',
      actionText: 'Order Stock',
      impactText: 'High Risk'
    }
  ];
  
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready' || o.status === 'ready_for_pickup');
  const activeOrdersCount = pendingOrders.length + preparingOrders.length + readyOrders.length;
  
  // Calculate demo metrics
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const todaysRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const outOfStockItems = menuItems?.filter(m => m.isAvailable === false).length || 0;

  // Compute top sellers from actual orders
  const itemCounts: Record<string, number> = {};
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
    });
  });
  const topSellers = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Compute real-time chart data
  const chartData = [0, 0, 0, 0, 0, 0, 0];
  if (timeFilter === 'Today') {
    // Group by 2-hour slots starting from 10am
    orders.forEach(o => {
      if (!o.createdAt) return;
      const date = new Date(o.createdAt);
      const today = new Date();
      if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth()) {
        const hour = date.getHours();
        if (hour >= 10 && hour < 12) chartData[0]++;
        else if (hour >= 12 && hour < 14) chartData[1]++;
        else if (hour >= 14 && hour < 16) chartData[2]++;
        else if (hour >= 16 && hour < 18) chartData[3]++;
        else if (hour >= 18 && hour < 20) chartData[4]++;
        else if (hour >= 20 && hour < 22) chartData[5]++;
        else if (hour >= 22) chartData[6]++;
      }
    });
  } else {
    // Group by day of week (Mon=0...Sun=6)
    orders.forEach(o => {
      if (!o.createdAt) return;
      const date = new Date(o.createdAt);
      const day = date.getDay(); // 0 is Sunday
      const idx = day === 0 ? 6 : day - 1;
      if (idx >= 0 && idx <= 6) {
        chartData[idx]++;
      }
    });
  }

  const maxChartVal = Math.max(...chartData, 1); // at least 1 to avoid div by zero
  const chartHeights = chartData.map(val => val / maxChartVal);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header with Filter */}
        <Animated.View entering={FadeInDown.delay(40).springify()} style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={styles.mainTitle}>Dashboard</Text>
            <Text style={styles.subTitle}>Business Analytics</Text>
          </View>
          
          <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 20, padding: 4 }}>
            {['Today', 'Week'].map(f => (
              <TouchableOpacity 
                key={f}
                onPress={() => setTimeFilter(f)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                  backgroundColor: timeFilter === f ? '#FFF' : 'transparent',
                  shadowColor: timeFilter === f ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: timeFilter === f ? 2 : 0
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: timeFilter === f ? '800' : '600', color: timeFilter === f ? '#0F172A' : '#64748B' }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Metrics Grid 2x2 */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={[styles.metricsGrid, { flexWrap: 'wrap' }]}>
          <View style={[styles.metricCard, { minWidth: '45%', marginBottom: 12 }]}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="cash-outline" size={18} color="#D4AF37" />
            </View>
            <Text style={styles.metricValue}>₹{timeFilter === 'Week' ? (todaysRevenue * 6.2).toLocaleString('en-IN') : todaysRevenue.toLocaleString('en-IN')}</Text>
            <Text style={styles.metricLabel}>{timeFilter}'s Sales</Text>
          </View>

          <View style={[styles.metricCard, { minWidth: '45%', marginBottom: 12 }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="cart-outline" size={18} color="#16A34A" />
            </View>
            <Text style={styles.metricValue}>{timeFilter === 'Week' ? completedOrders.length * 6 : completedOrders.length}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
          </View>

          <View style={[styles.metricCard, { minWidth: '45%' }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="receipt-outline" size={18} color="#4B5563" />
            </View>
            <Text style={styles.metricValue}>{activeOrdersCount}</Text>
            <Text style={styles.metricLabel}>Active Orders</Text>
          </View>

          <View style={[styles.metricCard, { minWidth: '45%' }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="time-outline" size={18} color="#4B5563" />
            </View>
            <Text style={styles.metricValue}>{activeOrdersCount > 0 ? '12m' : '0m'}</Text>
            <Text style={styles.metricLabel}>Avg. Prep Time</Text>
          </View>
        </Animated.View>

        {/* Beautiful Bar Graph */}
        <View style={{ marginBottom: 32, backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>Sales Volume</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 }}>
            {chartHeights.map((heightPct, idx) => {
              const isPeak = heightPct === 1.0 && chartData[idx] > 0;
              return (
              <View key={idx} style={{ alignItems: 'center' }}>
                <View style={{ width: 24, height: Math.max(4, 100 * heightPct), backgroundColor: isPeak ? '#EA580C' : '#FED7AA', borderRadius: 6 }} />
                <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 8, fontWeight: '600' }}>
                  {timeFilter === 'Week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx] : ['10a', '12p', '2p', '4p', '6p', '8p', '10p'][idx]}
                </Text>
              </View>
              );
            })}
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Today's Top Sellers</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
            {topSellers.length > 0 ? topSellers.map((item, idx) => (
              <View key={item.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: idx === topSellers.length - 1 ? 0 : 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }} numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, marginRight: 8 }}>{idx + 1}. {item.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#059669' }}>{item.count} Orders</Text>
              </View>
            )) : (
              <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>No orders yet today.</Text>
            )}
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Inventory Alerts</Text>
          <View style={{ backgroundColor: outOfStockItems > 0 ? '#FEF2F2' : '#F0FDF4', borderRadius: 16, borderWidth: 1, borderColor: outOfStockItems > 0 ? '#FECACA' : '#BBF7D0', padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={outOfStockItems > 0 ? "warning" : "checkmark-circle"} size={24} color={outOfStockItems > 0 ? "#DC2626" : "#16A34A"} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: outOfStockItems > 0 ? '#991B1B' : '#166534' }}>
                {outOfStockItems > 0 ? 'Stock Warning' : 'All Items Available'}
              </Text>
              <Text style={{ fontSize: 13, color: outOfStockItems > 0 ? '#B91C1C' : '#15803D', marginTop: 2 }}>
                {outOfStockItems > 0 ? `You currently have ${outOfStockItems} item${outOfStockItems > 1 ? 's' : ''} marked as "Sold Out".` : 'Your menu is fully stocked and ready.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Controls */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Quick Controls</Text>
          <View style={styles.controlsGrid}>
            <View style={styles.controlCard}>
              <View>
                <Text style={styles.controlTitle}>Rush Mode</Text>
                <Text style={styles.controlSub}>Add +15m prep time</Text>
              </View>
              <Switch
                value={isRushMode}
                onValueChange={(val) => onToggleRushMode && onToggleRushMode(val)}
                trackColor={{ false: '#E5E7EB', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </Animated.View>

        {/* Action Required (New Orders) */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.actionSection}>
          <View style={styles.actionHeader}>
            <Text style={styles.sectionTitle}>Action Required</Text>
            {pendingOrders.length > 0 && (
              <TouchableOpacity onPress={() => onNavigateTab('orders')}>
                <Text style={styles.seeAllText}>See all ({pendingOrders.length})</Text>
              </TouchableOpacity>
            )}
          </View>

          {pendingOrders.length > 0 ? (
            <View style={styles.actionList}>
              {pendingOrders.map((order, idx) => (
                <OrderPipelineCard
                  key={order._id}
                  order={order}
                  index={idx}
                  onAccept={(id) => onUpdateOrderStatus(id, 'preparing')}
                  onStartPrep={(id) => onUpdateOrderStatus(id, 'preparing')}
                  onReject={(id) => onUpdateOrderStatus(id, 'cancelled')}
                  onPrintKOT={onPrintKOT}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="checkmark-done" size={28} color="#D4AF37" />
              </View>
              <Text style={styles.emptyTitle}>You're all caught up!</Text>
              <Text style={styles.emptySub}>No pending orders require your immediate attention.</Text>
              <TouchableOpacity style={styles.emptyActionBtn} onPress={() => onNavigateTab('orders')}>
                <Text style={styles.emptyActionText}>View Cooking Pipeline</Text>
                <Ionicons name="arrow-forward" size={14} color="#D4AF37" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

      </ScrollView>
    
      {toastMsg && (
        <Animated.View entering={FadeInDown.springify()} style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -1,
  },
  subTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  controlsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  controlsGrid: {
    gap: 12,
  },
  controlCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  controlTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  controlSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionSection: {
    marginBottom: 20,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
  },
  actionList: {
    gap: 16,
  },
  emptyState: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 9999,
    zIndex: 9999,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
