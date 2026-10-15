import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '../components/BottomNav';

const RAPIDO_YELLOW = '#F9C935';
const RAPIDO_BLACK = '#1C1C1C';

// Translations
const T = {
  en: {
    headerTitle: "Rate Card & Earnings",
    headerSub: "Transparent pricing for Kadapa drivers",
    moto: "Moto (Bike)",
    auto: "Auto",
    car: "Car (Mini)",
    minFare: "Minimum Fare",
    baseFare: "Base Fare (first 1.5 km)",
    perKm: "Per Km Rate (after 1.5 km)",
    perMin: "Per Minute Rate",
    dynamicAdj: "Dynamic Adjustments",
    nightSurge: "Night Surge (10 PM - 5 AM)",
    nightSurgeDesc: "1.25x - 1.5x multiplier on base fares to reward late night driving.",
    weatherSurge: "Weather Surge (Rain)",
    weatherSurgeDesc: "1.5x multiplier applied automatically when local weather reports rain.",
    platformFees: "Hybrid Commission Model",
    commTitle: "Bikes & Autos:",
    commDesc: " 0% Commission! Just activate your Daily Pass for ₹30/day to unlock unlimited rides.",
    platTitle: "Cars (Mini/Prime):",
    platDesc: " Standard 15% - 25% commission is deducted per ride based on your driver tier.",
    gstTitle: "GST (5%):",
    gstDesc: " Mandated by the government.",
    waitTitle: "Waiting Charges:",
    waitDesc: " You earn ₹1.50/min if you wait more than 3 minutes at pickup location.",
    langBtn: "తెలుగు",
  },
  te: {
    headerTitle: "ధరల పట్టిక & సంపాదన",
    headerSub: "కడప డ్రైవర్లకు పారదర్శక ధరలు",
    moto: "మోటో (బైక్)",
    auto: "ఆటో",
    car: "కారు (మినీ)",
    minFare: "కనీస ఛార్జీ",
    baseFare: "బేస్ ఛార్జీ (మొదటి 1.5 కి.మీ)",
    perKm: "కిలోమీటరుకు ఛార్జీ",
    perMin: "నిమిషానికి ఛార్జీ",
    dynamicAdj: "అదనపు ఛార్జీలు (సర్జ్)",
    nightSurge: "రాత్రి సర్జ్ (10 PM - 5 AM)",
    nightSurgeDesc: "రాత్రి వేళల్లో డ్రైవింగ్ చేసినందుకు బేస్ ఛార్జీలపై 1.25x - 1.5x వరకు అదనపు రాబడి.",
    weatherSurge: "వాతావరణ సర్జ్ (వర్షం)",
    weatherSurgeDesc: "వర్షం పడినప్పుడు ఆటోమేటిక్‌గా 1.5x అదనపు ఛార్జీ వర్తిస్తుంది.",
    platformFees: "హైబ్రిడ్ కమీషన్ మోడల్",
    commTitle: "బైక్‌లు & ఆటోలు:",
    commDesc: " 0% కమీషన్! రోజుకు కేవలం ₹30 చెల్లించి అపరిమిత రైడ్‌లను పొందండి.",
    platTitle: "కార్లు (మినీ/ప్రైమ్):",
    platDesc: " మీ రేటింగ్‌ను బట్టి కార్ల రైడ్‌ల నుండి 15% - 25% కమీషన్ తీసుకోబడుతుంది.",
    gstTitle: "జీఎస్టీ (GST 5%):",
    gstDesc: " ప్రభుత్వ నిబంధనల ప్రకారం.",
    waitTitle: "వెయిటింగ్ ఛార్జీలు:",
    waitDesc: " పికప్ వద్ద 3 నిమిషాల కంటే ఎక్కువ వేచి ఉంటే నిమిషానికి ₹1.50 వస్తుంది.",
    langBtn: "English",
  }
};

