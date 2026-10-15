import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_URL = 'http://localhost:5005/api'; // Or your actual backend IP (e.g. 10.0.2.2 for Android emulator)

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status >= 400) {
      const message = error.response.data.message || 'An unexpected error occurred';
      if (error.response.status !== 401) {
        // We might not want to toast 401s if we redirect to login silently, but for now we do.
        Alert.alert('Error', message);
      } else {
        Alert.alert('Session Expired', 'Please log in again.');
      }
    } else if (error.request) {
      Alert.alert('Network Error', 'Please check your internet connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
