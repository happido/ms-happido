import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
  PanResponder,
  Animated as RNAnimated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  FadeInDown,
  SlideInUp,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import HappidoAICopilotModal from './HappidoAICopilotModal';

interface AssistiveTouchProps {
  cartCount: number;
  activeOrderId?: string;
  enabled?: boolean;
  onCartPress?: () => void;
  onRequestFoodSubmit?: (note: string) => void;
  onCartUpdated?: (newCount: number) => void;
}

type MenuAction = 'order_food' | 'ride' | 'blood' | 'history' | null;

export default function AssistiveTouch({
  cartCount,
  activeOrderId = 'HP-9042',
  enabled = true,
  onCartPress,
  onRequestFoodSubmit,
  onCartUpdated,
}: AssistiveTouchProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'arc' | 'grid'>('arc');
  const [activePrompt, setActivePrompt] = useState<MenuAction>(null);
  const [requiredFoodNote, setRequiredFoodNote] = useState('');
  const [dietaryType, setDietaryType] = useState<'regular' | 'patient' | 'emergency'>('regular');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Premium Micro-animation: Slow pulse for the AI button
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // PanResponder for Draggable / Movable AssistiveTouch button with iOS-style snap
  const pan = useRef(new RNAnimated.ValueXY({ x: 0, y: 0 })).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({
          x: (pan.x as any)._value || 0,
          y: (pan.y as any)._value || 0,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4) {
          isDragging.current = true;
        }
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        if (!isDragging.current) {
          setIsMenuOpen(true);
        } else {
          // iOS snap-to-edge animation with gentle spring damping
          const curX = (pan.x as any)._value || 0;
          const curY = (pan.y as any)._value || 0;
          // In customer phone container (390px wide), snap to right (0) or left (-290)
          const snapX = curX < -140 ? -290 : 0;
          const clampedY = Math.max(-560, Math.min(10, curY));

          RNAnimated.spring(pan, {
            toValue: { x: snapX, y: clampedY },
            friction: 7,
            tension: 50,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleActionClick = (action: MenuAction) => {
    setIsMenuOpen(false);
    setActivePrompt(action);
  };

  const handleConfirmPrompt = () => {
    const action = activePrompt;
    setActivePrompt(null);

    if (action === 'order_food') {
      router.push('/restaurants');
    } else if (action === 'ride') {
      showToast('🚗 Booking a ride...');
      router.push('/ride' as any);
    } else if (action === 'blood') {
      showToast('🩸 Blood requirement submitted!');
      router.push('/blood' as any);
    } else if (action === 'history') {
      router.push('/checkout');
    }
  };

  if (!enabled) {
    return null;
  }

  // Authentic iOS AssistiveTouch Menu Content
  const menuContent = (
    <View style={styles.overlay}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(160)}
        style={[styles.backdrop, Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as any) : null]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
        />
      </Animated.View>

      <Animated.View
        entering={ZoomIn.springify().damping(16).mass(0.6).stiffness(180)}
        exiting={ZoomOut.duration(160)}
        style={[
          layoutMode === 'arc' ? styles.menuPanelArc : styles.menuPanel,
          Platform.OS === 'web' ? ({ backdropFilter: 'blur(28px) saturate(190%)' } as any) : null,
        ]}
      >
        {/* Top Header Row with Layout Switcher */}
        <View style={styles.menuHeaderRow}>
          <View style={styles.menuHeaderPill}>
            <View style={styles.menuHeaderDot} />
            <Text style={styles.menuHeaderTitle}>
              {layoutMode === 'arc' ? 'SEMI-CIRCLE ARC' : 'ASSISTIVETOUCH'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.layoutToggleBtn}
            onPress={() => setLayoutMode((m) => (m === 'arc' ? 'grid' : 'arc'))}
            activeOpacity={0.7}
          >
            <Ionicons
              name={layoutMode === 'arc' ? 'grid-outline' : 'radio-button-on-outline'}
              size={12}
              color="#D8B4FE"
            />
            <Text style={styles.layoutToggleText}>
              {layoutMode === 'arc' ? 'Grid Mode' : 'Arc Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {layoutMode === 'arc' ? (
          /* ============================================================ */
          /* 🌟 SEMI-CIRCLE RADIAL ARC FAN LAYOUT (FUTURISTIC & ERGONOMIC) */
          /* ============================================================ */
          <View style={styles.arcContainer}>
            {/* Subtle Curved Specular Aura */}
            <LinearGradient
              colors={['rgba(234, 88, 12, 0.25)', 'transparent']}
              style={styles.arcGlowCurve}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            {/* 1. APEX TOP CENTER: Happido AI Copilot */}
            <Animated.View
              entering={FadeInDown.delay(70).springify().damping(12)}
              style={styles.arcApexItem}
            >
              <TouchableOpacity
                style={styles.arcNodeBtn}
                onPress={() => {
                  setIsMenuOpen(false);
                  setIsAICopilotOpen(true);
                }}
                onLongPress={() => {
                  setLayoutMode('grid');
                  showToast('Switched to Grid Mode');
                }}
                activeOpacity={0.78}
              >
                <Animated.View style={animatedPulseStyle}>
                  <LinearGradient
                    colors={['#FB923C', '#EA580C', '#C2410C']}
                    style={styles.arcApexDisc}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="flash" size={26} color="#FFFFFF" />
                    <View style={styles.arcApexTag}>
                      <Text style={styles.arcApexTagText}>AI</Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.arcApexLabel}>Happido AI</Text>
                <Text style={styles.arcSubLabel}>Smart Meal</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 2. TOP-LEFT: Order Food */}
            <Animated.View
              entering={FadeInDown.delay(45).springify().damping(13)}
              style={styles.arcTopLeftItem}
            >
              <TouchableOpacity
                style={styles.arcNodeBtn}
                onPress={() => handleActionClick('order_food')}
                activeOpacity={0.78}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.arcDisc}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="fast-food" size={23} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.arcLabel}>Order Food</Text>
                <Text style={styles.arcSubLabel}>Kitchens</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 3. MID-RIGHT: Book a Ride */}
            <Animated.View
              entering={FadeInDown.delay(95).springify().damping(13)}
              style={styles.arcMidRightItem}
            >
              <TouchableOpacity
                style={styles.arcNodeBtn}
                onPress={() => handleActionClick('ride')}
                activeOpacity={0.78}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.arcDisc}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="car-sport" size={23} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.arcLabel}>Book a Ride</Text>
                <Text style={styles.arcSubLabel}>Cab Service</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 4. MID-LEFT: See History */}
            <Animated.View
              entering={FadeInDown.delay(120).springify().damping(13)}
              style={styles.arcMidLeftItem}
            >
              <TouchableOpacity
                style={styles.arcNodeBtn}
                onPress={() => handleActionClick('history')}
                activeOpacity={0.78}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.arcDisc}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="receipt" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.arcLabel}>See History</Text>
                <Text style={styles.arcSubLabel}>Orders</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 6. TOP-RIGHT: Need Blood */}
            <Animated.View
              entering={FadeInDown.delay(140).springify().damping(13)}
              style={styles.arcTopRightItem}
            >
              <TouchableOpacity
                style={styles.arcNodeBtn}
                onPress={() => handleActionClick('blood')}
                activeOpacity={0.78}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.arcDisc}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="water" size={22} color="#EF4444" />
                </LinearGradient>
                <Text style={styles.arcLabel}>Need Blood</Text>
                <Text style={styles.arcSubLabel}>Emergency</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* CENTER ANCHOR / HUB: Close Dismiss Button */}
            <Animated.View
              entering={ZoomIn.delay(10).springify().damping(15)}
              style={styles.arcCenterHub}
            >
              <TouchableOpacity
                style={styles.arcHubButton}
                onPress={() => setIsMenuOpen(false)}
                activeOpacity={0.75}
              >
                <View style={styles.arcHubRingOuter}>
                  <View style={styles.arcHubRingInner}>
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.arcHubText}>Dismiss</Text>
            </Animated.View>
          </View>
        ) : (
          /* ============================================================ */
          /* 📱 2x2 CLASSIC GRID LAYOUT WITH TOP AI COPILOT BANNER       */
          /* ============================================================ */
          <>
            {/* Featured Apple Intelligence AI Copilot Node */}
            <Animated.View
              entering={FadeInDown.delay(20).springify().damping(14)}
              style={styles.aiCopilotBannerWrapper}
            >
              <TouchableOpacity
                style={styles.aiCopilotBanner}
                onPress={() => {
                  setIsMenuOpen(false);
                  setIsAICopilotOpen(true);
                }}
                onLongPress={() => {
                  setLayoutMode('arc');
                  showToast('Switched to Arc Mode');
                }}
                activeOpacity={0.8}
              >
                <Animated.View style={animatedPulseStyle}>
                  <LinearGradient
                    colors={['#FB923C', '#EA580C', '#C2410C']}
                    style={styles.aiCopilotIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="flash" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
                <View style={styles.aiCopilotTextCol}>
                  <View style={styles.aiCopilotTitleRow}>
                    <Text style={styles.aiCopilotTitle}>Happido AI Copilot</Text>
                    <View style={styles.aiCopilotNewTag}>
                      <Text style={styles.aiCopilotNewText}>AI</Text>
                    </View>
                  </View>
                  <Text style={styles.aiCopilotSub}>Clinical Diet & 1-Click Auto-Cart</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C084FC" />
              </TouchableOpacity>
            </Animated.View>

            {/* 2x2 Radial Action Grid with Staggered Spring Animation */}
            <View style={styles.gridContainer}>
              {/* Action 1: Order Food */}
              <Animated.View
                entering={FadeInDown.delay(70).springify().damping(14)}
                style={styles.gridItemWrapper}
              >
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() => handleActionClick('order_food')}
                  activeOpacity={0.78}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.gridIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="fast-food" size={25} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.gridLabel}>Order Food</Text>
                  <Text style={styles.gridSubLabel}>Hot Kitchens</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Action 3: Book a Ride */}
              <Animated.View
                entering={FadeInDown.delay(110).springify().damping(14)}
                style={styles.gridItemWrapper}
              >
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() => handleActionClick('ride')}
                  activeOpacity={0.78}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.gridIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="car-sport" size={25} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.gridLabel}>Book a Ride</Text>
                  <Text style={styles.gridSubLabel}>Cab Service</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Action 4: See History */}
              <Animated.View
                entering={FadeInDown.delay(150).springify().damping(14)}
                style={styles.gridItemWrapper}
              >
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() => handleActionClick('history')}
                  activeOpacity={0.78}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.gridIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="receipt" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.gridLabel}>See History</Text>
                  <Text style={styles.gridSubLabel}>Track #{activeOrderId}</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Action 5: Need Blood */}
              <Animated.View
                entering={FadeInDown.delay(190).springify().damping(14)}
                style={styles.gridItemWrapper}
              >
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() => handleActionClick('blood')}
                  activeOpacity={0.78}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.gridIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="water" size={24} color="#EF4444" />
                  </LinearGradient>
                  <Text style={styles.gridLabel}>Need Blood</Text>
                  <Text style={styles.gridSubLabel}>Emergency Request</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Center / Bottom Sleek Close Button */}
            <TouchableOpacity
              style={styles.closeAssistiveBtn}
              onPress={() => setIsMenuOpen(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={20} color="#94A3B8" />
              <Text style={styles.closeAssistiveText}>Dismiss</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );

  // Permission / Action Confirmation Modal Dialog
  const promptContent = activePrompt !== null && (
    <View style={styles.overlay}>
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(140)}
        style={[styles.backdrop, Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as any) : null]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => setActivePrompt(null)}
        />
      </Animated.View>

      <Animated.View
        entering={ZoomIn.springify().damping(17).mass(0.6)}
        exiting={ZoomOut.duration(150)}
        style={styles.iosAlertCard}
      >
        {/* Dynamic Gradient Hero Icon */}
        <LinearGradient
          colors={
            activePrompt === 'order_food'
              ? ['#FBBF24', '#D97706']
              : activePrompt === 'ride'
              ? ['#34D399', '#059669']
              : activePrompt === 'blood'
              ? ['#EF4444', '#B91C1C']
              : ['#818CF8', '#4F46E5']
          }
          style={styles.iosAlertIconWrapper}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name={
              activePrompt === 'order_food'
                ? 'fast-food'
                : activePrompt === 'ride'
                ? 'car-sport'
                : activePrompt === 'blood'
                ? 'water'
                : 'receipt'
            }
            size={32}
            color="#FFFFFF"
          />
        </LinearGradient>

        <Text style={styles.iosAlertTitle}>
          {activePrompt === 'order_food' && 'Order Food Permission'}
          {activePrompt === 'ride' && 'Book a Ride'}
          {activePrompt === 'blood' && 'Emergency Blood Request'}
          {activePrompt === 'history' && 'View Order History'}
        </Text>

        <Text style={styles.iosAlertDesc}>
          {activePrompt === 'order_food' &&
            'Happido will load verified local cloud kitchens and restaurants with immediate delivery.'}
          {activePrompt === 'ride' &&
            'Get a verified cab to your location immediately.'}
          {activePrompt === 'blood' &&
            'Submit an emergency request for blood donors or blood banks.'}
          {activePrompt === 'history' &&
            `Track live order #${activeOrderId} status or review receipts of past orders.`}
        </Text>

        {activePrompt === 'blood' && (
          <View style={styles.requiredFoodForm}>
            <View style={styles.dietaryChips}>
              <TouchableOpacity
                style={[styles.chip, dietaryType === 'regular' && styles.chipActive]}
                onPress={() => setDietaryType('regular')}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, dietaryType === 'regular' && styles.chipTextActive]}>
                  Meal Request
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, dietaryType === 'patient' && styles.chipActive]}
                onPress={() => setDietaryType('patient')}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, dietaryType === 'patient' && styles.chipTextActive]}>
                  Patient Diet
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, dietaryType === 'emergency' && styles.chipActive]}
                onPress={() => setDietaryType('emergency')}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, dietaryType === 'emergency' && styles.chipTextActive]}>
                  Relief Food
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Specify dietary instructions, allergies, or patient needs..."
              placeholderTextColor="#94A3B8"
              value={requiredFoodNote}
              onChangeText={setRequiredFoodNote}
              multiline={true}
              numberOfLines={2}
            />
          </View>
        )}

        <View style={styles.iosAlertActionsRow}>
          <TouchableOpacity
            style={[styles.iosAlertBtn, styles.iosCancelBtn]}
            onPress={() => setActivePrompt(null)}
            activeOpacity={0.7}
          >
            <Text style={styles.iosCancelBtnText}>Not Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iosAlertBtn}
            onPress={handleConfirmPrompt}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                activePrompt === 'order_food'
                  ? ['#FBBF24', '#D97706']
                  : activePrompt === 'ride'
                  ? ['#34D399', '#059669']
                  : activePrompt === 'blood'
                  ? ['#EF4444', '#B91C1C']
                  : ['#818CF8', '#4F46E5']
              }
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.iosConfirmBtnText}>
              {activePrompt === 'order_food' && 'Order Now'}
              {activePrompt === 'ride' && 'Book Ride'}
              {activePrompt === 'blood' && 'Submit Request'}
              {activePrompt === 'history' && 'Open History'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <>
      {/* Toast Feedback */}
      {toastMessage && (
        <Animated.View entering={SlideInUp} exiting={SlideOutDown} style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Movable / Draggable AssistiveTouch Button */}
      {!isMenuOpen && (
        <RNAnimated.View
          style={[
            styles.floatingTriggerContainer,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.assistiveTouchButton}>
            {/* Specular Highlight Ring 1 */}
            <View style={styles.touchRingOuter}>
              {/* Concentric Glow Ring 2 */}
              <View style={styles.touchRingMiddle}>
                {/* Core White Disc */}
                <View style={styles.touchCoreCircle} />
              </View>
            </View>

            {/* Cart Count Live Badge */}
            {cartCount > 0 && (
              <View style={styles.assistiveBadge}>
                <Text style={styles.assistiveBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </RNAnimated.View>
      )}

      {/* Render overlay inside frame on Web, or standard Modal on native */}
      {Platform.OS === 'web' ? (
        <>
          {isMenuOpen && menuContent}
          {activePrompt !== null && promptContent}
          <HappidoAICopilotModal
            visible={isAICopilotOpen}
            onClose={() => setIsAICopilotOpen(false)}
            onCartUpdated={(newCount) => {
              if (onCartUpdated) onCartUpdated(newCount);
            }}
            onNavigateToCart={() => {
              if (onCartPress) onCartPress();
              else router.push('/cart');
            }}
          />
        </>
      ) : (
        <>
          <Modal
            visible={isMenuOpen}
            animationType="none"
            transparent={true}
            onRequestClose={() => setIsMenuOpen(false)}
          >
            {menuContent}
          </Modal>

          <Modal
            visible={activePrompt !== null}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setActivePrompt(null)}
          >
            {promptContent}
          </Modal>

          <HappidoAICopilotModal
            visible={isAICopilotOpen}
            onClose={() => setIsAICopilotOpen(false)}
            onCartUpdated={(newCount) => {
              if (onCartUpdated) onCartUpdated(newCount);
            }}
            onNavigateToCart={() => {
              if (onCartPress) onCartPress();
              else router.push('/cart');
            }}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Floating AssistiveTouch Button
  floatingTriggerContainer: {
    position: 'absolute',
    bottom: 160,
    right: 18,
    zIndex: 999,
  },
  assistiveTouchButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 26, 34, 0.76)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
  touchRingOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchRingMiddle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchCoreCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 6,
  },
  assistiveBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  assistiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  // Overlay & Modal
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 15, 26, 0.68)',
  },

  // AssistiveTouch Menu Panel (Classic Grid)
  menuPanel: {
    width: 300,
    backgroundColor: 'rgba(24, 27, 36, 0.94)',
    borderRadius: 36,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 24,
    alignItems: 'center',
  },

  // 🌟 Semi-Circle Radial Arc Panel (Arched Dome)
  menuPanelArc: {
    width: 344,
    height: 330,
    backgroundColor: 'rgba(18, 21, 31, 0.95)',
    borderRadius: 40,
    borderTopLeftRadius: 65,
    borderTopRightRadius: 65,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 25,
    paddingTop: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 6,
    zIndex: 20,
  },
  layoutToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    gap: 4,
  },
  layoutToggleText: {
    color: '#E9D5FF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  arcContainer: {
    width: '100%',
    flex: 1,
    position: 'relative',
  },
  arcGlowCurve: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 110,
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
    opacity: 0.18,
  },
  // Apex: Happido AI Copilot (Top Center)
  arcApexItem: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  arcApexDisc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
    position: 'relative',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  arcApexTag: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#9333EA',
    borderRadius: 7,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#141721',
  },
  arcApexTagText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  arcApexLabel: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Top Left: Order Food
  arcTopLeftItem: {
    position: 'absolute',
    top: 40,
    left: 45,
    alignItems: 'center',
    zIndex: 10,
  },
  // Top Right: Need Blood
  arcTopRightItem: {
    position: 'absolute',
    top: 40,
    right: 45,
    alignItems: 'center',
    zIndex: 10,
  },
  // Mid Left: View Cart
  arcMidLeftItem: {
    position: 'absolute',
    top: 115,
    left: 15,
    alignItems: 'center',
    zIndex: 10,
  },
  // Mid Right: Book a Ride
  arcMidRightItem: {
    position: 'absolute',
    top: 115,
    right: 15,
    alignItems: 'center',
    zIndex: 10,
  },
  // Lower Center: See History
  arcLowerCenterItem: {
    position: 'absolute',
    top: 185,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arcNodeBtn: {
    alignItems: 'center',
  },
  arcDisc: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  arcBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#141721',
  },
  arcBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  arcLabel: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  arcSubLabel: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Center Hub: Dismiss
  arcCenterHub: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  arcHubButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  arcHubRingOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcHubRingInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcHubText: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },

  menuHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 18,
  },
  menuHeaderDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 7,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  menuHeaderTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  aiCopilotBannerWrapper: {
    width: '100%',
    marginBottom: 14,
  },
  aiCopilotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(168, 85, 247, 0.45)',
  },
  aiCopilotIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  aiCopilotTextCol: {
    flex: 1,
  },
  aiCopilotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiCopilotTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  aiCopilotNewTag: {
    backgroundColor: '#9333EA',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  aiCopilotNewText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  aiCopilotSub: {
    color: '#D8B4FE',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 12,
  },
  gridItemWrapper: {
    width: '48%',
  },
  gridItem: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  gridIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  gridBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 19,
    height: 19,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#181B24',
  },
  gridBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  gridLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  gridSubLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeAssistiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  closeAssistiveText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 6,
  },

  // Apple-style Alert Box
  iosAlertCard: {
    width: '100%',
    maxWidth: 325,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 24,
  },
  iosAlertIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  iosAlertTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  iosAlertDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  requiredFoodForm: {
    width: '100%',
    marginBottom: 16,
  },
  dietaryChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 6,
  },
  chip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#10B981',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  noteInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 52,
    textAlignVertical: 'top',
  },
  iosAlertActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  iosAlertBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iosCancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  iosCancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  iosConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  toast: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
});
