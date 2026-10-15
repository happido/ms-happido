import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

export type CustomAlertConfig = {
  visible: boolean;
  title: string;
  message: string;
  type: 'confirm' | 'alert';
  confirmText?: string;
  cancelText?: string;
  lottieSource?: any;
  onConfirm: () => void;
  onCancel?: () => void;
};

interface CustomAlertModalProps {
  config: CustomAlertConfig | null;
}

export default function CustomAlertModal({ config }: CustomAlertModalProps) {
  if (!config || !config.visible) return null;

  return (
    <Modal transparent visible={config.visible} animationType="none" onRequestClose={config.onCancel}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.overlay}>
        <Animated.View entering={ZoomIn.duration(200).springify()} exiting={ZoomOut.duration(200)} style={styles.modalBox}>
          
          <View style={[styles.iconCircle, config.lottieSource && { backgroundColor: 'transparent', height: 160, width: 160, marginBottom: 0, marginTop: -10 }]}>
            {config.lottieSource ? (
              <LottieView source={config.lottieSource} autoPlay loop={false} style={{ width: '100%', height: '100%', transform: [{ scale: 1.3 }] }} />
            ) : (
              <Ionicons 
                name={config.type === 'confirm' ? 'help-circle-outline' : 'information-circle-outline'} 
                size={32} 
                color={config.type === 'confirm' ? '#EA580C' : '#3B82F6'} 
              />
            )}
          </View>

          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.message}>{config.message}</Text>

          <View style={styles.buttonRow}>
            {config.type === 'confirm' && (
              <TouchableOpacity style={styles.cancelBtn} onPress={config.onCancel}>
                <Text style={styles.cancelBtnText}>{config.cancelText || 'Cancel'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.confirmBtn, config.type === 'alert' && { width: '100%' }]} 
              onPress={config.onConfirm}
            >
              <Text style={styles.confirmBtnText}>{config.confirmText || 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { backdropFilter: 'blur(4px)' } as any,
    }),
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
