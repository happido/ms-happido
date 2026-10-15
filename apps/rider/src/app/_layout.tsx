import React, { useState } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Alert } from 'react-native';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { Stack } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Modal, View } from 'react-native';
import * as Notifications from 'expo-notifications';

// ─── PUSH NOTIFICATIONS SETUP ────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5005');
    
    socket.on('newBloodRequest', (data) => {
      Alert.alert(
        '🚨 URGENT: Blood Needed Nearby!', 
        `${data.requesterName} is urgently requesting ${data.bloodGroup} blood. You are a registered Rider who could help save a life! Urgency: ${data.urgency}`,
        [{ text: 'Navigate to Location', onPress: () => console.log('Navigating') }, { text: 'Cannot Help' }]
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

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
      
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
