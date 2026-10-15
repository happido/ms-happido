import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PartnerConductModal from '../PartnerConductModal';
import api from '../../utils/api';

interface Props {
  restaurantName: string;
  restaurantImageUrl?: string;
  fssaiNumber?: string;
  address?: string;
  coordinates?: number[];
  soundAlerts: boolean;
  onToggleSound: (val: boolean) => void;
  operations: any;
  onUpdateOperation: (key: string, value: any) => void;
  onLogout: () => void;
  onLogoUpdate: () => void;
  onUpdateLocation: (address: string, coords: number[]) => void;
  showAlert: (title: string, message: string, animationType?: 'success' | 'lock' | 'warning') => void;
}

import * as Location from 'expo-location';

export default function SettingsTab({
  restaurantName,
  fssaiNumber,
  address,
  coordinates,
  soundAlerts,
  onToggleSound,
  operations,
  onUpdateOperation,
  onLogout,
  onLogoUpdate,
  onUpdateLocation,
  showAlert,
  restaurantImageUrl,
}: Props & { restaurantImageUrl?: string }) {
  const [isConductModalOpen, setIsConductModalOpen] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [openTimeInput, setOpenTimeInput] = useState(operations?.operatingHours?.openTime || '10:00 AM');
  const [closeTimeInput, setCloseTimeInput] = useState(operations?.operatingHours?.closeTime || '10:00 PM');
  const [daysOffInput, setDaysOffInput] = useState<string[]>(operations?.operatingHours?.daysOff || []);

  const handleSaveHours = () => {
    onUpdateOperation('operatingHours', { openTime: openTimeInput, closeTime: closeTimeInput, daysOff: daysOffInput });
    setIsEditingHours(false);
    showAlert('Success', 'Operating hours updated successfully.', 'success');
  };

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const toggleDayOff = (day: string) => {
    if (daysOffInput.includes(day)) {
      setDaysOffInput(daysOffInput.filter(d => d !== day));
    } else {
      setDaysOffInput([...daysOffInput, day]);
    }
  };

  const getDaysDisplay = () => {
    const daysOff = operations?.operatingHours?.daysOff || [];
    if (daysOff.length === 0) return 'All 7 Days (Mon - Sun)';
    if (daysOff.length === 7) return 'Temporarily Closed';
    
    // Simplistic string join
    const workingDays = DAYS_OF_WEEK.filter(d => !daysOff.includes(d)).map(d => d.slice(0, 3));
    return workingDays.join(', ');
  };

  const handleUpdateLocation = async () => {
    try {
      setIsFetchingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'Please enable location services to update your restaurant address.', 'warning');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      
      let addressStr = '';
      
      try {
        // Advanced Mappls Reverse Geocoding
        const clientId = '96dHZVzsAusvwIFXX3lgtLkUZwZqm1yrXmhf809zwysZVa4IkXexuiyZ9R0dSTJuoSeKYrNl_Z-EyavSjKcHNQ==';
        const clientSecret = 'lrFxI-iSEg-FZMC_R-F-kYzDjpVlc4Cgpr9JgPZmObCltlO-xVS-PyUZ8WLAR5zgBjYnFnqxcQjXeAvdHAlATCJR9YTRU8gE';
        
        const tokenRes = await api.post('/mappls/token', { clientId, clientSecret });
        if (tokenRes.data?.access_token) {
          const revRes = await fetch(`https://apis.mappls.com/advancedmaps/v1/${tokenRes.data.access_token}/rev_geocode?lat=${latitude}&lng=${longitude}`);
          const revData = await revRes.json();
          if (revData?.results?.[0]?.formatted_address) {
            addressStr = revData.results[0].formatted_address;
          }
        }
      } catch (e) {
        console.warn('Mappls reverse geocode failed', e);
      }
      
      // Fallback to Expo Native reverse geocoding if Mappls fails
      if (!addressStr || addressStr === '') {
        try {
          const geoAddress = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (geoAddress.length > 0) {
            const p = geoAddress[0];
            const parts = [p.name || p.street, p.city || p.district, p.region].filter(Boolean);
            addressStr = parts.join(', ');
          } 
        } catch (e) {
          console.warn('Expo reverse geocode failed', e);
        }
      }
      
      if (!addressStr || addressStr === '') {
        // Ultimate Fallback for Web/Simulator
        addressStr = 'Kadapa, Andhra Pradesh';
      }

      onUpdateLocation(addressStr, [longitude, latitude]);
    } catch (error: any) {
      showAlert('Error', 'Failed to fetch location: ' + error.message, 'warning');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  return (
    <>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Restaurant Profile Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity style={styles.profileAvatar} onPress={onLogoUpdate}>
          {restaurantImageUrl ? (
            <React.Fragment>
              <View style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: 'hidden' }]}>
                <Image source={{ uri: restaurantImageUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
              </View>
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={10} color="#FFFFFF" />
              </View>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Ionicons name="restaurant" size={24} color="#EA580C" />
              <View style={styles.avatarEditBadge}>
                <Ionicons name="add" size={10} color="#FFFFFF" />
              </View>
            </React.Fragment>
          )}
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.profileTitle}>{restaurantName}</Text>
          <Text style={styles.profileSubtitle}>FSSAI Lic: {fssaiNumber || 'Pending'} • Active Partner</Text>
          <Text style={styles.profileAddress}>{address || 'Location Not Set'}</Text>
          <TouchableOpacity 
            style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' }}
            onPress={handleUpdateLocation}
            disabled={isFetchingLocation}
          >
            <Ionicons name="location" size={14} color="#D97706" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: '#D97706', fontWeight: 'bold' }}>
              {isFetchingLocation ? 'Locating...' : 'Update Map Location'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          onPress={() => showAlert(
            'Profile Locked 🔒', 
            'Your registered Business Name and FSSAI License are legally bound to this account and cannot be edited directly. To request a change in legal entity, please contact Partner Support.',
            'lock'
          )}
          style={{ padding: 4 }}
        >
          <Ionicons name="pencil-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Operational Timings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ backgroundColor: '#FFF7ED', padding: 6, borderRadius: 10 }}>
              <Ionicons name="time-outline" size={20} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>Kitchen Operating Hours</Text>
          </View>
          <TouchableOpacity onPress={() => setIsEditingHours(!isEditingHours)} style={{ padding: 4 }}>
            <Ionicons name={isEditingHours ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={styles.timingRow}>
          <Text style={styles.timingDays}>{getDaysDisplay()}</Text>
          <Text style={styles.timingHours}>{operations?.operatingHours?.openTime || '10:00 AM'} – {operations?.operatingHours?.closeTime || '10:00 PM'}</Text>
        </View>
        
        {isEditingHours && (
          <View style={styles.editHoursContainer}>
            <Text style={styles.inputLabel}>Closed On (Holidays)</Text>
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map(day => {
                const isOff = daysOffInput.includes(day);
                return (
                  <TouchableOpacity 
                    key={day} 
                    style={[styles.dayBtn, isOff && styles.dayBtnActive]}
                    onPress={() => toggleDayOff(day)}
                  >
                    <Text style={[styles.dayBtnText, isOff && styles.dayBtnTextActive]}>{day.slice(0, 3)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Opening Time</Text>
                <TextInput 
                  style={styles.timeInput}
                  value={openTimeInput}
                  onChangeText={setOpenTimeInput}
                  placeholder="e.g. 10:00 AM"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Closing Time</Text>
                <TextInput 
                  style={styles.timeInput}
                  value={closeTimeInput}
                  onChangeText={setCloseTimeInput}
                  placeholder="e.g. 11:30 PM"
                />
              </View>
            </View>
            <TouchableOpacity style={styles.saveHoursBtn} onPress={handleSaveHours}>
              <Text style={styles.saveHoursText}>Save Hours</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Kitchen Prep Buffer Defaults */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ backgroundColor: '#FFF7ED', padding: 6, borderRadius: 10 }}>
              <Ionicons name="speedometer-outline" size={20} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>Default Kitchen Prep Buffer</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>Standard time allowed to prepare and package a customer order:</Text>
        <View style={styles.prepTimeRow}>
          {[15, 20, 30, 45].map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[styles.prepTimeBtn, operations?.defaultPrepTime === mins && styles.prepTimeBtnActive]}
              onPress={() => onUpdateOperation('defaultPrepTime', mins)}
            >
              <Text style={[styles.prepTimeText, operations?.defaultPrepTime === mins && styles.prepTimeTextActive]}>
                {mins} Mins
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Kitchen Audio & Orders Automation */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ backgroundColor: '#FFF7ED', padding: 6, borderRadius: 10 }}>
              <Ionicons name="options-outline" size={20} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>Kitchen Automation & Preferences</Text>
          </View>
        </View>

        {/* Live Switch */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Online & Accepting Orders</Text>
            <Text style={styles.switchSub}>Visible to customers on the Happido app</Text>
          </View>
          <Switch
            value={operations?.isOnline || false}
            onValueChange={(val) => onUpdateOperation('isOnline', val)}
            trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
            thumbColor={operations?.isOnline ? '#059669' : '#9CA3AF'}
          />
        </View>

        {/* Loud Audio Chime */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Loud Order Audio Chime</Text>
            <Text style={styles.switchSub}>Continuous ringtone until order is accepted</Text>
          </View>
          <Switch
            value={soundAlerts}
            onValueChange={onToggleSound}
            trackColor={{ false: '#D1D5DB', true: '#FED7AA' }}
            thumbColor={soundAlerts ? '#EA580C' : '#9CA3AF'}
          />
        </View>

        {/* Auto-Accept */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Auto-Accept Orders</Text>
            <Text style={styles.switchSub}>Instantly assign standard prep time without manual tapping</Text>
          </View>
          <Switch
            value={operations?.autoAcceptOrders || false}
            onValueChange={(val) => onUpdateOperation('autoAcceptOrders', val)}
            trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
            thumbColor={operations?.autoAcceptOrders ? '#059669' : '#9CA3AF'}
          />
        </View>

        {/* Pure Veg Only */}
        <View style={[styles.switchRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Pure Vegetarian Outlet Only</Text>
            <Text style={styles.switchSub}>Display Pure Veg green banner in customer app</Text>
          </View>
          <Switch
            value={operations?.isPureVeg || false}
            onValueChange={(val) => onUpdateOperation('isPureVeg', val)}
            trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
            thumbColor={operations?.isPureVeg ? '#059669' : '#9CA3AF'}
          />
        </View>
      </View>

      {/* Partner Support & Help */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ backgroundColor: '#FFF7ED', padding: 6, borderRadius: 10 }}>
              <Ionicons name="headset-outline" size={20} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>Happido Partner Support</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.supportActionRow}
          onPress={() => showAlert('Happido Partner Desk', 'Direct line: +91 1800 427 7436\nWhatsApp Support: Available 24/7')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="logo-whatsapp" size={18} color="#059669" />
            <Text style={styles.supportText}>24/7 WhatsApp Partner Desk</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportActionRow}
          onPress={() => setIsConductModalOpen(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="document-text-outline" size={18} color="#2563EB" />
            <Text style={styles.supportText}>Hygiene & Packaging Guidelines</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.logoutText}>Logout of Restaurant Account</Text>
      </TouchableOpacity>
    </ScrollView>

    <PartnerConductModal 
      visible={isConductModalOpen} 
      onClose={() => setIsConductModalOpen(false)} 
    />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#EA580C',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  profileAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  timingDays: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  timingHours: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  prepTimeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prepTimeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  prepTimeBtnActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  prepTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  prepTimeTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  switchSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  supportActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  supportText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  editHoursContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
  },
  timeInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  saveHoursBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveHoursText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  dayBtnActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  dayBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  dayBtnTextActive: {
    color: '#DC2626',
    fontWeight: '800',
  },
});
