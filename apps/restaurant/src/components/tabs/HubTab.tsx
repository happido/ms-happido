import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import PaymentsTab from './PaymentsTab';
import MarketingTab from './MarketingTab';
import SettingsTab from './SettingsTab';

interface Props {
  restaurantName: string;
  restaurantImageUrl?: string;
  fssaiNumber?: string;
  bankDetails?: { accountNumber: string; ifscCode: string };
  address?: string;
  coordinates?: number[];
  soundAlerts: boolean;
  onToggleSound: (val: boolean) => void;
  operations: any;
  onUpdateOperation: (key: string, value: any) => void;
  onLogout: () => void;
  onLogoUpdate: () => void;
  onUpdateLocation: (address: string, coords: number[]) => void;
  onOpenReviews: () => void;
  onOpenEODReport: () => void;
  showAlert: (title: string, message: string, animationType?: 'success' | 'lock' | 'warning') => void;
}

export default function HubTab({
  restaurantName,
  restaurantImageUrl,
  fssaiNumber,
  bankDetails,
  address,
  coordinates,
  soundAlerts,
  onToggleSound,
  operations,
  onUpdateOperation,
  onLogout,
  onLogoUpdate,
  onUpdateLocation,
  onOpenReviews,
  onOpenEODReport,
  showAlert,
}: Props) {
  const [subTab, setSubTab] = useState<'payouts' | 'growth' | 'settings'>('payouts');

  return (
    <View style={styles.container}>
      {/* Segmented Top Pill Switcher */}
      <View style={styles.segmentedBar}>
        <TouchableOpacity
          style={[styles.segmentBtn, subTab === 'payouts' && styles.segmentBtnActive]}
          onPress={() => setSubTab('payouts')}
        >
          <Ionicons
            name={subTab === 'payouts' ? 'wallet' : 'wallet-outline'}
            size={14}
            color={subTab === 'payouts' ? '#D4AF37' : '#64748B'}
          />
          <Text style={[styles.segmentText, subTab === 'payouts' && styles.segmentTextActive]}>
            Payouts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, subTab === 'growth' && styles.segmentBtnActive]}
          onPress={() => setSubTab('growth')}
        >
          <Ionicons
            name={subTab === 'growth' ? 'rocket' : 'rocket-outline'}
            size={14}
            color={subTab === 'growth' ? '#D4AF37' : '#64748B'}
          />
          <Text style={[styles.segmentText, subTab === 'growth' && styles.segmentTextActive]}>
            Growth & Ads
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, subTab === 'settings' && styles.segmentBtnActive]}
          onPress={() => setSubTab('settings')}
        >
          <Ionicons
            name={subTab === 'settings' ? 'settings' : 'settings-outline'}
            size={14}
            color={subTab === 'settings' ? '#D4AF37' : '#64748B'}
          />
          <Text style={[styles.segmentText, subTab === 'settings' && styles.segmentTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Access Floating Action Strip */}
      <View style={styles.quickStrip}>
        <TouchableOpacity style={styles.stripCard} onPress={onOpenEODReport}>
          <Ionicons name="document-text-outline" size={15} color="#2563EB" />
          <Text style={styles.stripText}>Daily EOD Z-Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stripCard} onPress={onOpenReviews}>
          <Ionicons name="star" size={15} color="#F59E0B" />
          <Text style={styles.stripText}>Reviews (4.8★)</Text>
        </TouchableOpacity>
      </View>

      {/* Sub View Body */}
      <View style={{ flex: 1 }}>
        {subTab === 'payouts' && <PaymentsTab restaurantName={restaurantName} bankDetails={bankDetails} showAlert={showAlert} />}
        {subTab === 'growth' && <MarketingTab />}
        {subTab === 'settings' && (
          <SettingsTab
            restaurantName={restaurantName}
            restaurantImageUrl={restaurantImageUrl}
            fssaiNumber={fssaiNumber}
            address={address}
            coordinates={coordinates}
            soundAlerts={soundAlerts}
            onToggleSound={onToggleSound}
            operations={operations}
            onUpdateOperation={onUpdateOperation}
            onLogout={onLogout}
            onLogoUpdate={onLogoUpdate}
            onUpdateLocation={onUpdateLocation}
            showAlert={showAlert}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentedBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    fontWeight: '800',
    color: '#D4AF37',
  },
  quickStrip: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  stripCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  stripText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
});
