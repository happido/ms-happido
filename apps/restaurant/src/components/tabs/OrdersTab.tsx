import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { OrderPipelineCard, OrderData } from '../OrderPipelineCard';

interface Props {
  orders: OrderData[];
  onUpdateOrderStatus: (orderId: string, status: OrderData['status']) => void;
  isOnline: boolean;
  onPrintKOT?: (order: OrderData) => void;
}

export default function OrdersTab({
  orders,
  onUpdateOrderStatus,
  isOnline,
  onPrintKOT,
}: Props) {
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingOrders = orders.filter((o) => ['pending', 'accepted'].includes(o.status));
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => ['ready', 'ready_for_pickup'].includes(o.status));
  const completedOrders = orders.filter((o) => ['dispatched', 'delivered', 'cancelled', 'completed'].includes(o.status));

  const currentTabOrders =
    activeTab === 'pending'
      ? pendingOrders
      : activeTab === 'preparing'
      ? preparingOrders
      : activeTab === 'ready'
      ? readyOrders
      : completedOrders;

  const filteredOrders = currentTabOrders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const customerMatch = o.customer?.name?.toLowerCase().includes(q);
    const idMatch = o._id?.toLowerCase().includes(q);
    const itemsMatch = o.items?.some((i) => i.name.toLowerCase().includes(q));
    return customerMatch || idMatch || itemsMatch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Input Bar */}
      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Order ID, customer, dish..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#D4AF37" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Minimalist Top Tabs */}
      <View style={{ paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInDown.delay(70).springify()} style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => setActiveTab('pending')} style={[styles.tab, activeTab === 'pending' && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>New {pendingOrders.length > 0 && <Text style={{ color: '#EF4444' }}>•</Text>}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('preparing')} style={[styles.tab, activeTab === 'preparing' && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === 'preparing' && styles.activeTabText]}>Cooking {preparingOrders.length > 0 && <Text style={{ color: '#F59E0B' }}>•</Text>}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('ready')} style={[styles.tab, activeTab === 'ready' && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === 'ready' && styles.activeTabText]}>Ready {readyOrders.length > 0 && <Text style={{ color: '#10B981' }}>•</Text>}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('completed')} style={[styles.tab, activeTab === 'completed' && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Orders Scroll Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {filteredOrders.length > 0 ? (
          <View style={styles.orderSection}>
            {filteredOrders.map((order, idx) => (
              <OrderPipelineCard
                key={order._id}
                order={order}
                index={idx}
                onAccept={(id: string) => onUpdateOrderStatus(id, 'preparing')}
                onStartPrep={(id: string) => onUpdateOrderStatus(id, 'preparing')}
                onReject={(id: string) => onUpdateOrderStatus(id, 'cancelled')}
                onMarkReady={(id: string) => onUpdateOrderStatus(id, 'ready')}
                onComplete={(id: string) => onUpdateOrderStatus(id, 'completed')}
                onPrintKOT={onPrintKOT}
              />
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeInUp.springify()} style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending'
                ? 'No incoming orders right now'
                : activeTab === 'preparing'
                ? 'No dishes currently cooking'
                : activeTab === 'ready'
                ? 'No orders waiting for pickup'
                : 'No order history today'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isOnline
                ? 'New orders from Happido customers will appear here automatically with live alerts.'
                : 'Your outlet status is currently PAUSED. Switch Online on Dashboard to receive orders.'}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '700',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  orderSection: {
    gap: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
