import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import api from '../utils/api';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/customer');
      // Sort by newest first
      setOrders(res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.log('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {}
    router.replace('/');
  };

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return '#10B981';
    if (status === 'cancelled') return '#EF4444';
    return '#F59E0B';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders & History</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : orders.length === 0 ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={60} color="#EA580C" />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't placed any orders yet. Once you order food or rides, they will appear here!
          </Text>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.replace('/restaurants')}
          >
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              style={styles.exploreGradient}
            >
              <Ionicons name="restaurant-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.exploreBtnText}>Browse Restaurants</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {orders.map((order, index) => (
            <Animated.View key={order._id} entering={FadeInDown.delay(index * 100).duration(400)} style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {order.restaurant?.name || 'Restaurant'}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {formatStatus(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {order.items?.map((item: any, idx: number) => (
                  <Text key={idx} style={styles.itemText} numberOfLines={1}>
                    {item.quantity} x {item.name}
                  </Text>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.totalText}>Total: ₹{order.grandTotal || order.totalAmount}</Text>
                
                {['delivered', 'cancelled'].includes(order.status) ? (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/restaurants/${order.restaurant?._id}`)}>
                    <Ionicons name="refresh" size={16} color="#EA580C" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnText}>Reorder</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EA580C' }]} onPress={() => router.push(`/tracking/${order._id}`)}>
                    <Ionicons name="location" size={16} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Track</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  container: { flex: 1, padding: 16 },
  
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    maxWidth: 200,
  },
  orderDate: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemsList: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 300,
  },
  exploreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
