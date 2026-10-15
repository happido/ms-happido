import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = width - 64; // assuming padding of 32 on sides
const BUTTON_HEIGHT = 60;
const SWIPEABLE_DIMENSIONS = 52;
const H_WAVE_RANGE = BUTTON_WIDTH - SWIPEABLE_DIMENSIONS - 8;

interface SwipeButtonProps {
  onSwipeSuccess: () => void;
  title?: string;
  pingTimer?: number | null;
}

const SwipeButton: React.FC<SwipeButtonProps> = ({ onSwipeSuccess, title = 'SLIDE TO ACCEPT', pingTimer }) => {
  const [swiped, setSwiped] = useState(false);
  const dragX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (swiped) return;
        if (gestureState.dx > 0 && gestureState.dx < H_WAVE_RANGE) {
          dragX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (swiped) return;
        if (gestureState.dx >= H_WAVE_RANGE * 0.7) {
          // Success
          setSwiped(true);
          Animated.timing(dragX, {
            toValue: H_WAVE_RANGE,
            duration: 200,
            useNativeDriver: false, // width/translation can't always be native
          }).start(() => {
            onSwipeSuccess();
          });
        } else {
          // Reset
          Animated.spring(dragX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const swipeTextOpacity = dragX.interpolate({
    inputRange: [0, H_WAVE_RANGE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const filledWidth = dragX.interpolate({
    inputRange: [0, H_WAVE_RANGE],
    outputRange: [SWIPEABLE_DIMENSIONS + 8, BUTTON_WIDTH],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onSwipeSuccess} style={styles.container}>
      {/* Background layer */}
      <View style={styles.buttonBackground}>
        <Animated.View style={{ opacity: swipeTextOpacity, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.swipeText}>
            {title} {pingTimer !== null && pingTimer !== undefined ? `(${pingTimer}s)` : ''}
          </Text>
        </Animated.View>
      </View>

      {/* Filled Gradient Layer */}
      <Animated.View style={[styles.filledLayer, { width: filledWidth }]}>
        <LinearGradient
          colors={['#F97316', '#EA580C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill as any}
        />
      </Animated.View>

      {/* Thumb / Draggable Element */}
      <Animated.View
        style={[styles.thumbContainer, { transform: [{ translateX: dragX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.thumb}>
          <Ionicons name="chevron-forward" size={28} color="#EA580C" />
          <Ionicons name="chevron-forward" size={28} color="#EA580C" style={{ marginLeft: -18, opacity: 0.5 }} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    backgroundColor: '#1E293B',
    borderRadius: BUTTON_HEIGHT / 2,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonBackground: {
    ...(StyleSheet.absoluteFill as any),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155', // Dark background for the slot
  },
  filledLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: BUTTON_HEIGHT / 2,
    overflow: 'hidden',
  },
  swipeText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    paddingLeft: 30, // Offset for the thumb
  },
  thumbContainer: {
    position: 'absolute',
    left: 4,
    width: SWIPEABLE_DIMENSIONS,
    height: SWIPEABLE_DIMENSIONS,
  },
  thumb: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: SWIPEABLE_DIMENSIONS / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default SwipeButton;
