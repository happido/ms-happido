import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
  Platform, TextInput, Alert, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import BottomNav from '../components/BottomNav';


const RAPIDO_BLACK = '#1C1C1C';

interface HelpCategory {
  id: string;
  icon: string;
  label: string;
  color: string;
}

const HELP_CATEGORIES_ROW1: HelpCategory[] = [
  { id: 'trips', icon: 'car', label: 'Trips', color: '#3B82F6' },
  { id: 'account', icon: 'person', label: 'Account & App', color: '#3B82F6' },
  { id: 'earnings', icon: 'wallet', label: 'Earnings', color: '#3B82F6' },
  { id: 'guides', icon: 'book', label: 'Guides', color: '#3B82F6' },
];

const HELP_CATEGORIES_ROW2: HelpCategory[] = [
  { id: 'delivery', icon: 'cube', label: 'Item delivery', color: '#3B82F6' },
  { id: 'safety', icon: 'shield-checkmark', label: 'Safety', color: '#3B82F6' },
  { id: 'appointment', icon: 'calendar', label: 'Appointment', color: '#3B82F6' },
  { id: 'accessibility', icon: 'accessibility', label: 'Accessibility', color: '#3B82F6' },
];

const HELP_CATEGORIES_ROW3: HelpCategory[] = [
  { id: 'shuttle', icon: 'bus', label: 'Shuttle', color: '#3B82F6' },
  { id: 'privacy', icon: 'lock-closed', label: 'Privacy', color: '#3B82F6' },
  { id: 'diagnostics', icon: 'build', label: 'Diagnostics', color: '#3B82F6' },
  { id: 'map', icon: 'map', label: 'Map issues', color: '#3B82F6' },
];

