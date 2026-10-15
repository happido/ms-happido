import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  FadeInDown,
} from 'react-native-reanimated';
import {
  PRESET_AI_PROMPTS,
  getAIMealRecommendation,
  AIMealRecommendation,
} from '@/services/aiCopilotService';
import { addMultipleToCart } from '@/utils/cartHelper';

interface HappidoAICopilotModalProps {
  visible: boolean;
  onClose: () => void;
  onCartUpdated: (newCount: number) => void;
  onNavigateToCart: () => void;
}

export default function HappidoAICopilotModal({
  visible,
  onClose,
  onCartUpdated,
  onNavigateToCart,
}: HappidoAICopilotModalProps) {
  const [selectedPrompt, setSelectedPrompt] = useState('diabetic');
  const [customInput, setCustomInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<AIMealRecommendation | null>(null);

  React.useEffect(() => {
    if (visible) {
      handleSelectPreset('diabetic');
    }
  }, [visible]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!visible) return null;

  const handleSelectPreset = async (presetId: string) => {
    setSelectedPrompt(presetId);
    setCustomInput('');
    setIsGenerating(true);
    try {
      const rec = await getAIMealRecommendation(presetId);
      setRecommendation(rec);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomQuery = async () => {
    if (!customInput.trim()) return;
    setIsGenerating(true);
    try {
      const rec = await getAIMealRecommendation(customInput);
      setRecommendation(rec);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handle1ClickAddToCart = async () => {
    try {
      if (!recommendation) return;
      setIsAddingToCart(true);
      const itemsToAdd = recommendation.dishes.map((d) => d.item);
      const restaurantIdToUse = (recommendation.dishes[0] as any)?.restaurantId || 'ai-kitchen-care';
      const updatedCount = await addMultipleToCart(
        itemsToAdd,
        restaurantIdToUse,
        recommendation.dishes[0]?.kitchenName || 'Happido Certified Kitchen'
      );
      onCartUpdated(updatedCount);
      setSuccessToast(`🎉 ${itemsToAdd.length} Dishes Added! Coupon ${recommendation.couponCode} applied!`);

      setTimeout(() => {
        setSuccessToast(null);
        onClose();
        onNavigateToCart();
      }, 1100);
    } catch (e) {
      console.log('Error in 1-click cart add:', e);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <View style={styles.overlay}>
      {/* Frosted Dark Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[
          styles.backdrop,
          Platform.OS === 'web' ? ({ backdropFilter: 'blur(16px)' } as any) : null,
        ]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Main Apple Intelligence iOS Bottom Sheet */}
      <Animated.View
        entering={FadeInDown.springify().damping(20).mass(0.7).stiffness(200)}
        exiting={FadeOut.duration(160)}
        style={[
          styles.modalSheet,
          Platform.OS === 'web' ? ({ backdropFilter: 'blur(36px) saturate(200%)' } as any) : null,
        ]}
      >
        {/* Top Grabber Handle Bar for iOS Bottom Sheet Feel */}
        <View style={styles.sheetHandleBar}>
          <View style={styles.sheetHandlePill} />
        </View>

        {/* Glowing Iridescent Specular Aura */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.4)', 'rgba(236, 72, 153, 0.25)', 'rgba(59, 130, 246, 0.3)']}
          style={styles.chromaticGlowTop}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Top Header Bar */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={['#FB923C', '#EA580C', '#C2410C']}
              style={styles.aiOrb}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="flash" size={18} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <View style={styles.titleWithBadge}>
                <Text style={styles.headerTitle}>Happido AI Copilot</Text>
                <View style={styles.proTag}>
                  <Text style={styles.proTagText}>GEN AI</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>Doctor-Verified Nutrition & 1-Click Auto-Cart</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 2x2 Preset Quick Chips Grid */}
        <View style={styles.chipsGridOuter}>
          <View style={styles.chipsRow}>
            {PRESET_AI_PROMPTS.slice(0, 2).map((p) => {
              const isSelected = selectedPrompt === p.id && !customInput;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.chipPill, isSelected && styles.chipPillSelected]}
                  onPress={() => handleSelectPreset(p.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={p.icon as any}
                    size={13}
                    color={isSelected ? '#FFFFFF' : '#A855F7'}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[styles.chipPillText, isSelected && styles.chipPillTextSelected]}
                    numberOfLines={1}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.chipsRow}>
            {PRESET_AI_PROMPTS.slice(2, 4).map((p) => {
              const isSelected = selectedPrompt === p.id && !customInput;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.chipPill, isSelected && styles.chipPillSelected]}
                  onPress={() => handleSelectPreset(p.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={p.icon as any}
                    size={13}
                    color={isSelected ? '#FFFFFF' : '#A855F7'}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[styles.chipPillText, isSelected && styles.chipPillTextSelected]}
                    numberOfLines={1}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* AI Natural Language Prompt Bar */}
        <View style={styles.promptBar}>
          <Ionicons name="chatbubble-ellipses-outline" size={15} color="#A855F7" style={{ marginLeft: 6 }} />
          <TextInput
            style={styles.promptInput}
            placeholder="Ask: 'Diabetic dinner under ₹350'..."
            placeholderTextColor="#64748B"
            value={customInput}
            onChangeText={setCustomInput}
            onSubmitEditing={handleCustomQuery}
          />
          {customInput.trim().length > 0 ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleCustomQuery} activeOpacity={0.8}>
              <Ionicons name="arrow-up" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.aiSparkleIcon}>
              <Ionicons name="flash" size={13} color="#C084FC" />
            </View>
          )}
        </View>

        {/* Scrollable Content Body */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollAreaContent}
          showsVerticalScrollIndicator={false}
        >
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EA580C" />
              <Text style={styles.loadingTitle}>Analyzing Clinical Guidelines...</Text>
              <Text style={styles.loadingSubtitle}>Optimizing macros & selecting verified kitchen dishes</Text>
            </View>
          ) : recommendation ? (
            <>
              {/* Clinical & Nutrition Overview Card */}
              <Animated.View entering={FadeInDown.duration(200)} style={styles.clinicalCard}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.05)', 'transparent']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.clinicalHeaderRow}>
                  <View style={styles.clinicalMatchBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                    <Text style={styles.clinicalMatchText}>
                      {recommendation.medicalSafetyScore}% Clinical Safety Score
                    </Text>
                  </View>
                  <View style={styles.clinicalCategoryPill}>
                    <Text style={styles.clinicalCategoryText}>{recommendation.healthCategory}</Text>
                  </View>
                </View>

                <Text style={styles.recHeadline}>{recommendation.title}</Text>
                <Text style={styles.recDoctorBrief}>{recommendation.clinicalNote}</Text>

                {/* Macro Nutrients 4-Column Strip */}
                <View style={styles.macroStrip}>
                  <View style={styles.macroCol}>
                    <Ionicons name="flame" size={14} color="#F59E0B" style={{ marginBottom: 3 }} />
                    <Text style={styles.macroValue}>{recommendation.macros.calories}</Text>
                    <Text style={styles.macroUnit}>kcal</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroCol}>
                    <Ionicons name="fitness" size={14} color="#10B981" style={{ marginBottom: 3 }} />
                    <Text style={[styles.macroValue, { color: '#34D399' }]}>{recommendation.macros.protein}g</Text>
                    <Text style={styles.macroUnit}>Protein</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroCol}>
                    <Ionicons name="nutrition" size={14} color="#38BDF8" style={{ marginBottom: 3 }} />
                    <Text style={[styles.macroValue, { color: '#38BDF8' }]}>{recommendation.macros.carbs}g</Text>
                    <Text style={styles.macroUnit}>Carbs</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroCol}>
                    <Ionicons name="shield-checkmark" size={14} color="#C084FC" style={{ marginBottom: 3 }} />
                    <Text style={[styles.macroValue, { color: '#C084FC' }]}>{recommendation.macros.glycemicIndex.split(' ')[0]}</Text>
                    <Text style={styles.macroUnit}>GI Index</Text>
                  </View>
                </View>
              </Animated.View>

              {/* Curated Dishes Section */}
              <View style={styles.dishesHeaderRow}>
                <Text style={styles.dishesTitle}>Curated Meal Combo (Ready to Cook)</Text>
                <View style={styles.comboReadyTag}>
                  <Ionicons name="restaurant" size={11} color="#F59E0B" />
                  <Text style={styles.comboReadyTagText}>3 Courses</Text>
                </View>
              </View>

              {recommendation.dishes.map((dish) => (
                <View key={dish.item.id} style={styles.dishCard}>
                  <Image source={{ uri: dish.item.imageUrl }} style={styles.dishThumbnail} />
                  <View style={styles.dishInfo}>
                    <View style={styles.dishTitleLine}>
                      <View style={styles.dishNameWrapper}>
                        {dish.item.isVeg ? (
                          <View style={styles.vegIndicator}>
                            <View style={styles.vegDot} />
                          </View>
                        ) : (
                          <View style={[styles.vegIndicator, { borderColor: '#EF4444' }]}>
                            <View style={[styles.vegDot, { backgroundColor: '#EF4444' }]} />
                          </View>
                        )}
                        <Text style={styles.dishItemName} numberOfLines={1}>
                          {dish.item.name}
                        </Text>
                      </View>
                      <Text style={styles.dishPriceText}>₹{dish.item.price}</Text>
                    </View>

                    <Text style={styles.dishCategory}>{dish.categoryTag}</Text>
                    <Text style={styles.dishPortionText}>{dish.portionDesc}</Text>
                    <Text style={styles.dishKitchenName}>👨‍🍳 {dish.kitchenName}</Text>
                  </View>
                </View>
              ))}

              {/* Coupon Savings Bar */}
              <View style={styles.savingsBanner}>
                <View style={styles.savingsLeft}>
                  <Ionicons name="pricetag" size={15} color="#10B981" />
                  <View>
                    <Text style={styles.savingsTitle}>Promo Code {recommendation.couponCode} Auto-Applied!</Text>
                    <Text style={styles.savingsSub}>You save ₹{recommendation.discountAmount} on this AI health combo</Text>
                  </View>
                </View>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>-₹{recommendation.discountAmount}</Text>
                </View>
              </View>
            </>
          ) : null}
        </ScrollView>

        {/* Success Toast */}
        {successToast && (
          <Animated.View entering={FadeInDown} style={styles.toast}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.toastText}>{successToast}</Text>
          </Animated.View>
        )}

        {/* Modern Sticky Bottom Checkout Dock */}
        {recommendation && (
          <View style={styles.stickyFooterDock}>
            <View style={styles.footerPriceCol}>
              <View style={styles.priceBeforeRow}>
                <Text style={styles.originalPriceText}>₹{recommendation.originalPrice}</Text>
                <View style={styles.discountPill}>
                  <Text style={styles.discountPillText}>SAVE ₹{recommendation.discountAmount}</Text>
                </View>
              </View>
            <View style={styles.finalPriceRow}>
              <Text style={styles.finalPriceCurrency}>₹</Text>
              <Text style={styles.finalPriceAmount}>{recommendation.finalPrice}</Text>
              <Text style={styles.totalForItemsText}>• 3 items</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addCartCta}
            onPress={handle1ClickAddToCart}
            disabled={isAddingToCart || isGenerating}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#FB923C', '#EA580C', '#C2410C']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {isAddingToCart ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.ctaContentRow}>
                <Ionicons name="flash" size={16} color="#FFFFFF" />
                <Text style={styles.ctaButtonText}>1-Click Checkout</Text>
                <Ionicons name="chevron-forward" size={15} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 7, 14, 0.78)',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 420,
    height: '91%',
    maxHeight: '92%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#0C0F1D',
    borderWidth: 1.2,
    borderColor: 'rgba(168, 85, 247, 0.28)',
    borderBottomWidth: 0,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 25,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  sheetHandleBar: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 15,
  },
  sheetHandlePill: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  chromaticGlowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.35,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  proTag: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.5)',
  },
  proTagText: {
    color: '#E9D5FF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  // Preset Chips Grid — Explicit 2-row layout to prevent clipping
  chipsGridOuter: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipPillSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.35)',
    borderColor: '#A855F7',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  chipPillText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  chipPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // AI Prompt Bar
  promptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginHorizontal: 16,
    marginBottom: 14,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 2,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  promptInput: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    color: '#FFFFFF',
    fontSize: 12.5,
  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSparkleIcon: {
    paddingRight: 6,
  },

  // Scroll Area
  scrollArea: {
    flex: 1,
  },
  scrollAreaContent: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 24,
  },

  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingSubtitle: {
    color: '#64748B',
    fontSize: 11,
  },

  // Clinical Card
  clinicalCard: {
    backgroundColor: 'rgba(30, 27, 75, 0.35)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(168, 85, 247, 0.22)',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  clinicalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clinicalMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  clinicalMatchText: {
    color: '#34D399',
    fontSize: 10.5,
    fontWeight: '800',
  },
  clinicalCategoryPill: {
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  clinicalCategoryText: {
    color: '#C084FC',
    fontSize: 10.5,
    fontWeight: '800',
  },
  recHeadline: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  recDoctorBrief: {
    color: '#CBD5E1',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 14,
  },

  // Macro Strip — Vertical stack layout with icon on top
  macroStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 12, 22, 0.7)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  macroCol: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  macroUnit: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  macroDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // Dishes Section
  dishesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dishesTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  comboReadyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  comboReadyTagText: {
    color: '#FBBF24',
    fontSize: 9.5,
    fontWeight: '700',
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderRadius: 18,
    padding: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
    alignItems: 'center',
  },
  dishThumbnail: {
    width: 58,
    height: 58,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dishInfo: {
    flex: 1,
  },
  dishTitleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  dishNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  vegIndicator: {
    width: 13,
    height: 13,
    borderRadius: 3,
    borderWidth: 1.2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  dishItemName: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  dishPriceText: {
    color: '#F97316',
    fontSize: 13.5,
    fontWeight: '900',
  },
  dishCategory: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  dishPortionText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  dishKitchenName: {
    color: '#64748B',
    fontSize: 9.5,
    marginTop: 2,
  },

  // Savings Banner
  savingsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginTop: 4,
    marginBottom: 12,
  },
  savingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  savingsTitle: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  savingsSub: {
    color: '#6EE7B7',
    fontSize: 9.5,
  },
  savingsBadge: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  savingsBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  // Sticky Bottom Checkout Dock
  stickyFooterDock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingBottom: Platform.OS === 'web' ? 18 : 26,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(10, 13, 24, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.09)',
    zIndex: 20,
  },
  footerPriceCol: {
    justifyContent: 'center',
  },
  priceBeforeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  originalPriceText: {
    color: '#64748B',
    fontSize: 11.5,
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  discountPillText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  finalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  finalPriceCurrency: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '800',
  },
  finalPriceAmount: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  totalForItemsText: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '600',
    marginLeft: 4,
  },
  addCartCta: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    zIndex: 100,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
