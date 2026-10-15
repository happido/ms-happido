import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AIPredictionChart() {
  // A mock SVG chart layout utilizing React Native views for a dynamic "Forecast" look
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Demand Forecast</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Live ML Model</Text>
        </View>
      </View>
      
      <Text style={styles.subtitle}>Predicted vs Actual Orders (Today)</Text>

      <View style={styles.chartArea}>
        {/* Mock Grid Lines */}
        <View style={styles.gridLine}><Text style={styles.yLabel}>100</Text></View>
        <View style={styles.gridLine}><Text style={styles.yLabel}>50</Text></View>
        <View style={styles.gridLine}><Text style={styles.yLabel}>0</Text></View>

        {/* Mock "Actual" Area Fill */}
        <LinearGradient 
          colors={['rgba(234,88,12,0.4)', 'rgba(234,88,12,0.05)']} 
          style={[styles.actualFill, { width: '40%' }]} 
        />
        
        {/* Mock "Predicted" Dashed Line representing future */}
        <View style={styles.predictedLine} />
        
        {/* Mock "Actual" Solid Line */}
        <View style={styles.actualLine} />

        {/* Current Time Indicator */}
        <View style={styles.currentTimeMarker}>
          <View style={styles.currentTimeDot} />
        </View>
        
        {/* X Axis Labels */}
        <View style={styles.xAxis}>
          <Text style={styles.xLabel}>10 AM</Text>
          <Text style={styles.xLabel}>2 PM</Text>
          <Text style={styles.xLabel}>6 PM</Text>
          <Text style={styles.xLabel}>10 PM</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#EA580C' }]} />
          <Text style={styles.legendText}>Actual</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.legendText}>Forecast (+12% Rush)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  chartArea: {
    height: 120,
    justifyContent: 'space-between',
    position: 'relative',
    paddingLeft: 24,
    marginBottom: 10,
  },
  gridLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
  },
  yLabel: {
    position: 'absolute',
    left: -20,
    bottom: -6,
    fontSize: 10,
    color: '#9CA3AF',
  },
  actualFill: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    height: '60%',
    borderTopRightRadius: 20,
  },
  actualLine: {
    position: 'absolute',
    bottom: '60%',
    left: 24,
    width: '40%',
    height: 3,
    backgroundColor: '#EA580C',
    borderRadius: 2,
  },
  predictedLine: {
    position: 'absolute',
    bottom: '40%',
    left: '60%',
    width: '40%',
    height: 2,
    borderTopWidth: 2,
    borderTopColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  currentTimeMarker: {
    position: 'absolute',
    left: '60%',
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#EA580C',
    borderStyle: 'dashed',
    zIndex: 10,
  },
  currentTimeDot: {
    position: 'absolute',
    left: -4,
    bottom: '40%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EA580C',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  xLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  }
});