const FAQ_ITEMS = [
  { q: 'How do I update my vehicle details?', a: 'Go to Documents → Vehicle section and tap on the item you want to update.' },
  { q: 'When will I receive my earnings?', a: 'Earnings are settled weekly. You can withdraw anytime from the Wallet screen.' },
  { q: 'How do I report a problem with a ride?', a: 'Go to Ride History, tap the ride, and select "Report Issue".' },
  { q: 'My account got deactivated, what do I do?', a: 'Contact our support team via the AI chat below or call the Safety Line.' },
  { q: 'How to change my bank account?', a: 'Go to Documents → Bank Passbook/Cheque and upload new bank details.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ from: 'user' | 'ai'; text: string }>>([
    { from: 'ai', text: 'Hi! I\'m Happido AI assistant. How can I help you today? You can ask me anything about your account, trips, or earnings.' }
  ]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCategoryTap = (cat: HelpCategory) => {
    const faqMatch = FAQ_ITEMS.find(f => 
      f.q.toLowerCase().includes(cat.label.toLowerCase()) || 
      f.a.toLowerCase().includes(cat.label.toLowerCase())
    );
    
    setShowChat(true);
    if (faqMatch) {
      setChatMessages([
        { from: 'user', text: `I need help with ${cat.label}` },
        { from: 'ai', text: `${faqMatch.a}\n\nDo you need any further assistance with this?` }
      ]);
    } else {
      setChatMessages([
        { from: 'ai', text: `Hi! I see you need help with ${cat.label}. How can I assist you with that today?` }
      ]);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setChatInput('');

    // Simple AI response simulation
    setTimeout(() => {
      const lowerMsg = userMsg.toLowerCase();
      let response = '';
      
      if (lowerMsg.includes('earn') || lowerMsg.includes('money') || lowerMsg.includes('payment')) {
        response = 'Your earnings are calculated based on trip distance, surge pricing, and incentives. You can withdraw from the Wallet screen anytime. Settlements are processed within 24 hours.';
      } else if (lowerMsg.includes('account') || lowerMsg.includes('profile')) {
        response = 'You can manage your account from the Documents screen. Update your profile picture, driving license, and other documents anytime.';
      } else if (lowerMsg.includes('trip') || lowerMsg.includes('ride')) {
        response = 'For trip-related issues, please go to your Ride History screen and tap on the specific ride to report a problem or view details.';
      } else if (lowerMsg.includes('insurance') || lowerMsg.includes('accident') || lowerMsg.includes('crash')) {
        response = '⚠️ If you have been in an accident, please use the Safety screen to report a crash immediately. Our safety team will contact you within 30 minutes.';
      } else {
        response = `Thank you for your question about "${userMsg}". I've forwarded this to our human support team. You should receive a response within 2-4 hours. Reference ID: HPD-${Date.now().toString().slice(-6)}`;
      }
      
      setChatMessages(prev => [...prev, { from: 'ai', text: response }]);
    }, 1200);
  };

  const renderCategoryRow = (categories: HelpCategory[], delay: number) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.categoryRow}>
      {categories.map(cat => (
        <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => handleCategoryTap(cat)} activeOpacity={0.7}>
          <View style={styles.categoryIcon}>
            <Ionicons name={cat.icon as any} size={24} color={cat.color} />
          </View>
          <Text style={styles.categoryLabel} numberOfLines={2}>{cat.label}</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inboxBtn}>
          <Ionicons name="mail-outline" size={18} color="#0F172A" style={{ marginRight: 6 }} />
          <Text style={styles.inboxText}>Inbox</Text>
        </TouchableOpacity>
      </View>

      {showChat ? (
        /* AI Chat View */
        <View style={{ flex: 1 }}>
          <Animated.View entering={FadeInUp.duration(300)} style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>Happido AI Support</Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI Beta</Text>
            </View>
          </Animated.View>

          <ScrollView style={styles.chatBody} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
            {chatMessages.map((msg, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(i * 100).springify()} style={[styles.chatBubble, msg.from === 'user' ? styles.userBubble : styles.aiBubble]}>
                {msg.from === 'ai' && <Ionicons name="chatbox" size={16} color="#3B82F6" style={{ marginRight: 8 }} />}
                <Text style={[styles.chatText, msg.from === 'user' && { color: '#FFF' }]}>{msg.text}</Text>
              </Animated.View>
            ))}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type your question..."
              placeholderTextColor="#94A3B8"
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={sendChatMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendChatMessage}>
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Category Grid View */
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>All categories</Text>

          {renderCategoryRow(HELP_CATEGORIES_ROW1, 100)}
          {renderCategoryRow(HELP_CATEGORIES_ROW2, 200)}
          {renderCategoryRow(HELP_CATEGORIES_ROW3, 300)}

          {/* FAQ Section */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked</Text>
            {FAQ_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={styles.faqRow} onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  {expandedFaq === i && <Text style={styles.faqAnswer}>{item.a}</Text>}
                </View>
                <Ionicons name={expandedFaq === i ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Contact Us */}
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.contactSection}>
            <Text style={styles.contactTitle}>Can't find what you're looking for?</Text>
            <TouchableOpacity style={styles.contactRow} onPress={() => setShowChat(true)} activeOpacity={0.7}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#0F172A" style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>Contact us</Text>
                <Text style={styles.contactDesc}>Powered by AI <Text style={{ color: '#3B82F6', fontWeight: '700' }}>Beta</Text></Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  inboxBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  inboxText: { fontSize: 14, fontWeight: '600', color: '#0F172A' },

  sectionTitle: {
    fontSize: 24, fontWeight: '800', color: '#0F172A',
    paddingHorizontal: 20, paddingBottom: 20,
  },

  categoryRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20 },
  categoryItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  categoryIcon: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: '#0F172A', textAlign: 'center' },

  faqSection: { paddingHorizontal: 20, marginTop: 12 },
  faqTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  faqRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  faqAnswer: { fontSize: 14, color: '#64748B', marginTop: 8, lineHeight: 20 },

  contactSection: { paddingHorizontal: 20, marginTop: 32 },
  contactTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  contactLabel: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  contactDesc: { fontSize: 14, color: '#64748B', marginTop: 2 },

  // AI Chat styles
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12,
  },
  chatTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  aiBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  aiBadgeText: { fontSize: 12, fontWeight: '700', color: '#3B82F6' },

  chatBody: { flex: 1, backgroundColor: '#F8FAFC' },
  chatBubble: {
    maxWidth: '85%', padding: 14, borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'flex-start',
  },
  userBubble: { backgroundColor: RAPIDO_BLACK, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#FFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  chatText: { fontSize: 15, color: '#0F172A', lineHeight: 22, flex: 1 },

  chatInputContainer: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFF',
  },
  chatInput: {
    flex: 1, backgroundColor: '#F1F5F9', borderRadius: 24, paddingHorizontal: 20,
    paddingVertical: 12, fontSize: 15, color: '#0F172A', marginRight: 8,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: RAPIDO_BLACK,
    alignItems: 'center', justifyContent: 'center',
  },
});
