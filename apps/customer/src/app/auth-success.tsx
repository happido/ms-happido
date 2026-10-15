import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AuthSuccessScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();

  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        loop={false}
        style={{
          width: width,
          height: height,
        }}
        source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')}
        onAnimationFinish={() => {
          if (next) {
            router.replace(next as any);
          } else {
            router.replace('/');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
