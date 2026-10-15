import React, { useState } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Alert, Platform } from 'react-native';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { Stack, usePathname, useSegments } from 'expo-router';
import { StripeProvider } from '../utils/stripeWrapper';


import { GlobalProvider } from '@/context/GlobalContext';
import GlobalOverlays from '@/components/GlobalOverlays';
import GlobalHeader from '@/components/GlobalHeader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { View, Modal } from 'react-native';
import LottieView from 'lottie-react-native';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // Other top-level layout effects can go here
  }, []);


  const pathname = usePathname();
  const exactHidePaths = ['/orders', '/map', '/cart', '/checkout', '/search', '/add-address', '/onboarding', '/login', '/register'];
  const segments = useSegments();
  const isAuthRoute = segments.includes('login') || segments.includes('register') || segments.includes('onboarding') || pathname.includes('login') || pathname.includes('register') || pathname.includes('onboarding');
  const shouldHideHeader = exactHidePaths.includes(pathname) || isAuthRoute || segments.includes('restaurant') || pathname.includes('/tracking') || segments.includes('tracking') || pathname.includes('/blood-tracking') || pathname.includes('/volunteer-tracking');

  const appContent = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ErrorBoundary>
        <GlobalProvider>
          {!splashFinished && (
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 99999, elevation: 99999, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
            <LottieView
              source={require('../../assets/animations/HAPPIDO_Logo_Vector (2).json')}
              autoPlay
              loop={false}
              style={{ width: 250, height: 250 }}
              onAnimationFinish={() => setSplashFinished(true)}
            />
          </View>
        )}
          
          <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {!shouldHideHeader && <GlobalHeader />}

            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
            <GlobalOverlays />
          </View>
        </GlobalProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );

  if (Platform.OS === 'web') {
    return appContent;
  }

  return (
    <StripeProvider 
      publishableKey="pk_test_mock"
      merchantIdentifier="merchant.com.mshappido"
    >
      {appContent}
    </StripeProvider>
  );
}
