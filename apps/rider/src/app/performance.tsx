import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '../components/BottomNav';
import api from '../utils/api';

const RAPIDO_YELLOW = '#F9C935';

export default function PerformanceScreen() {
  const router = useRouter();
  const [driverMetrics, setDriverMetrics] = useState<any>(null);
  const [showQuests, setShowQuests] = useState(false);

  useEffect(() => {
    // Fetch metrics for Daily Quests snippet
    api.get('/rider/metrics')
      .then(res => setDriverMetrics(res.data))
      .catch(err => console.log('Could not fetch metrics', err));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance & Quests</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Kadapa Rate Card */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('/prices')}>
          <View style={styles.cardIconBox}>
            <Ionicons name="pricetag" size={24} color={RAPIDO_YELLOW} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Kadapa Rate Card</Text>
            <Text style={styles.cardText}>View base fare, per km rates, and current surge multiplier for your city.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Daily Quests */}
        <TouchableOpacity style={[styles.card, showQuests && { flexDirection: 'column', alignItems: 'stretch' }]} onPress={() => setShowQuests(!showQuests)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.cardIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="trophy" size={24} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Daily Quests</Text>
              <Text style={styles.cardText}>Track your ride targets and unlock daily bonus incentives.</Text>
            </View>
            <Ionicons name={showQuests ? "chevron-down" : "chevron-forward"} size={20} color="#CBD5E1" />
          </View>
          
          {showQuests && driverMetrics?.quests && (
            <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>Complete {driverMetrics.quests.targetRides} Rides</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#10B981' }}>+₹{driverMetrics.quests.bonus}</Text>
              </View>
              <View style={{ width: '100%', height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
                <View style={{ width: `${(driverMetrics.quests.ridesCompleted / driverMetrics.quests.targetRides) * 100}%`, height: '100%', backgroundColor: RAPIDO_YELLOW }} />
              </View>
              <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600', textAlign: 'center' }}>
                {driverMetrics.quests.targetRides - driverMetrics.quests.ridesCompleted} rides left to earn bonus
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Documents */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('/documents')}>
          <View style={[styles.cardIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="document-text" size={24} color="#3B82F6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Documents</Text>
            <Text style={styles.cardText}>Manage your DL, RC, Insurance, and Aadhar details.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Safety Toolkit */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('/safety')}>
          <View style={[styles.cardIconBox, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="shield-checkmark" size={24} color="#EF4444" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Safety Toolkit</Text>
            <Text style={styles.cardText}>Emergency contacts, live tracking, and support center.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 100, // For BottomNav
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF9E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
