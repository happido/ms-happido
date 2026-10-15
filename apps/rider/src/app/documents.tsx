import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
  Platform, Image, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BottomNav from '../components/BottomNav';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const RAPIDO_YELLOW = '#F9C935';
const RAPIDO_BLACK = '#1C1C1C';

type DocStatus = 'completed' | 'pending' | 'optional';

interface DocumentItem {
  id: string;
  label: string;
  status: DocStatus;
  imageUri?: string;
  required: boolean;
  apiVerified?: boolean;
}

export default function DocumentsScreen() {
  const router = useRouter();
  const [vehicleName, setVehicleName] = useState('Honda Shine 125');
  const [vehiclePlate, setVehiclePlate] = useState('AP40ER9433');

  const [riderDocs, setRiderDocs] = useState<DocumentItem[]>([
    { id: 'profile', label: 'Profile Picture (Selfie with ID)', status: 'completed', required: true },
    { id: 'dl_front', label: 'Driving License', status: 'completed', required: true },
    { id: 'dl_back', label: 'Driving License - Back', status: 'optional', required: false },
    { id: 'aadhar', label: 'Aadhaar Card', status: 'completed', required: true, apiVerified: true },
    { id: 'aadhar_back', label: 'Aadhaar Card - Back', status: 'optional', required: false },
    { id: 'pan', label: 'PAN Card', status: 'completed', required: true, apiVerified: true },
    { id: 'bank', label: 'Bank Passbook / Cheque', status: 'optional', required: false },
    { id: 'eshram', label: 'E-Shram Universal Account Number (UAN)', status: 'optional', required: false },
  ]);

  const [vehicleDocs, setVehicleDocs] = useState<DocumentItem[]>([
    { id: 'rc_front', label: 'Registration Certificate (RC)', status: 'completed', required: true },
    { id: 'rc_back', label: 'Registration Certificate (RC) - Back', status: 'optional', required: false },
    { id: 'insurance', label: 'Vehicle Insurance', status: 'optional', required: false },
  ]);

  useEffect(() => {
    const loadVehicleInfo = async () => {
      const name = await AsyncStorage.getItem('vehicleName');
      const plate = await AsyncStorage.getItem('vehiclePlate');
      if (name) setVehicleName(name);
      if (plate) setVehiclePlate(plate);
    };
    loadVehicleInfo();
  }, []);

  const handleDocTap = (doc: DocumentItem, isVehicle: boolean) => {
    if (doc.status === 'completed') {
      Alert.alert(doc.label, doc.apiVerified ? '✅ This document was verified via DigiLocker API.' : '📄 This document has been uploaded and is under review.');
    } else {
      Alert.alert(
        `Upload ${doc.label}`,
        'Choose how you want to upload this document.',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') { Alert.alert('Permission Denied'); return; }
              const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
              if (!result.canceled) {
                updateDocStatus(doc.id, isVehicle, result.assets[0].uri);
              }
            }
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
              if (!result.canceled) {
                updateDocStatus(doc.id, isVehicle, result.assets[0].uri);
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const updateDocStatus = (docId: string, isVehicle: boolean, uri: string) => {
    const setter = isVehicle ? setVehicleDocs : setRiderDocs;
    setter(prev => prev.map(d => d.id === docId ? { ...d, status: 'completed' as DocStatus, imageUri: uri } : d));
    Alert.alert('✅ Uploaded', 'Document uploaded successfully!');
  };

  const renderDocRow = (doc: DocumentItem, index: number, isVehicle: boolean) => (
    <Animated.View key={doc.id} entering={FadeInDown.delay(index * 60).springify()}>
      <TouchableOpacity style={styles.docRow} onPress={() => handleDocTap(doc, isVehicle)} activeOpacity={0.6}>
        <View style={{ flex: 1 }}>
          <Text style={styles.docLabel}>{doc.label}</Text>
          <Text style={[
            styles.docStatus,
            doc.status === 'completed' ? styles.statusCompleted : styles.statusOptional
          ]}>
            {doc.status === 'completed' ? (doc.apiVerified ? 'API Verified' : 'Completed') : 'Optional'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Happido</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Rides Section */}
        <Text style={styles.sectionTitle}>Rides</Text>
        {riderDocs.map((doc, i) => renderDocRow(doc, i, false))}

        {/* Vehicle Section */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.vehicleCard}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="bicycle" size={36} color={RAPIDO_BLACK} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleName}>{vehicleName}</Text>
            <Text style={styles.vehiclePlate}>{vehiclePlate}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="remove-circle-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </Animated.View>

        {vehicleDocs.map((doc, i) => renderDocRow(doc, i, true))}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  helpBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  helpText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },

  sectionTitle: {
    fontSize: 28, fontWeight: '800', color: '#0F172A',
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12,
  },

  docRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  docLabel: { fontSize: 16, fontWeight: '500', color: '#0F172A', marginBottom: 4 },
  docStatus: { fontSize: 14, fontWeight: '500' },
  statusCompleted: { color: '#059669' },
  statusOptional: { color: '#94A3B8' },

  vehicleCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 20,
    marginTop: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  vehicleIcon: {
    width: 56, height: 56, borderRadius: 12, backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  vehicleName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  vehiclePlate: { fontSize: 14, color: '#64748B', fontWeight: '500', marginTop: 2 },
});
