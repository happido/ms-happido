import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface AIInsight {
  id: string;
  type: 'promo' | 'combo' | 'inventory';
  title: string;
  description: string;
  actionText: string;
  impactText: string;
}

interface Props {
  insight: AIInsight;
  onAction: () => void;
}

export default function AIInsightCard({ insight, onAction }: Props) {
  const getIcon = () => {
    switch (insight.type) {
      case 'promo': return 'pricetag';
      case 'combo': return 'restaurant';
      case 'inventory': return 'warning';
      default: return 'flash';
    }
  };

  const getGradient = () => {
    switch (insight.type) {
      case 'promo': return ['#FFF7ED', '#FFEDD5'];
      case 'combo': return ['#F3E8FF', '#E9D5FF'];
      case 'inventory': return ['#FEF2F2', '#FEE2E2'];
      default: return ['#F8FAFC', '#F1F5F9'];
    }
  };

  const getIconColor = () => {
    switch (insight.type) {
      case 'promo': return '#EA580C';
      case 'combo': return '#9333EA';
      case 'inventory': return '#DC2626';
      default: return '#64748B';
    }
  };

  return (
    <LinearGradient colors={getGradient() as any} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Ionicons name={getIcon() as any} size={16} color={getIconColor()} />
          <Text style={[styles.title, { color: getIconColor() }]}>{insight.title}</Text>
        </View>
      </View>
      <Text style={styles.description}>{insight.description}</Text>
      
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: getIconColor() }]} onPress={onAction}>
          <Text style={styles.actionText}>{insight.actionText}</Text>
        </TouchableOpacity>
        <Text style={[styles.impact, { color: getIconColor() }]}>{insight.impactText}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  description: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  impact: {
    fontSize: 12,
    fontWeight: '800',
  }
});
