const fs = require('fs');
const path = require('path');

const onboardingContent = (appType) => `
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SLIDES = {
  customer: [
    { id: '1', title: 'Discover Best Food', description: 'Find the best restaurants and dishes in your local area easily.', image: require('../../assets/images/slide1.jpg') },
    { id: '2', title: 'Lightning Fast Delivery', description: 'Get your food delivered to your doorstep in record time.', image: require('../../assets/images/slide2.jpg') },
    { id: '3', title: 'Live Order Tracking', description: 'Track your order in real-time from the kitchen to your door.', image: require('../../assets/images/slide3.jpg') },
  ],
  restaurant: [
    { id: '1', title: 'Manage Orders Easily', description: 'Keep track of all incoming orders and manage your menu in real-time.', image: require('../../assets/images/slide1.jpg') },
    { id: '2', title: 'Track Your Earnings', description: 'View your daily, weekly, and monthly earnings at a glance.', image: require('../../assets/images/slide2.jpg') },
    { id: '3', title: 'Grow Your Business', description: 'Reach thousands of new customers and grow your restaurant with Happido.', image: require('../../assets/images/slide3.jpg') },
  ],
  rider: [
    { id: '1', title: 'Accept Rides Instantly', description: 'Get notified of new delivery requests and accept them with one tap.', image: require('../../assets/images/slide1.jpg') },
    { id: '2', title: 'Optimized Routes', description: 'Navigate efficiently with our smart built-in routing system.', image: require('../../assets/images/slide2.jpg') },
    { id: '3', title: 'Earn on Your Schedule', description: 'Work whenever you want and earn money on your own terms.', image: require('../../assets/images/slide3.jpg') },
  ]
};

const AnimatedImageItem = ({ item }: { item: any }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.imageWrapper, animatedStyle]}>
      <View style={styles.imageInner}>
         <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>
    </Animated.View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(width);
  const flatListRef = useRef<FlatList>(null);
  
  const slides = SLIDES['${appType}'] || SLIDES['customer'];

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/login');
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.slide, { width: containerWidth }]}>
        <AnimatedImageItem item={item} />
        <View style={styles.textContainer}>
          <Animated.Text entering={FadeInUp.delay(300).springify()} style={styles.title}>{item.title}</Animated.Text>
          <Animated.Text entering={FadeInUp.delay(400).springify()} style={styles.description}>{item.description}</Animated.Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#EA580C" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EA580C',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
    height: 100,
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  imageWrapper: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  imageInner: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#EA580C',
    fontSize: 16,
    fontWeight: '800',
  },
});
`;

['customer', 'restaurant', 'rider'].forEach(app => {
  const targetPath = path.join(__dirname, `apps/${app}/src/app/onboarding.tsx`);
  fs.writeFileSync(targetPath, onboardingContent(app));
  console.log(`Created beautiful image onboarding for ${app}`);
});
