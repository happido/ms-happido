import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VoiceSearchModalProps {
  visible: boolean;
  spokenText: string;
  onClose: () => void;
}

export function VoiceSearchModal({ visible, spokenText, onClose }: VoiceSearchModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(234, 88, 12, 0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(234, 88, 12, 0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#EA580C', justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#EA580C', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.5, shadowRadius: 10 }}>
              <MaterialCommunityIcons name="microphone" size={40} color="#FFF" />
            </View>
          </View>
        </View>
        <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '800', marginTop: 32 }}>Listening...</Text>
        <Text style={{ color: '#CBD5E1', fontSize: 16, marginTop: 8 }}>{spokenText || "Say something like 'Biryani'"}</Text>
        <TouchableOpacity onPress={onClose} style={{ marginTop: 40, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24 }}>
          <Text style={{ color: '#FFF', fontWeight: '600' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
