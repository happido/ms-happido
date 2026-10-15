import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, Modal, TextInput, KeyboardAvoidingView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import Animated, { FadeInDown, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import BottomNav from '../components/BottomNav';


// Happido Brand Colors
const HAPPIDO_ORANGE = '#EA580C';
const HAPPIDO_BLACK = '#1C1C1C';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [vehicleType, setVehicleType] = useState('bike');
  const [passActiveUntil, setPassActiveUntil] = useState<string | null>(null);
  const [autoRenewPass, setAutoRenewPass] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Time');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({ visible: false, type: 'add', title: '', desc: '' });
  const [amountInput, setAmountInput] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const res = await api.get('/wallet');
      setBalance(res.data.balance);
      setVehicleType(res.data.vehicleType || 'bike');
      setPassActiveUntil(res.data.dailyPassActiveUntil || null);
      setAutoRenewPass(res.data.autoRenewPass || false);
      setTransactions(res.data.transactions || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (balance <= 0) {
      Alert.alert('Invalid', 'No funds available to withdraw');
      return;
    }
    setAmountInput('');
    setModalConfig({
      visible: true,
      type: 'withdraw',
      title: 'Withdraw Funds',
      desc: `Available balance: ₹${balance.toFixed(2)}`
    });
  };

  const processWithdrawal = async (amount: number) => {
    setIsWithdrawing(true);
    setModalConfig({ ...modalConfig, visible: false });
    try {
      const res = await api.post('/wallet/withdraw', { amount });
      setBalance(res.data.balance);
      fetchWalletData(); // Refresh list
      Alert.alert('Success', `Successfully withdrew ₹${amount} to your bank account!`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleBuyPass = () => {
    setModalConfig({
      visible: true,
      type: 'buyPass',
      title: 'Activate Daily Pass',
      desc: 'This will deduct ₹30 from your wallet and activate your 0% commission pass for today.'
    });
  };

  const processBuyPass = async () => {
    setModalConfig({ ...modalConfig, visible: false });
    try {
      const res = await api.post('/wallet/buy-pass');
      setBalance(res.data.balance);
      setPassActiveUntil(res.data.dailyPassActiveUntil);
      fetchWalletData();
      Alert.alert('Success', 'Your Daily Pass is now active! 0% Commission for all rides today.');
    } catch (error: any) {
      Alert.alert('Failed', error.response?.data?.message || 'Could not buy pass.');
    }
  };

  const handleAddFunds = () => {
    setAmountInput('30');
    setModalConfig({
      visible: true,
      type: 'add',
      title: 'Add Funds to Wallet',
      desc: 'Enter amount to add via UPI'
    });
  };
  
  const processAddFunds = async (amount: number) => {
    setModalConfig({ ...modalConfig, visible: false });
    try {
      const res = await api.post('/wallet/add-funds', { amount });
      setBalance(res.data.balance);
      fetchWalletData();
      Alert.alert('Success', `Successfully added ₹${amount} to your wallet!`);
    } catch (error: any) {
      Alert.alert('Failed', error.response?.data?.message || 'Could not add funds.');
    }
  };

  const toggleAutoPay = async () => {
    try {
      const res = await api.post('/wallet/autopay');
      setAutoRenewPass(res.data.autoRenewPass);
    } catch (error) {
      Alert.alert('Error', 'Could not update AutoPay preference');
    }
  };

  const submitModal = () => {
    if (modalConfig.type === 'buyPass') {
      processBuyPass();
      return;
    }

    const amount = parseFloat(amountInput || '0');
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (modalConfig.type === 'withdraw') {
      if (amount > balance) {
        Alert.alert('Error', 'Insufficient balance for this withdrawal.');
        return;
      }
      processWithdrawal(amount);
    } else {
      processAddFunds(amount);
    }
  };

  const renderTransaction = ({ item }: { item: any }) => {
    const isCredit = item.type === 'credit';
    return (
      <View style={styles.transactionCard}>
        <View style={styles.txLeft}>
          <View style={[styles.iconBox, { backgroundColor: isCredit ? '#ECFDF5' : '#FEF2F2' }]}>
            <Ionicons name={isCredit ? 'arrow-down' : 'arrow-up'} size={20} color={isCredit ? '#10B981' : '#EF4444'} />
          </View>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.txTitle} numberOfLines={1} ellipsizeMode="tail">{item.description}</Text>
            <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}</Text>
          </View>
        </View>
        <Text style={[styles.txAmount, { color: isCredit ? '#10B981' : '#1E293B' }]}>
          {isCredit ? '+' : '-'}₹{item.amount}
        </Text>
      </View>
    );
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.createdAt);
      let timeMatch = true;
      if (activeFilter === 'Today') {
        timeMatch = tDate.getDate() === now.getDate() && tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      } else if (activeFilter === 'This Week') {
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        timeMatch = tDate >= startOfWeek;
      } else if (activeFilter === 'This Month') {
        timeMatch = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }

      let typeMatch = true;
      if (typeFilter === 'Withdrawals') {
        typeMatch = t.type === 'debit';
      } else if (typeFilter === 'Recharges') {
        typeMatch = t.type === 'credit';
      }

      return timeMatch && typeMatch;
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LottieView 
          source={require('../../assets/loading.json')} 
          autoPlay 
          loop 
          style={{ width: 120, height: 120 }} 
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings & Wallet</Text>
        <View style={{width: 44}} />
      </View>

      <Animated.View entering={FadeInDown.duration(400)} style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
        </View>
        <Text style={styles.balanceValue}>₹{balance.toFixed(2)}</Text>
        
        <View style={styles.walletActionsRow}>
          <TouchableOpacity onPress={handleAddFunds} style={styles.walletActionBtn}>
            <Ionicons name="add-circle" size={20} color="#1E293B" />
            <Text style={styles.walletActionText}>Add Funds</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleWithdraw} disabled={isWithdrawing} style={styles.walletActionBtn}>
            {isWithdrawing ? <ActivityIndicator size="small" color="#1E293B" /> : <Ionicons name="arrow-down-circle" size={20} color="#1E293B" />}
            <Text style={styles.walletActionText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {(vehicleType === 'bike' || vehicleType === 'auto') && (<>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.dailyPassCard}>
          <View style={styles.dailyPassLeft}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
              <Ionicons name="star" size={20} color="#F59E0B" style={{marginRight: 6}} />
              <Text style={styles.dailyPassTitle}>0% Commission Pass</Text>
            </View>
            <Text style={styles.dailyPassSub}>Keep 100% of your earnings today.</Text>
          </View>
          
          <View style={styles.dailyPassRight}>
            {(!passActiveUntil || new Date(passActiveUntil) < new Date()) ? (
              <TouchableOpacity style={styles.buyPassBtn} onPress={handleBuyPass}>
                <Text style={styles.buyPassText}>Buy for ₹30</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.activePassBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" style={{marginRight: 4}} />
                <Text style={styles.activePassText}>Active Today</Text>
              </View>
            )}
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.autoPayCard}>
          <View>
            <Text style={styles.autoPayTitle}>Smart AutoPay</Text>
            <Text style={styles.autoPaySub}>Auto-renew daily pass when you go online.</Text>
          </View>
          <Switch
            trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            thumbColor={'#FFF'}
            onValueChange={toggleAutoPay}
            value={autoRenewPass}
          />
        </Animated.View>
      </>)}

      <View style={styles.transactionsContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={{color: '#4F46E5', fontWeight: '800', fontSize: 14}}>View Past Trips</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, zIndex: 10 }}>
          
          {/* Time Dropdown */}
          <View style={{ position: 'relative' }}>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => { setShowTimeDropdown(!showTimeDropdown); setShowTypeDropdown(false); }}>
              <Text style={styles.dropdownBtnText}>{activeFilter}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
            {showTimeDropdown && (
              <View style={styles.dropdownMenu}>
                {['All Time', 'Today', 'This Week', 'This Month', 'Custom'].map(item => (
                  <TouchableOpacity key={item} style={[styles.dropdownItem, activeFilter === item && styles.dropdownItemActive]} onPress={() => { setActiveFilter(item); setShowTimeDropdown(false); }}>
                    <Text style={[styles.dropdownItemText, activeFilter === item && styles.dropdownItemTextActive]}>{item}</Text>
                    {activeFilter === item && <Ionicons name="checkmark" size={16} color="#EA580C" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {/* Type Dropdown */}
          <View style={{ position: 'relative' }}>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => { setShowTypeDropdown(!showTypeDropdown); setShowTimeDropdown(false); }}>
              <Text style={styles.dropdownBtnText}>{typeFilter}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
            {showTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {['All Types', 'Withdrawals', 'Recharges'].map(item => (
                  <TouchableOpacity key={item} style={[styles.dropdownItem, typeFilter === item && styles.dropdownItemActive]} onPress={() => { setTypeFilter(item); setShowTypeDropdown(false); }}>
                    <Text style={[styles.dropdownItemText, typeFilter === item && styles.dropdownItemTextActive]}>{item}</Text>
                    {typeFilter === item && <Ionicons name="checkmark" size={16} color="#EA580C" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {(showTimeDropdown || showTypeDropdown) && (
          <TouchableOpacity 
            style={[StyleSheet.absoluteFill, { zIndex: 5 }]} 
            onPress={() => { setShowTimeDropdown(false); setShowTypeDropdown(false); }} 
            activeOpacity={1}
          />
        )}

        {getFilteredTransactions().length === 0 ? (
          <Text style={styles.emptyText}>No transactions found</Text>
        ) : (
          <FlatList
            data={getFilteredTransactions()}
            keyExtractor={item => item._id}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
      <BottomNav />

      {/* Custom Premium Modal for Amounts */}
      {modalConfig.visible && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 1000, elevation: 1000 }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContentWrapper}>
              <Animated.View entering={SlideInDown.duration(300)} exiting={SlideOutDown.duration(200)} style={styles.modalContent}>
                <View style={styles.modalDragIndicator} />
                
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{modalConfig.title}</Text>
                  <TouchableOpacity onPress={() => setModalConfig({ ...modalConfig, visible: false })}>
                    <Ionicons name="close-circle" size={28} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalDesc}>{modalConfig.desc}</Text>
              
              {modalConfig.type !== 'buyPass' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amountInput}
                    onChangeText={setAmountInput}
                    keyboardType="numeric"
                    autoFocus={true}
                    placeholder="0"
                    placeholderTextColor="#CBD5E1"
                  />
                </View>
              )}

              <TouchableOpacity style={styles.modalBtn} onPress={submitModal}>
                <Text style={styles.modalBtnText}>
                  {modalConfig.type === 'add' ? 'Confirm & Add' : 
                   modalConfig.type === 'withdraw' ? 'Withdraw Now' : 'Buy Now (₹30)'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  balanceHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  balanceCard: {
    backgroundColor: '#0F172A',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8,
  },
  balanceLabel: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 24,
    alignSelf: 'flex-start',
    letterSpacing: -1,
  },
  walletActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  walletActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: HAPPIDO_ORANGE,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: HAPPIDO_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  walletActionText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 6,
  },
  dailyPassCard: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dailyPassLeft: {
    flex: 1,
    paddingRight: 12,
  },
  dailyPassRight: {
    justifyContent: 'center',
  },
  dailyPassTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
  },
  dailyPassSub: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '500',
  },
  buyPassBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  buyPassText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  activePassBadge: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  activePassText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  autoPayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  autoPayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  autoPaySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 160,
    zIndex: 100,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: '#FFF7ED',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  dropdownItemTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  transactionsContainer: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 13,
    color: '#64748B',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 40,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  modalDragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalDesc: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: HAPPIDO_ORANGE,
    paddingBottom: 8,
    marginBottom: 32,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
  modalBtn: {
    backgroundColor: HAPPIDO_ORANGE,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: HAPPIDO_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  }
});
