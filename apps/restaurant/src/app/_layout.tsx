import React, { useState, useEffect } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Platform, Modal, View } from 'react-native';
import { Stack } from 'expo-router';
import LottieView from 'lottie-react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── PUSH NOTIFICATIONS SETUP ────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      // Store token locally so we can send it on login
      await AsyncStorage.setItem('expoPushToken', token);
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.log(e);
    }
  }

  return token;
}

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
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
