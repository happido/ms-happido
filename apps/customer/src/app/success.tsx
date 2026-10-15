import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <Animated.View entering={ZoomIn.duration(800).springify()} style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#10B981" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.textContainer}>
          <Text style={styles.title}>Delivered Successfully!</Text>
          <Text style={styles.subtitle}>Your delicious food has arrived. We hope you enjoy your meal.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.cardContainer}>
          <View style={styles.feedbackRow}>
            <Text style={styles.feedbackText}>How was your delivery?</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star}>
                  <Ionicons name="star-outline" size={28} color="#CBD5E1" style={styles.starIcon} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(900).springify()} style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.homeBtn} 
            onPress={() => router.replace('/')}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: width - 48,
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 20,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  feedbackRow: {
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 16,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starIcon: {
    marginHorizontal: 8,
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 24,
  },
  homeBtn: {
    backgroundColor: '#EA580C',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