export default function PricesScreen() {
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const t = T[lang];
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t.headerTitle}</Text>
            <Text style={styles.headerSub}>{t.headerSub}</Text>
          </View>
          <TouchableOpacity 
            style={styles.langBtn} 
            onPress={() => setLang(lang === 'en' ? 'te' : 'en')}
          >
            <Ionicons name="language" size={16} color={RAPIDO_BLACK} style={{marginRight: 6}} />
            <Text style={styles.langBtnText}>{t.langBtn}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Moto Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bicycle" size={24} color={RAPIDO_BLACK} />
            <Text style={styles.cardTitle}>{t.moto}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.minFare}</Text>
            <Text style={styles.value}>₹20</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.baseFare}</Text>
            <Text style={styles.value}>₹15</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.perKm}</Text>
            <Text style={styles.value}>₹5.00 / km</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.perMin}</Text>
            <Text style={styles.value}>₹1.00 / min</Text>
          </View>
        </View>

        {/* Auto Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="car-outline" size={24} color={RAPIDO_BLACK} />
            <Text style={styles.cardTitle}>{t.auto}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.minFare}</Text>
            <Text style={styles.value}>₹35</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.baseFare}</Text>
            <Text style={styles.value}>₹30</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.perKm}</Text>
            <Text style={styles.value}>₹10.00 / km</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.perMin}</Text>
            <Text style={styles.value}>₹1.00 / min</Text>
          </View>
        </View>

        {/* Car Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="car-sport" size={24} color={RAPIDO_BLACK} />
            <Text style={styles.cardTitle}>{t.car}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.minFare}</Text>
            <Text style={styles.value}>₹60</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.baseFare}</Text>
            <Text style={styles.value}>₹50</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.perKm}</Text>
            <Text style={styles.value}>₹14.00 / km</Text>
          </View>
        </View>

        {/* Dynamic Adjustments */}
        <Text style={styles.sectionTitle}>{t.dynamicAdj}</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="moon" size={22} color="#4F46E5" style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoTitle}>{t.nightSurge}</Text>
              <Text style={styles.infoDesc}>{t.nightSurgeDesc}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { marginTop: 20 }]}>
            <Ionicons name="rainy" size={22} color="#0284C7" style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoTitle}>{t.weatherSurge}</Text>
              <Text style={styles.infoDesc}>{t.weatherSurgeDesc}</Text>
            </View>
          </View>
        </View>

        {/* Deductions & Revenue */}
        <Text style={styles.sectionTitle}>{t.platformFees}</Text>
        <View style={styles.noteCard}>
          <View style={styles.noteItem}>
            <Ionicons name="checkmark-circle" size={16} color="#B45309" style={{ marginTop: 3 }} />
            <Text style={styles.noteText}>
              <Text style={{fontWeight:'800'}}>{t.commTitle}</Text>{t.commDesc}
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Ionicons name="checkmark-circle" size={16} color="#B45309" style={{ marginTop: 3 }} />
            <Text style={styles.noteText}>
              <Text style={{fontWeight:'800'}}>{t.platTitle}</Text>{t.platDesc}
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Ionicons name="checkmark-circle" size={16} color="#B45309" style={{ marginTop: 3 }} />
            <Text style={styles.noteText}>
              <Text style={{fontWeight:'800'}}>{t.gstTitle}</Text>{t.gstDesc}
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Ionicons name="checkmark-circle" size={16} color="#B45309" style={{ marginTop: 3 }} />
            <Text style={styles.noteText}>
              <Text style={{fontWeight:'800'}}>{t.waitTitle}</Text>{t.waitDesc}
            </Text>
          </View>
        </View>

      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, paddingTop: 40, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: RAPIDO_BLACK, marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  
  langBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 4 },
  langBtnText: { fontSize: 13, fontWeight: '800', color: RAPIDO_BLACK },
  
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 16, marginBottom: 12, marginLeft: 4 },
  
  card: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, 
    borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, elevation: 2 
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cardTitle: { fontSize: 20, fontWeight: '900', color: RAPIDO_BLACK, marginLeft: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  value: { fontSize: 15, fontWeight: '800', color: RAPIDO_BLACK },
  
  infoCard: { backgroundColor: '#EEF2FF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#C7D2FE' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoTitle: { fontSize: 15, fontWeight: '800', color: '#3730A3', marginBottom: 6 },
  infoDesc: { fontSize: 13, color: '#4F46E5', lineHeight: 22, fontWeight: '500' },
  
  noteCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#FDE68A' },
  noteItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  noteText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 22, marginLeft: 10, fontWeight: '500' },
});
