import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  visible: boolean;
  onClose: () => void;
  restaurantName?: string;
}

interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  timeAgo: string;
  orderShortId: string;
  dishTags: string[];
  comment: string;
  restaurantReply?: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    customerName: 'Rahul Verma',
    rating: 5,
    timeAgo: 'Today, 2:15 PM',
    orderShortId: '#9042',
    dishTags: ['Chicken Biryani', 'Extra Spicy'],
    comment: 'The chicken biryani was piping hot and authentic Hyderabadi flavor! Packaging was leakproof too.',
    restaurantReply: 'Thank you so much Rahul! Happy to serve you authentic flavors always! 🙏',
  },
  {
    id: 'r2',
    customerName: 'Deepika Iyer',
    rating: 5,
    timeAgo: 'Yesterday, 8:40 PM',
    orderShortId: '#8891',
    dishTags: ['Paneer Butter Masala', 'Butter Naan'],
    comment: 'Paneer was super soft and gravy had the perfect creaminess. Butter naans arrived warm.',
  },
  {
    id: 'r3',
    customerName: 'Suresh Kumar',
    rating: 4,
    timeAgo: '2 days ago',
    orderShortId: '#8730',
    dishTags: ['Ghee Roast Dosa', 'Filter Coffee'],
    comment: 'Crispy dosa and very aromatic coffee. Chutney could have been slightly thicker, otherwise great breakfast!',
  },
];

export default function CustomerReviewsModal({
  visible,
  onClose,
  restaurantName = 'Happido Kitchen',
}: Props) {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, restaurantReply: replyText.trim() } : r))
    );
    setReplyingToId(null);
    setReplyText('');
    Alert.alert('Reply Sent 💌', 'Your response has been published to the customer!');
  };

  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }}>

      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="star" size={18} color="#EA580C" />
              <Text style={styles.headerTitle}>Customer Ratings & Reviews</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {/* Rating Summary Card */}
            <LinearGradient
              colors={['#FFF7ED', '#FFEDD5']}
              style={styles.summaryCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.scoreBox}>
                <Text style={styles.scoreBig}>4.8</Text>
                <View style={{ flexDirection: 'row', gap: 2, marginVertical: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name="star" size={14} color="#F59E0B" />
                  ))}
                </View>
                <Text style={styles.scoreSub}>256 verified reviews</Text>
              </View>

              {/* Star Distribution Bars */}
              <View style={styles.distributionBox}>
                <View style={styles.distRow}>
                  <Text style={styles.distStar}>5★</Text>
                  <View style={styles.distBarBg}>
                    <View style={[styles.distBarFill, { width: '82%' }]} />
                  </View>
                  <Text style={styles.distPct}>82%</Text>
                </View>

                <View style={styles.distRow}>
                  <Text style={styles.distStar}>4★</Text>
                  <View style={styles.distBarBg}>
                    <View style={[styles.distBarFill, { width: '14%' }]} />
                  </View>
                  <Text style={styles.distPct}>14%</Text>
                </View>

                <View style={styles.distRow}>
                  <Text style={styles.distStar}>3★</Text>
                  <View style={styles.distBarBg}>
                    <View style={[styles.distBarFill, { width: '3%' }]} />
                  </View>
                  <Text style={styles.distPct}>3%</Text>
                </View>

                <View style={styles.distRow}>
                  <Text style={styles.distStar}>2★</Text>
                  <View style={styles.distBarBg}>
                    <View style={[styles.distBarFill, { width: '1%' }]} />
                  </View>
                  <Text style={styles.distPct}>1%</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Top Rated Hero Badges */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>TOP RATED BY CUSTOMERS</Text>
              <View style={styles.heroTagsRow}>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillEmoji}>🍗</Text>
                  <Text style={styles.heroPillText}>Chicken Biryani (4.9★)</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillEmoji}>🥘</Text>
                  <Text style={styles.heroPillText}>Paneer Masala (4.8★)</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillEmoji}>🫓</Text>
                  <Text style={styles.heroPillText}>Butter Naan (4.7★)</Text>
                </View>
              </View>
            </View>

            {/* Reviews Feed */}
            <Text style={styles.feedTitle}>RECENT CUSTOMER FEEDBACK</Text>
            {reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitial}>{rev.customerName[0]}</Text>
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.customerName}>{rev.customerName}</Text>
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#059669" />
                          <Text style={styles.verifiedText}>Order {rev.orderShortId}</Text>
                        </View>
                      </View>
                      <Text style={styles.reviewTime}>{rev.timeAgo}</Text>
                    </View>
                  </View>

                  <View style={styles.starBadge}>
                    <Ionicons name="star" size={11} color="#FFFFFF" />
                    <Text style={styles.starBadgeText}>{rev.rating}.0</Text>
                  </View>
                </View>

                {/* Dish Tags */}
                <View style={styles.dishTagsList}>
                  {rev.dishTags.map((tag, idx) => (
                    <View key={idx} style={styles.dishTagPill}>
                      <Text style={styles.dishTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.reviewComment}>{rev.comment}</Text>

                {/* Restaurant Reply if exists */}
                {rev.restaurantReply ? (
                  <View style={styles.replyBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <Ionicons name="return-down-forward" size={13} color="#EA580C" />
                      <Text style={styles.replyStoreName}>{restaurantName} (Owner Response):</Text>
                    </View>
                    <Text style={styles.replyContent}>{rev.restaurantReply}</Text>
                  </View>
                ) : replyingToId === rev.id ? (
                  <View style={styles.replyInputBox}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Type a polite reply to customer..."
                      placeholderTextColor="#9CA3AF"
                      value={replyText}
                      onChangeText={setReplyText}
                    />
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                      <TouchableOpacity
                        style={styles.quickTemplateBtn}
                        onPress={() => setReplyText('Thank you so much! Glad you enjoyed the meal 😊🙏')}
                      >
                        <Text style={styles.quickTemplateText}>"Thank you 😊"</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.sendReplyBtn}
                        onPress={() => handleSendReply(rev.id)}
                      >
                        <Text style={styles.sendReplyText}>Send</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelReplyBtn}
                        onPress={() => setReplyingToId(null)}
                      >
                        <Text style={styles.cancelReplyText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addReplyBtn}
                    onPress={() => {
                      setReplyingToId(rev.id);
                      setReplyText('');
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={13} color="#EA580C" />
                    <Text style={styles.addReplyText}>Reply to Customer</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  scroll: {
    maxHeight: 520,
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  scoreBox: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#FED7AA',
  },
  scoreBig: {
    fontSize: 32,
    fontWeight: '900',
    color: '#EA580C',
  },
  scoreSub: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  distributionBox: {
    flex: 1,
    paddingLeft: 14,
    gap: 4,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distStar: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
    width: 18,
  },
  distBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#FED7AA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 3,
  },
  distPct: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    width: 26,
    textAlign: 'right',
  },
  heroSection: {
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroPillEmoji: {
    fontSize: 12,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  feedTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  reviewCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EA580C',
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  reviewTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  starBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dishTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  dishTagPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dishTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  reviewComment: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    marginTop: 6,
  },
  replyBox: {
    backgroundColor: '#FFF7ED',
    borderLeftWidth: 3,
    borderLeftColor: '#EA580C',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  replyStoreName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  replyContent: {
    fontSize: 11,
    color: '#7C2D12',
    fontStyle: 'italic',
  },
  addReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 2,
  },
  addReplyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  replyInputBox: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  replyInput: {
    fontSize: 12,
    color: '#111827',
    paddingVertical: 4,
  },
  quickTemplateBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickTemplateText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  sendReplyBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sendReplyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelReplyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cancelReplyText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
