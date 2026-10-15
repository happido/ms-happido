
import React, { useState, useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { View, Text, TextInput, StyleSheet, Image, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const lottieRef = useRef<any>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      lottieRef.current?.play();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [containerWidth, setContainerWidth] = useState(width);
  const router = useRouter();

  const shakeOffset = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }]
  }));

  const triggerShake = () => {
    setIsError(true);
    shakeOffset.value = withSequence(
      withTiming(-20, { duration: 50 }),
      withRepeat(withTiming(20, { duration: 50 }), 5, true),
      withTiming(0, { duration: 50 })
    );
  };

  const handleLogin = async () => {
    setIsError(false);
    if (!email || !password) {
      triggerShake();
      setTimeout(() => Alert.alert('Hold on', 'Please enter your email/mobile and password'), 400);
      return;
    }
    
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      const expoPushToken = await AsyncStorage.getItem('expoPushToken');

      const response = await api.post('/auth/login', { 
        email: cleanEmail, 
        password: cleanPassword, 
        role: 'restaurant',
        expoPushToken 
      });
      
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('userId', response.data._id);
      if (response.data.restaurantId) {
        await AsyncStorage.setItem('restaurantId', response.data.restaurantId);
      }
      
      router.replace('/'); 
    } catch (error: any) {
      console.log('Login failed:', error.response?.data?.message || error.message);
      triggerShake();
      setTimeout(() => {
        Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
      }, 400);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
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

      <View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
        
        {/* Background Elements */}
        <View style={styles.bgGlow1} />
        <View style={styles.bgGlow2} />

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
          
          <Animated.View entering={FadeInDown.delay(100).springify().damping(12)} style={styles.header}>
            <View style={styles.logoContainer}>
              <LottieView 
                ref={lottieRef}
                source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')} 
                autoPlay 
                loop={false}
                style={{ width: 110, height: 110, transform: [{ scale: 1.4 }] }} 
              />
            </View>
            <Text style={styles.headerTitle}>Happido Partners</Text>
            <Text style={styles.headerSubtitle}>Manage your restaurant</Text>
          </Animated.View>

          <Animated.View style={[styles.formContainer, shakeStyle]}>
            <Animated.View entering={FadeInUp.delay(300).springify().damping(12)} style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email / Mobile Number</Text>
              <View style={[styles.inputContainer, email.length > 0 && styles.inputContainerActive, isError && { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
                <Ionicons name="person" size={20} color={isError ? '#EF4444' : (email.length > 0 ? '#EA580C' : '#64748B')} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email or mobile"
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(val) => { setEmail(val); setIsError(false); }}
                  cursorColor="#EA580C"
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(400).springify().damping(12)} style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, password.length > 0 && styles.inputContainerActive, isError && { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
                <Ionicons name="lock-closed" size={20} color={isError ? '#EF4444' : (password.length > 0 ? '#EA580C' : '#64748B')} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#475569"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => { setPassword(val); setIsError(false); }}
                  cursorColor="#EA580C"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={isError ? '#EF4444' : '#64748B'} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500).springify().damping(12)}>
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600).springify().damping(12)} style={{ marginTop: 24 }}>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#F97316', '#EA580C']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.loginButtonText}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
                {!isLoading && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />}
              </TouchableOpacity>
            </Animated.View>

                        <Animated.View entering={FadeInUp.delay(630).springify().damping(12)} style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(660).springify().damping(12)} style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Coming Soon', 'Google OAuth integration pending')}>
                <Ionicons name="logo-google" size={22} color="#FFFFFF" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Coming Soon', 'Apple OAuth integration pending')}>
                <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(700).springify().damping(12)} style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.linkText}>Register</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0F19', // Deep sleek dark blue
  },
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    ...Platform.select({
      web: { filter: 'blur(60px)' }
    }),
  },
  bgGlow2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    ...Platform.select({
      web: { filter: 'blur(50px)' }
    }),
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 24,
    ...Platform.select({
      web: { boxShadow: '0px 10px 25px rgba(234, 88, 12, 0.4)' },
      default: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 }
    })
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  inputContainerActive: {
    borderColor: 'rgba(234, 88, 12, 0.5)',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#EA580C',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 20px rgba(234, 88, 12, 0.3)',
      },
      default: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
      }
    }),
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
  },
  linkText: {
    color: '#EA580C',
    fontSize: 15,
    fontWeight: '700',
  },
});
