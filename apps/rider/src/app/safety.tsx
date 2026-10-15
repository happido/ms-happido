import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
  Platform, TextInput, Alert, Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import BottomNav from '../components/BottomNav';


const RAPIDO_BLACK = '#1C1C1C';

interface SafetyAction {
  id: string;
  icon: string;
  iconColor: string;
  label: string;
  description: string;
  badge?: string;
  onPress: () => void;
}

export default function SafetyScreen() {
  const router = useRouter();
  const [showCrashForm, setShowCrashForm] = useState(false);
  const [crashDescription, setCrashDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergency Assistance',
      'This will contact emergency services (112). Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 112', style: 'destructive', onPress: () => Linking.openURL('tel:112') }
      ]
    );
  };

  const handleSafetyLine = () => {
    Alert.alert(
      '📞 Happido Safety Line',
      'Connect with our 24/7 safety support team.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL('tel:+911800123456') }
      ]
    );
  };

  const handleRecordTrip = () => {
    setIsRecording(!isRecording);
    Alert.alert(
      isRecording ? '⏹ Recording Stopped' : '📹 Recording Started',
      isRecording
        ? 'Trip recording has been stopped and saved locally.'
        : 'Your trip is now being recorded via your phone camera. This recording will be saved locally for your safety.'
    );
  };

  const handleCrashReport = () => {
    setShowCrashForm(true);
  };

  const submitCrashReport = () => {
    if (!crashDescription.trim()) {
      Alert.alert('Required', 'Please describe what happened.');
      return;
    }
    Alert.alert('✅ Report Submitted', 'Your crash report has been sent to the Happido safety team. We will contact you shortly.');
    setCrashDescription('');
    setShowCrashForm(false);
  };

  const handleFollowTrip = () => {
    Alert.alert(
      '📍 Follow My Trip',
      'A shareable link has been generated. Share this with your family or friends so they can track your live location during the trip.',
      [
        { text: 'Copy Link', onPress: () => Alert.alert('Copied!', 'https://happido.app/track/LIVE-xyz123') },
        { text: 'Share via WhatsApp', onPress: () => Linking.openURL('whatsapp://send?text=Track my Happido ride live: https://happido.app/track/LIVE-xyz123') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleProofOfTrip = () => {
    Alert.alert(
      '📋 Proof of Trip Status',
      'Show this screen to law enforcement to verify your active trip status.\n\nRider ID: HPD-R-42981\nStatus: Active Trip\nRoute: Ameerpet → Gachibowli\nTimestamp: ' + new Date().toLocaleString()
    );
  };

  const safetyActions: SafetyAction[] = [
    { id: 'emergency', icon: 'warning', iconColor: '#DC2626', label: 'Emergency assistance', description: 'Contact emergency services.', onPress: handleEmergency },
    { id: 'safety_line', icon: 'call', iconColor: '#0F172A', label: "Call Happido's Safety Line", description: 'Get non-emergency safety help.', onPress: handleSafetyLine },
    { id: 'record', icon: 'videocam', iconColor: '#0F172A', label: 'Record my trip', description: 'Record your trips with your phone.', badge: isRecording ? 'Recording' : 'Set up', onPress: handleRecordTrip },
    { id: 'crash', icon: 'alert-circle', iconColor: '#0F172A', label: 'Report a crash', description: 'Send us details if you are involved in a crash.', onPress: handleCrashReport },
    { id: 'proof', icon: 'document-text', iconColor: '#0F172A', label: 'Proof of trip status', description: 'Show law enforcement your status.', onPress: handleProofOfTrip },
    { id: 'follow', icon: 'navigate', iconColor: '#0F172A', label: 'Follow my trip', description: 'Share your location and trip status.', onPress: handleFollowTrip },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="arrow-back" size={28} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.titleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.title}>Need help?</Text>
            <Ionicons name="information-circle-outline" size={22} color="#94A3B8" />
          </View>
          <Text style={styles.subtitle}>It seems your trip ended away from your destination.</Text>
        </Animated.View>

        {/* Safety Actions */}
        {safetyActions.map((action, index) => (
          <Animated.View key={action.id} entering={FadeInDown.delay(index * 80).springify()}>
            <TouchableOpacity style={styles.actionRow} onPress={action.onPress} activeOpacity={0.6}>
              <View style={[styles.actionIcon, action.id === 'emergency' && { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name={action.icon as any} size={22} color={action.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionDesc}>{action.description}</Text>
              </View>
              {action.badge && (
                <View style={[styles.badge, isRecording && action.id === 'record' && { backgroundColor: '#DC2626' }]}>
                  <Text style={[styles.badgeText, isRecording && action.id === 'record' && { color: '#FFF' }]}>{action.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Crash Report Form */}
        {showCrashForm && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.crashForm}>
            <Text style={styles.crashTitle}>Describe the incident</Text>
            <TextInput
              style={styles.crashInput}
              placeholder="What happened? Please provide as much detail as possible..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={crashDescription}
              onChangeText={setCrashDescription}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TouchableOpacity style={[styles.crashBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowCrashForm(false)}>
                <Text style={{ color: '#64748B', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.crashBtn, { backgroundColor: RAPIDO_BLACK, flex: 1 }]} onPress={submitCrashReport}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 8,
  },
  closeBtn: { width: 40, height: 40, justifyContent: 'center' },

  titleContainer: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8, lineHeight: 22 },

  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  actionLabel: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  actionDesc: { fontSize: 14, color: '#64748B' },

  badge: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginRight: 8,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#0F172A' },

  crashForm: {
    margin: 20, padding: 20, backgroundColor: '#F8FAFC', borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  crashTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  crashInput: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16,
    fontSize: 15, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0',
    minHeight: 120,
  },
  crashBtn: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    paddingHorizontal: 24,
  },
});
