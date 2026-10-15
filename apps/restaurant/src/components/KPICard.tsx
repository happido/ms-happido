import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string];
  trend?: string;
  trendPositive?: boolean;
  delay?: number;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradientColors,
  trend,
  trendPositive = true,
  delay = 100,
}) => {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.card}>
      <View style={styles.topRow}>
        <LinearGradient
          colors={gradientColors}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </LinearGradient>
        {trend && (
          <View style={[styles.trendBadge, trendPositive ? styles.trendUp : styles.trendNeutral]}>
            <Ionicons
              name={trendPositive ? 'trending-up' : 'information-circle'}
              size={12}
              color={trendPositive ? '#059669' : '#6B7280'}
            />
            <Text style={[styles.trendText, trendPositive ? styles.trendUpText : styles.trendNeutralText]}>
              {trend}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.valueText}>{value}</Text>
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.subtitleText}>{subtitle}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.08)',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  trendUp: {
    backgroundColor: '#ECFDF5',
  },
  trendNeutral: {
    backgroundColor: '#F3F4F6',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  trendUpText: {
    color: '#059669',
  },
  trendNeutralText: {
    color: '#4B5563',
  },
  valueText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A3412',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
