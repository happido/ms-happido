import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/utils/api';

export interface MarketingCampaign {
  _id?: string;
  id?: string;
  code: string;
  title: string;
  discount: string;
  minOrder: number;
  ordersDriven: number;
  isActive: boolean;
  tag: string;
  startDate?: string;
  endDate?: string;
}

const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'c1',
    code: 'HAPPIDO50',
    title: '50% OFF Welcome Deal',
    discount: '50% OFF up to ₹100',
    minOrder: 199,
    ordersDriven: 42,
    isActive: true,
    tag: 'Trending',
  },
  {
    id: 'c2',
    code: 'BIRYANI_BOGO',
    title: 'Biryani BOGO Feast',
    discount: 'Buy 1 Handi, Get 1 Free',
    minOrder: 349,
    ordersDriven: 28,
    isActive: true,
    tag: 'Bestseller',
  },
  {
    id: 'c3',
    code: 'FREEDEL',
    title: 'Free Delivery Weekend',
    discount: '100% Delivery Fee Waived',
    minOrder: 249,
    ordersDriven: 15,
    isActive: false,
    tag: 'Volume Driver',
  },
];

export default function MarketingTab() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Web Native Date Input Helper
  const renderDateInput = (value: string, onChange: (val: string) => void, placeholder: string) => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          value={value}
          min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
          onChange={(e: any) => onChange(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            padding: '14px 8px',
            fontSize: '14px',
            color: '#0F172A',
            fontWeight: '600',
            backgroundColor: 'transparent',
            width: '100%',
          }}
        />
      );
    }
    return (
      <TextInput
        style={styles.dateInput}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChange}
      />
    );
  };

  // New Offer Form State
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoMinOrder, setPromoMinOrder] = useState('');
  const [promoTag, setPromoTag] = useState('Trending');
  const [promoStartDate, setPromoStartDate] = useState('');
  const [promoEndDate, setPromoEndDate] = useState('');

  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        const res = await api.get('/restaurants');
        if (res.data && res.data.length > 0) {
          const restaurant = res.data[0];
          if (restaurant.promotions) {
            setCampaigns(restaurant.promotions);
          } else {
            // Seed initial if empty for demo purposes (optional)
            setCampaigns(INITIAL_CAMPAIGNS);
          }
          if (restaurant.adSettings) {
            setIsBoostActive(restaurant.adSettings.isBoostActive);
          }
        }
      } catch (err) {
        console.error('Failed to fetch marketing data', err);
        setCampaigns(INITIAL_CAMPAIGNS);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketingData();
  }, []);

  const toggleCampaign = async (campaign: MarketingCampaign) => {
    const cid = campaign._id || campaign.id;
    const newStatus = !campaign.isActive;
    
    // Optimistic UI update
    setCampaigns((prev) =>
      prev.map((c) => ((c._id || c.id) === cid ? { ...c, isActive: newStatus } : c))
    );

    if (campaign._id) {
      try {
        await api.put(`/restaurants/marketing/promotions/${campaign._id}`, { isActive: newStatus });
      } catch (error) {
        console.error('Failed to update promotion', error);
        // Revert on error
        setCampaigns((prev) =>
          prev.map((c) => ((c._id || c.id) === cid ? { ...c, isActive: !newStatus } : c))
        );
        Alert.alert('Error', 'Failed to update campaign status.');
      }
    }
  };

  const handleBoostToggle = async (val: boolean) => {
    setIsBoostActive(val);
    try {
      await api.put('/restaurants/marketing/boost', { isBoostActive: val });
    } catch (error) {
      console.error('Failed to update boost', error);
      setIsBoostActive(!val);
      Alert.alert('Error', 'Failed to update boost status.');
    }
  };

  const handleCreateCampaign = async () => {
    if (!promoCode || !promoTitle || !promoDiscount || !promoMinOrder) {
      Alert.alert('Missing Fields', 'Please fill in all campaign details.');
      return;
    }
    const newPromo = {
      code: promoCode.toUpperCase(),
      title: promoTitle,
      discount: promoDiscount,
      minOrder: Number(promoMinOrder),
      ordersDriven: 0,
      isActive: true,
      tag: promoTag,
      startDate: promoStartDate,
      endDate: promoEndDate,
    };
    try {
      const res = await api.post('/restaurants/marketing/promotions', newPromo);
      setCampaigns(res.data.promotions);
      setIsCreateModalVisible(false);
      // Reset form
      setPromoCode('');
      setPromoTitle('');
      setPromoDiscount('');
      setPromoMinOrder('');
      setPromoTag('Trending');
      setPromoStartDate('');
      setPromoEndDate('');
    } catch (error) {
      console.error('Failed to create campaign', error);
      Alert.alert('Error', 'Failed to create campaign. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Happido Ads Local Radius Boost Card */}
      <View style={styles.boostCard}>
        <LinearGradient
          colors={['#831843', '#BE185D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.boostGradient}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={styles.boostPill}>
                <Ionicons name="rocket" size={12} color="#FCE7F3" />
                <Text style={styles.boostPillText}>HAPPIDO ADS PREMIUM</Text>
              </View>
              <Text style={styles.boostTitle}>Radius Visibility Boost</Text>
              <Text style={styles.boostSub}>
                Guarantees Top 3 ranking in search results for all customers within 5km delivery radius.
              </Text>
            </View>

            <Switch
              value={isBoostActive}
              onValueChange={handleBoostToggle}
              trackColor={{ false: '#9CA3AF', true: '#F472B6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.boostMetricsRow}>
            <View style={styles.boostMetric}>
              <Text style={styles.boostMetricVal}>+340%</Text>
              <Text style={styles.boostMetricSub}>Search Impressions</Text>
            </View>
            <View style={styles.boostDivider} />
            <View style={styles.boostMetric}>
              <Text style={styles.boostMetricVal}>85 New</Text>
              <Text style={styles.boostMetricSub}>Orders this week</Text>
            </View>
            <View style={styles.boostDivider} />
            <View style={styles.boostMetric}>
              <Text style={styles.boostMetricVal}>4.2x</Text>
              <Text style={styles.boostMetricSub}>ROAS Return</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Promotional Offers Header */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Promotions & Discount Coupons</Text>
          <Text style={styles.sectionSub}>Attract customers and increase repeated orders</Text>
        </View>

        <TouchableOpacity
          style={styles.createPromoBtn}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Ionicons name="add" size={14} color="#FFFFFF" />
          <Text style={styles.createPromoText}>New Offer</Text>
        </TouchableOpacity>
      </View>

      {/* Campaigns List */}
      {campaigns.map((camp) => (
        <View key={camp._id || camp.id} style={styles.campCard}>
          <View style={styles.campLeft}>
            <View style={styles.codeWrap}>
              <Text style={styles.codeText}>{camp.code}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.campTitle}>{camp.title}</Text>
                <View style={styles.campTag}>
                  <Text style={styles.campTagText}>{camp.tag}</Text>
                </View>
              </View>
              <Text style={styles.campDiscount}>{camp.discount}</Text>
              {camp.startDate && camp.endDate && (
                <Text style={{ fontSize: 11, color: '#D97706', fontWeight: 'bold', marginTop: 2 }}>
                  Valid: {camp.startDate} - {camp.endDate}
                </Text>
              )}
              <Text style={styles.campTerms}>Min order value: ₹{camp.minOrder} • {camp.ordersDriven} orders placed</Text>
            </View>
          </View>

          <Switch
            value={camp.isActive}
            onValueChange={() => toggleCampaign(camp)}
            trackColor={{ false: '#FECACA', true: '#A7F3D0' }}
            thumbColor={camp.isActive ? '#059669' : '#DC2626'}
          />
        </View>
      ))}

      {/* Customer Reviews & Quality Score */}
      <View style={styles.reviewsCard}>
        <View style={styles.reviewsHeader}>
          <View>
            <Text style={styles.reviewsTitle}>Kitchen Reputation & Rating</Text>
            <Text style={styles.reviewsSub}>Based on verified customer feedback</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>4.9 ★</Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreVal}>98%</Text>
            <Text style={styles.scoreLabel}>Taste Quality</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreVal}>96%</Text>
            <Text style={styles.scoreLabel}>Packaging Safe</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreVal}>99%</Text>
            <Text style={styles.scoreLabel}>Prep Speed</Text>
          </View>
        </View>

        <View style={styles.reviewComment}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.reviewerName}>Ananya Sharma</Text>
            <Text style={styles.reviewStars}>★★★★★</Text>
          </View>
          <Text style={styles.reviewText}>
            "Hands down the best Hyderabadi Biryani in town. The raita and salan were authentic and fresh!"
          </Text>
        </View>
      </View>
    </ScrollView>

      {/* Premium Create Campaign Modal */}
      {Platform.OS === 'web' ? (
        isCreateModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Campaign</Text>
                <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Promo Code <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. DIWALI50"
                      placeholderTextColor="#94A3B8"
                      value={promoCode}
                      onChangeText={(text) => setPromoCode(text.toUpperCase())}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Campaign Title <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Festive Special"
                      placeholderTextColor="#94A3B8"
                      value={promoTitle}
                      onChangeText={setPromoTitle}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Discount Details <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 50% OFF up to ₹100"
                      placeholderTextColor="#94A3B8"
                      value={promoDiscount}
                      onChangeText={setPromoDiscount}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Minimum Order Value (₹) <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 199"
                      placeholderTextColor="#94A3B8"
                      value={promoMinOrder}
                      onChangeText={setPromoMinOrder}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Valid From</Text>
                      <View style={styles.dateInputContainer}>
                        <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
                        {renderDateInput(promoStartDate, setPromoStartDate, "YYYY-MM-DD")}
                      </View>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Valid Until</Text>
                      <View style={styles.dateInputContainer}>
                        <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
                        {renderDateInput(promoEndDate, setPromoEndDate, "YYYY-MM-DD")}
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Highlight Tag</Text>
                    <View style={styles.tagSelector}>
                      {['Trending', 'Bestseller', 'Volume Driver', 'New', 'Weekend Special', 'Happy Hour', 'Must Try', "Chef's Special"].map(tag => (
                        <TouchableOpacity
                          key={tag}
                          style={[styles.tagPill, promoTag === tag && styles.tagPillActive]}
                          onPress={() => setPromoTag(tag)}
                        >
                          <Text style={[styles.tagPillText, promoTag === tag && styles.tagPillTextActive]}>{tag}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity style={styles.saveBtn} onPress={handleCreateCampaign}>
                    <LinearGradient colors={['#EA580C', '#C2410C']} style={styles.saveBtnGradient}>
                      <Ionicons name="flash" size={18} color="#FFFFFF" />
                      <Text style={styles.saveBtnText}>Launch Campaign</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  boostCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  boostGradient: {
    padding: 18,
  },
  boostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  boostPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  boostTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  boostSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    lineHeight: 16,
  },
  boostMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
  },
  boostMetric: {
    flex: 1,
    alignItems: 'center',
  },
  boostMetricVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  boostMetricSub: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  boostDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  createPromoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  createPromoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  campCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  campLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  codeWrap: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EA580C',
  },
  campTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  campTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  campTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B5563',
  },
  campDiscount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  campTerms: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  reviewsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  reviewsSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  ratingBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  reviewComment: {
    backgroundColor: '#FFF7ED',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
  },
  reviewStars: {
    fontSize: 11,
    color: '#F59E0B',
  },
  reviewText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 15,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    ...Platform.select({ web: { backdropFilter: 'blur(4px)' } as any }),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: '100%',
    maxWidth: 550,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  tagSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  tagPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tagPillTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  saveBtn: {
    marginTop: 10,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 8,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
});
