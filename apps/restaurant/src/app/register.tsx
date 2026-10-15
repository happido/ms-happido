import React, { useState, useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { View, Text, TextInput, StyleSheet, Image, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../utils/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AnimatedButton } from '@/components/AnimatedButton';

export default function RegisterScreen() {
  const lottieRef = useRef<any>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      lottieRef.current?.play();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // OTP States
  const [showOtp, setShowOtp] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef<Array<TextInput | null>>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    let isValid = true;
    let newErrors: { [key: string]: string } = {};

    if (!name.trim()) { 
      newErrors.name = 'Owner Name is required'; 
      isValid = false; 
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name = 'Name can only contain letters and spaces';
      isValid = false;
    }

    if (!restaurantName.trim()) { 
      newErrors.restaurantName = 'Restaurant Name is required'; 
      isValid = false; 
    }

    if (!email) {
      newErrors.email = 'Email address is required'; 
      isValid = false; 
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { 
      newErrors.email = 'Please enter a valid email address'; 
      isValid = false; 
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required'; 
      isValid = false; 
    } else if (!/^[0-9]{10}$/.test(phone)) { 
      newErrors.phone = 'Phone number must be exactly 10 digits'; 
      isValid = false; 
    }

    if (!password) {
      newErrors.password = 'Password is required'; 
      isValid = false; 
    } else if (password.length < 6) { 
      newErrors.password = 'Password must be at least 6 characters'; 
      isValid = false; 
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const [formError, setFormError] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSendOTP = async () => {
    setFormError('');
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { phone, email, name, role: 'restaurant' });
      setShowOtp(true);
      setOtpError('');
      if (response.data?.devOtp) {
        console.log("⚡ [Dev Instant OTP]:", response.data.devOtp);
      }
      if (Platform.OS !== 'web') {
        Alert.alert('Verification Code Sent', response.data?.message || `OTP sent to +91 ${phone}`);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setFormError(msg);
      if (msg.toLowerCase().includes('already registered')) {
        setErrors(prev => ({ ...prev, phone: msg }));
      }
      if (Platform.OS !== 'web') {
        Alert.alert('Notice', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    setOtpError('');
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otpArray];
    newOtp[index] = cleanText;
    setOtpArray(newOtp);

    // Auto focus next input
    if (cleanText !== '' && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOTPAndRegister = async () => {
    setOtpError('');
    const otp = otpArray.join('');
    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        phone, 
        restaurantName, 
        role: 'restaurant', 
        otp 
      });
      
      if (Platform.OS !== 'web') {
        Alert.alert('Success 🎉', 'Your restaurant account has been registered successfully! Please log in.');
      }
      router.replace({ pathname: '/auth-success', params: { next: '/login' } });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setOtpError(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Registration Failed', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtp) {
    return (
      <View style={styles.container}>
        <View style={StyleSheet.absoluteFill}><View style={{flex: 1, backgroundColor: '#0B0F19'}} /></View>
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />
        
        <Animated.View entering={FadeInDown.delay(100).springify().damping(12)} style={styles.header}>
            <View style={styles.logoContainer}>
              <LottieView ref={lottieRef} 
                source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')} 
                autoPlay loop={false} style={{ width: 110, height: 110, transform: [{ scale: 1.4 }] }} 
              />
            </View>
            <Text style={styles.headerTitle}>Join Partners</Text>
          </Animated.View>
        
        <View style={styles.formContainer}>
          <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.formTitle}>Verification</Animated.Text>
          <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.subtitleText}>Enter the 6-digit code sent to +91 {phone}</Animated.Text>
          
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.otpContainer}>
            {otpArray.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                ref={(input) => {
                  otpInputs.current[index] = input;
                }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && digit === '' && index > 0) {
                    otpInputs.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </Animated.View>

          {otpError ? (
            <Animated.View entering={FadeInDown.springify()} style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={22} color="#EF4444" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.errorBannerText}>{otpError}</Text>
                {otpError.toLowerCase().includes('already registered') ? (
                  <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 6 }}>
                    <Text style={styles.errorBannerLink}>Click here to Sign In instead →</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </Animated.View>
          ) : null}
          
          <Animated.View entering={FadeInDown.delay(500).springify()} style={{ marginTop: otpError ? 20 : 40 }}>
            <AnimatedButton 
              title={isLoading ? 'Verifying...' : 'Verify & Register'}
              colors={['#F97316', '#EA580C']}
              onPress={handleVerifyOTPAndRegister}
              disabled={isLoading}
            />
          </Animated.View>

          <TouchableOpacity 
            style={styles.backToFormBtn} 
            onPress={() => { setShowOtp(false); setOtpError(''); }}
          >
            <Ionicons name="arrow-back" size={16} color="#94A3B8" />
            <Text style={styles.backToFormText}>Change Phone Number</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <style dangerouslySetInnerHTML={{__html: `
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active{
              -webkit-box-shadow: 0 0 0 30px transparent inset !important;
              -webkit-text-fill-color: white !important;
              transition: background-color 5000s ease-in-out 0s;
          }
          input:focus {
              outline: none !important;
          }
        `}} />

      <View style={StyleSheet.absoluteFill}><View style={{flex: 1, backgroundColor: '#0B0F19'}} /></View>
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.delay(100).springify().damping(12)} style={styles.header}>
            <View style={styles.logoContainer}>
              <LottieView ref={lottieRef} 
                source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')} 
                autoPlay loop={false} style={{ width: 140, height: 140, transform: [{ scale: 1.5 }] }} 
              />
            </View>
            <Text style={styles.headerTitle}>Join Partners</Text>
          </Animated.View>

        <View style={styles.formContainer}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.name && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Owner Full Name" placeholderTextColor="#475569" value={name} onChangeText={(val) => {
                const filtered = val.replace(/[^A-Za-z\s]/g, '');
                setName(filtered); 
                setErrors({...errors, name: ''});
              }} />
            </View>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.restaurantName && styles.inputError]}>
              <Ionicons name="restaurant-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Restaurant Name" placeholderTextColor="#475569" value={restaurantName} onChangeText={(val) => {setRestaurantName(val); setErrors({...errors, restaurantName: ''})}} />
            </View>
            {errors.restaurantName ? <Text style={styles.errorText}>{errors.restaurantName}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#475569" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(val) => {setEmail(val); setErrors({...errors, email: ''})}} />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
              <Ionicons name="call-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <Text style={{color: '#FFFFFF', marginRight: 5, fontWeight: '600'}}>+91</Text>
              <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#475569" keyboardType="phone-pad" value={phone} onChangeText={(val) => {
                const filtered = val.replace(/[^0-9]/g, '');
                setPhone(filtered); 
                setErrors({...errors, phone: ''});
              }} maxLength={10} />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Create Password" placeholderTextColor="#475569" secureTextEntry={!showPassword} value={password} onChangeText={(val) => {setPassword(val); setErrors({...errors, password: ''})}} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </Animated.View>

          {formError ? (
            <Animated.View entering={FadeInDown.springify()} style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={22} color="#EF4444" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.errorBannerText}>{formError}</Text>
                {formError.toLowerCase().includes('already registered') ? (
                  <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 6 }}>
                    <Text style={styles.errorBannerLink}>Click here to Sign In instead →</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(700).springify()} style={{ marginTop: formError ? 16 : 24 }}>
            <AnimatedButton 
              title={isLoading ? 'Loading...' : 'Continue'}
              colors={['#F97316', '#EA580C']}
              onPress={handleSendOTP}
              disabled={isLoading}
            />
          </Animated.View>

                    <Animated.View entering={FadeInDown.delay(730).springify().damping(12)} style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(760).springify().damping(12)} style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Coming Soon', 'Google OAuth integration pending')}>
              <Ionicons name="logo-google" size={22} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Coming Soon', 'Apple OAuth integration pending')}>
              <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.footer}>
            <Text style={styles.footerText}>Already registered? </Text>
            <AnimatedButton
              title="Log In"
              colors={['transparent', 'transparent']}
              textStyle={styles.linkText}
              style={styles.linkButton}
              onPress={() => router.push('/login')}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },
  bgGlow1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(234, 88, 12, 0.15)', ...Platform.select({ web: { filter: 'blur(60px)' } }) },
  bgGlow2: { position: 'absolute', bottom: -100, left: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(234, 88, 12, 0.1)', ...Platform.select({ web: { filter: 'blur(50px)' } }) },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: { width: 80, height: 80, backgroundColor: "rgba(30, 41, 59, 0.8)", borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...Platform.select({ web: { boxShadow: '0px 10px 25px rgba(234, 88, 12, 0.4)' }, default: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 } }) },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSmall: { height: 180, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 48, borderBottomRightRadius: 48, paddingTop: 40, overflow: 'hidden', shadowColor: '#EA580C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10, position: 'relative' },
  headerTitleSmall: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  backButton: { position: 'absolute', top: 60, left: 24, padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  formContainer: { flex: 1 },
  formTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  subtitleText: { fontSize: 16, color: '#94A3B8', marginBottom: 40, fontWeight: '500', textAlign: 'center' },
  inputWrapper: { marginBottom: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1.5, borderColor: 'rgba(51, 65, 85, 0.8)' },
  inputError: { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#FFFFFF', fontWeight: '500', backgroundColor: 'transparent' },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 6, marginLeft: 16, fontWeight: '500' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  otpInput: { width: 48, height: 64, backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#FFFFFF', borderWidth: 1.5, borderColor: 'rgba(51, 65, 85, 0.8)' },
  otpInputError: { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    marginBottom: 8,
  },
  errorBannerText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  errorBannerLink: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  backToFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  backToFormText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
  },
  dividerText: {
    color: '#64748B',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(51, 65, 85, 0.6)',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }
    })
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, paddingBottom: 40 },
  footerText: { color: '#94A3B8', fontSize: 15, fontWeight: '500' },
  linkButton: { elevation: 0, shadowOpacity: 0, backgroundColor: 'transparent' },
  linkText: { color: '#EA580C', fontSize: 15, fontWeight: '700' },
});
