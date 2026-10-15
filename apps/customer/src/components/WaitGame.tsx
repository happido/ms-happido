import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const WaitGame = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const scaleAnim = new Animated.Value(1);

  const handleTap = () => {
    setScore(prev => prev + 1);
    
    // Simple bounce animation on tap
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  useEffect(() => {
    if (score > 0 && score % 20 === 0) {
      setLevel(prev => prev + 1);
    }
  }, [score]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bored waiting? Rev the Engine!</Text>
      <Text style={styles.score}>Rev Count: {score}</Text>
      <Text style={styles.level}>Speed Level: {level} 🚀</Text>

      <TouchableOpacity onPress={handleTap} activeOpacity={0.8} style={styles.btnArea}>
        <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
          <MaterialCommunityIcons name="engine-outline" size={48} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
      
      <Text style={styles.hint}>Tap as fast as you can!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EA580C',
  },
  level: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 16,
  },
  btnArea: {
    padding: 12,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  }
});
