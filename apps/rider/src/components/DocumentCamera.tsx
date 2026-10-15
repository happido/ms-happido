import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, SafeAreaView, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

interface DocumentCameraProps {
  type: 'selfie' | 'id_card';
  onCapture: (uri: string) => void;
  onCancel: () => void;
}

export default function DocumentCamera({ type, onCapture, onCancel }: DocumentCameraProps) {
  const [facing, setFacing] = useState<CameraType>(type === 'selfie' ? 'front' : 'back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#FFF' }}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={{ color: '#0F172A', fontWeight: 'bold' }}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permissionBtn} onPress={onCancel}>
          <Text style={{ color: '#0F172A', fontWeight: 'bold' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setPhotoUri(photo.uri);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  const handleVerify = async () => {
    if (!photoUri) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      const filename = photoUri.split('/').pop() || 'capture.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore
      formData.append('document', { uri: photoUri, name: filename, type: mimeType });
      formData.append('type', type);

      const res = await api.post('/kyc/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        onCapture(photoUri); // Successfully verified
      }
    } catch (error: any) {
      Alert.alert(
        'AI Check Failed',
        error.response?.data?.message || 'Unable to verify document. Please try again.',
        [{ text: 'Retake Photo', onPress: handleRetake }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#10B981" style={{ transform: [{ scale: 1.5 }] }} />
            <Text style={styles.processingTitle}>Running AI Checks...</Text>
            <Text style={styles.processingSub}>Verifying image clarity and extracting data</Text>
          </View>
        ) : (
          <>
            <Image source={{ uri: photoUri }} style={styles.fullScreenImage} resizeMode="contain" />
            <View style={styles.previewControls}>
              <Text style={styles.previewPrompt}>Is all the information clearly readable?</Text>
              <View style={styles.previewActionRow}>
                <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                  <Text style={styles.retakeBtnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.usePhotoBtn} onPress={handleVerify}>
                  <Text style={styles.usePhotoBtnText}>Looks Good</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={{ padding: 8 }}>
          <Ionicons name="close" size={32} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
          style={{ padding: 8 }}
        >
          <Ionicons name="camera-reverse" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Overlay Mask */}
        <View style={styles.overlayContainer}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddleRow}>
            <View style={styles.overlaySide} />
            <View style={[styles.cutout, type === 'selfie' ? styles.cutoutOval : styles.cutoutRect]} />
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>
            {type === 'selfie' ? 'Take a Selfie' : 'Scan Document'}
          </Text>
          <Text style={styles.instructionsSub}>
            {type === 'selfie' 
              ? 'Position your face inside the oval and ensure good lighting.'
              : 'Fit the document inside the frame. Ensure all text is readable.'}
          </Text>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureBtnInner} onPress={takePicture}>
          <View style={styles.captureBtnOuter} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const overlayColor = 'rgba(0,0,0,0.6)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  permissionBtn: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnOuter: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: '#000',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  overlayMiddleRow: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  cutout: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'transparent',
  },
  cutoutOval: {
    width: 280,
    height: 380,
    borderRadius: 140, // 50% for perfect oval approximation based on width
  },
  cutoutRect: {
    width: 320,
    height: 200,
    borderRadius: 16,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionsTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsSub: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  fullScreenImage: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  previewPrompt: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  retakeBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 16,
  },
  usePhotoBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  usePhotoBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 32,
    marginBottom: 12,
  },
  processingSub: {
    color: '#94A3B8',
    fontSize: 16,
  }
});
