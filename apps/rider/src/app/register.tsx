import React, { useState, useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../utils/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AnimatedButton } from '@/components/AnimatedButton';
import * as ImagePicker from 'expo-image-picker';

const WebCameraView = ({ onCapture, onCancel }: { onCapture: (uri: string) => void, onCancel: () => void }) => {
  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          Alert.alert('Camera Error', 'Could not access the camera. Please check permissions.');
          onCancel();
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleTake = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // We do NOT flip the canvas context here. 
        // We save the un-mirrored (real-world) image so the ID card text is perfectly readable by the system!
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUri);
      }
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={{ flex: 1, backgroundColor: '#000', overflow: 'hidden' }}>
        {Platform.OS === 'web' ? (
          <>
            {/* @ts-ignore */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
            />
            {/* @ts-ignore */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        ) : null}

        {/* Premium KYC Overlay Guide */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '80%', height: '50%', borderWidth: 2, borderColor: 'rgba(16, 185, 129, 0.8)', borderStyle: 'dashed', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 24, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, overflow: 'hidden' }}>
            Position Document & Face in Frame
          </Text>
        </View>
      </View>
      <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
         <TouchableOpacity onPress={onCancel} style={{ padding: 15, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 30 }}>
           <Ionicons name="close" size={30} color="#fff" />
         </TouchableOpacity>
         <TouchableOpacity onPress={handleTake} style={{ width: 72, height: 72, backgroundColor: '#10B981', borderRadius: 36, borderWidth: 4, borderColor: '#fff' }} />
         <View style={{ width: 60 }} />
      </View>
    </View>
  );
};

export default function RegisterScreen() {
  const lottieRef = useRef<any>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      lottieRef.current?.play();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleDetails, setVehicleDetails] = useState('');
  
  const [licenseUrl, setLicenseUrl] = useState('');
  const [rcUrl, setRcUrl] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharUrl, setAadharUrl] = useState('');
  const [riderPanNumber, setRiderPanNumber] = useState('');
  const [riderPanUrl, setRiderPanUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'license' | 'rc' | 'aadhar' | 'pan' | 'profile' | null>(null);
  const [webCameraVisible, setWebCameraVisible] = useState(false);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // OTP States
  const [showOtp, setShowOtp] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [formError, setFormError] = useState('');
  const [otpError, setOtpError] = useState('');
  const otpInputs = useRef<Array<TextInput | null>>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    let isValid = true;
    let newErrors: { [key: string]: string } = {};

    if (!name.trim()) { 
      newErrors.name = 'Full Name is required'; 
      isValid = false; 
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name = 'Name can only contain letters and spaces';
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

  const handleUpload = async (localUri: string, type: 'license' | 'rc' | 'aadhar' | 'pan' | 'profile') => {
    // Instant Preview (Optimistic UI)
    if (type === 'license') {
      setLicenseUrl(localUri);
      setErrors(prev => ({...prev, documents: ''}));
    } else if (type === 'rc') {
      setRcUrl(localUri);
    } else if (type === 'aadhar') {
      setAadharUrl(localUri);
    } else if (type === 'pan') {
      setRiderPanUrl(localUri);
    } else if (type === 'profile') {
      setProfilePhotoUrl(localUri);
    }

    setUploadingImage(true);
    try {
      let filename = 'upload.jpg';
      let fileType = 'image/jpeg';
      
      if (!localUri.startsWith('data:')) {
         filename = localUri.split('/').pop() || 'upload.jpg';
         const match = /\.(\w+)$/.exec(filename);
         if (match) fileType = `image/${match[1]}`;
      }

      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(localUri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        formData.append('file', { uri: localUri, name: filename, type: fileType } as any);
      }

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update with server URL once uploaded
      if (type === 'license') setLicenseUrl(uploadRes.data.url);
      else if (type === 'rc') setRcUrl(uploadRes.data.url);
      else if (type === 'aadhar') setAadharUrl(uploadRes.data.url);
      else if (type === 'pan') setRiderPanUrl(uploadRes.data.url);
      else if (type === 'profile') setProfilePhotoUrl(uploadRes.data.url);
      
    } catch (err) {
      console.log("Upload error", err);
      // We don't alert here to avoid annoying the user if the dev server upload endpoint isn't fully ready, 
      // but the preview will remain visible because of the optimistic update!
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCamera = async () => {
    setPickerModalVisible(false);
    if (!pickerType) return;
    
    if (Platform.OS === 'web') {
      setWebCameraVisible(true);
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required for live verification.');
        return;
      }
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) handleUpload(result.assets[0].uri, pickerType);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGallery = async () => {
    setPickerModalVisible(false);
    if (!pickerType) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) handleUpload(result.assets[0].uri, pickerType);
    } catch (error) {
      console.log(error);
    }
  };

  const pickImage = async (type: 'license' | 'rc' | 'aadhar' | 'pan' | 'profile') => {
    setPickerType(type);
    setPickerModalVisible(true);
  };

  const [isAadharVerifying, setIsAadharVerifying] = useState(false);
  const [isPanVerifying, setIsPanVerifying] = useState(false);
  const [aadharError, setAadharError] = useState('');
  const [panError, setPanError] = useState('');
  const [aadharName, setAadharName] = useState('');
  const [panName, setPanName] = useState('');

  const verifyDigilocker = async (type: 'AADHAR' | 'PAN') => {
    const number = type === 'AADHAR' ? aadharNumber : riderPanNumber;
    
    if (type === 'AADHAR') setAadharError('');
    if (type === 'PAN') setPanError('');

    if (!number) {
      if (type === 'AADHAR') setAadharError(`Please enter your ${type} number first`);
      if (type === 'PAN') setPanError(`Please enter your ${type} number first`);
      return;
    }
    
    type === 'AADHAR' ? setIsAadharVerifying(true) : setIsPanVerifying(true);
    
    try {
      const res = await api.post('/kyc/digilocker-verify', {
        documentType: type,
        documentNumber: number
      });
      
      const { pureDocumentUrl, verifiedName } = res.data.data;
      
      if (type === 'AADHAR') {
        setAadharUrl(pureDocumentUrl);
        setAadharName(verifiedName);
      } else {
        setRiderPanUrl(pureDocumentUrl);
        setPanName(verifiedName);
      }
      // No Alert, we render inline!
    } catch (error: any) {
      const errMsg = error.response?.data?.message || `Failed to verify ${type}`;
      if (type === 'AADHAR') {
        setAadharError(errMsg);
      } else {
        setPanError(errMsg);
      }
    } finally {
      type === 'AADHAR' ? setIsAadharVerifying(false) : setIsPanVerifying(false);
    }
  };

  const handleSendOTP = async () => {
    setFormError('');
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { phone, email, name, role: 'rider' });
      setShowOtp(true);
      setOtpError('');
      if (response.data?.devOtp) {
        console.log("⚡ [Dev Instant OTP]:", response.data.devOtp);
      }
      if (Platform.OS !== 'web') {
        Alert.alert('Verification Code Sent', response.data?.message || `OTP sent to +91 ${phone}`);
      }
    } catch (error: any) {
      console.log("OTP Notice:", error);
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
        vehicleDetails, 
        vehicleType,
        licenseUrl,
        rcUrl,
        profilePhotoUrl,
        aadharNumber,
        aadharUrl,
        riderPanNumber,
        riderPanUrl,
        role: 'rider', 
        otp 
      });
      
      if (Platform.OS !== 'web') {
        Alert.alert('Success 🎉', 'Your rider partner account has been registered successfully! Please log in.');
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
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.bgGlow1} />
        <View style={styles.bgGlow2} />
        
        <Animated.View entering={FadeInDown.delay(100).springify().damping(12)} style={styles.header}>
            <View style={styles.logoContainer}>
              <LottieView ref={lottieRef} 
                source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')} 
                autoPlay loop={false} style={{ width: 110, height: 110, transform: [{ scale: 1.4 }] }} 
              />
            </View>
            <Text style={styles.headerTitle}>Become a Rider</Text>
          </Animated.View>
        
        <View style={styles.formContainer}>
          <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.formTitle}>Verification</Animated.Text>
          <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.subtitleText}>Enter the 6-digit code sent to +91 {phone}</Animated.Text>
          
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.otpContainer}>
            {otpArray.map((digit, index) => (
              <TextInput
                key={index}
                style={[styles.otpInput, otpError ? styles.otpInputError : null]}
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
              colors={['#10B981', '#059669']}
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
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

      <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Become a Rider</Text>
          </Animated.View>

        <View style={styles.formContainer}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.name && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color="#065F46" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#34D399" value={name} onChangeText={(val) => {
                const filtered = val.replace(/[^A-Za-z\s]/g, '');
                setName(filtered); 
                setErrors({...errors, name: ''});
              }} />
            </View>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#065F46" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#34D399" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(val) => {setEmail(val); setErrors({...errors, email: ''})}} />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
              <Ionicons name="call-outline" size={20} color="#065F46" style={styles.inputIcon} />
              <Text style={{color: '#064E3B', marginRight: 5, fontWeight: '600'}}>+91</Text>
              <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#34D399" keyboardType="phone-pad" value={phone} onChangeText={(val) => {
                const filtered = val.replace(/[^0-9]/g, '');
                setPhone(filtered); 
                setErrors({...errors, phone: ''});
              }} maxLength={10} />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.vehicleDetails && styles.inputError]}>
              <Ionicons name="bicycle-outline" size={20} color="#065F46" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Vehicle Details (e.g. Honda Activa, AB12CD3456)" placeholderTextColor="#34D399" value={vehicleDetails} onChangeText={(val) => {setVehicleDetails(val); setErrors({...errors, vehicleDetails: ''})}} />
            </View>
            {errors.vehicleDetails ? <Text style={styles.errorText}>{errors.vehicleDetails}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(550).springify()} style={styles.inputWrapper}>
            <Text style={styles.labelTitle}>Vehicle Type</Text>
            <View style={styles.vehicleSelector}>
              {['bike', 'scooter', 'auto', 'car'].map(type => (
                <TouchableOpacity 
                  key={type} 
                  style={[styles.vehicleBtn, vehicleType === type && styles.vehicleBtnActive]}
                  onPress={() => setVehicleType(type)}
                >
                  <Text style={[styles.vehicleBtnText, vehicleType === type && styles.vehicleBtnTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(580).springify()} style={styles.inputWrapper}>
            <Text style={styles.labelTitle}>Selfie holding ID Card</Text>
            <TouchableOpacity style={[styles.uploadBtn, errors.documents ? styles.inputError : null]} onPress={() => pickImage('profile')}>
              {profilePhotoUrl ? (
                <Image source={{ uri: profilePhotoUrl }} style={styles.uploadedImg} />
              ) : uploadingImage ? (
                <ActivityIndicator color="#10B981" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={28} color="#10B981" style={{marginBottom: 8}} />
                  <Text style={styles.uploadBtnText}>Tap to Upload Selfie with ID</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(585).springify()} style={styles.inputWrapper}>
            <Text style={styles.labelTitle}>Driver License</Text>
            <TouchableOpacity style={[styles.uploadBtn, errors.documents ? styles.inputError : null]} onPress={() => pickImage('license')}>
              {licenseUrl ? (
                <Image source={{ uri: licenseUrl }} style={styles.uploadedImg} />
              ) : uploadingImage ? (
                <ActivityIndicator color="#10B981" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={28} color="#10B981" style={{marginBottom: 8}} />
                  <Text style={styles.uploadBtnText}>Tap to Upload License</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(590).springify()} style={styles.inputWrapper}>
            <Text style={styles.labelTitle}>Vehicle RC</Text>
            <TouchableOpacity style={[styles.uploadBtn, errors.documents ? styles.inputError : null]} onPress={() => pickImage('rc')}>
              {rcUrl ? (
                <Image source={{ uri: rcUrl }} style={styles.uploadedImg} />
              ) : uploadingImage ? (
                <ActivityIndicator color="#10B981" />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={28} color="#10B981" style={{marginBottom: 8}} />
                  <Text style={styles.uploadBtnText}>Tap to Upload RC</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(595).springify()} style={styles.inputWrapper}>
            <Text style={styles.labelTitle}>Aadhar Card</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput style={[styles.input, {flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0}, aadharError ? { borderWidth: 1, borderColor: '#EF4444' } : null]} placeholder="Aadhar Number" placeholderTextColor="#34D399" value={aadharNumber} onChangeText={(val) => {setAadharNumber(val); setAadharError('');}} keyboardType="number-pad" maxLength={12} editable={!aadharUrl} />
              <TouchableOpacity 
                style={{backgroundColor: aadharUrl ? '#10B981' : '#065F46', paddingHorizontal: 16, height: 60, justifyContent: 'center', borderTopRightRadius: 16, borderBottomRightRadius: 16}}
                onPress={() => aadharUrl ? null : verifyDigilocker('AADHAR')}
                disabled={isAadharVerifying || !!aadharUrl}
              >
                {isAadharVerifying ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{color: '#FFF', fontWeight: 'bold'}}>{aadharUrl ? 'Verified ✓' : 'Verify'}</Text>}
              </TouchableOpacity>
            </View>
            {!!aadharError && <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: '500'}}>{aadharError}</Text>}
            {aadharUrl ? (
              <View style={{marginTop: 12, padding: 12, backgroundColor: '#ECFDF5', borderRadius: 8, borderWidth: 1, borderColor: '#10B981', flexDirection: 'row', alignItems: 'center'}}>
                <Image source={{uri: aadharUrl}} style={{width: 60, height: 40, borderRadius: 4, marginRight: 12}} />
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 10, color: '#059669', fontWeight: 'bold', textTransform: 'uppercase'}}>✅ DigiLocker Certified</Text>
                  <Text style={{fontSize: 14, color: '#064E3B', fontWeight: 'bold', marginTop: 2}}>{aadharName}</Text>
                  {name && aadharName && name.toLowerCase().trim() === aadharName.toLowerCase().trim() ? (
                    <Text style={{fontSize: 11, color: '#10B981', fontWeight: 'bold', marginTop: 2}}>Name matches Aadhar ✓</Text>
                  ) : null}
                </View>
              </View>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(598).springify()} style={styles.inputWrapper}>
            <Text style={styles.labelTitle}>PAN Card</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput style={[styles.input, {flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0}, panError ? { borderWidth: 1, borderColor: '#EF4444' } : null]} placeholder="PAN Number" placeholderTextColor="#34D399" value={riderPanNumber} onChangeText={(val) => {setRiderPanNumber(val); setPanError('');}} autoCapitalize="characters" maxLength={10} editable={!riderPanUrl} />
              <TouchableOpacity 
                style={{backgroundColor: riderPanUrl ? '#10B981' : '#065F46', paddingHorizontal: 16, height: 60, justifyContent: 'center', borderTopRightRadius: 16, borderBottomRightRadius: 16}}
                onPress={() => riderPanUrl ? null : verifyDigilocker('PAN')}
                disabled={isPanVerifying || !!riderPanUrl}
              >
                {isPanVerifying ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{color: '#FFF', fontWeight: 'bold'}}>{riderPanUrl ? 'Verified ✓' : 'Verify'}</Text>}
              </TouchableOpacity>
            </View>
            {!!panError && <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: '500'}}>{panError}</Text>}
            {riderPanUrl ? (
              <View style={{marginTop: 12, padding: 12, backgroundColor: '#ECFDF5', borderRadius: 8, borderWidth: 1, borderColor: '#10B981', flexDirection: 'row', alignItems: 'center'}}>
                <Image source={{uri: riderPanUrl}} style={{width: 60, height: 40, borderRadius: 4, marginRight: 12}} />
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 10, color: '#059669', fontWeight: 'bold', textTransform: 'uppercase'}}>✅ SurePass Certified</Text>
                  <Text style={{fontSize: 14, color: '#064E3B', fontWeight: 'bold', marginTop: 2}}>{panName}</Text>
                  {name && panName && name.toLowerCase().trim() === panName.toLowerCase().trim() ? (
                    <Text style={{fontSize: 11, color: '#10B981', fontWeight: 'bold', marginTop: 2}}>Name matches PAN ✓</Text>
                  ) : null}
                </View>
              </View>
            ) : null}
            {errors.documents ? <Text style={styles.errorText}>{errors.documents}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.inputWrapper}>
            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#065F46" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Create Password" placeholderTextColor="#34D399" secureTextEntry={!showPassword} value={password} onChangeText={(val) => {setPassword(val); setErrors({...errors, password: ''})}} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#065F46" />
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
              colors={['#10B981', '#059669']}
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
              title="Sign In"
              colors={['transparent', 'transparent']}
              textStyle={styles.linkText}
              style={styles.linkButton}
              onPress={() => router.push('/login')}
            />
          </Animated.View>
        </View>
      </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={pickerModalVisible}
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Upload Document</Text>
            <Text style={styles.modalSubtitle}>For pure document verification, please take a clear live photo.</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={handleCamera}>
              <Ionicons name="camera" size={24} color="#10B981" style={styles.modalButtonIcon} />
              <Text style={styles.modalButtonText}>Take Photo (Camera)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={handleGallery}>
              <Ionicons name="images" size={24} color="#10B981" style={styles.modalButtonIcon} />
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setPickerModalVisible(false)}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={webCameraVisible}
        onRequestClose={() => setWebCameraVisible(false)}
      >
        <View style={[{ flex: 1, backgroundColor: '#0B0F19' }, Platform.select({ web: { maxWidth: 450, width: '100%', alignSelf: 'center' } })]}>
          <WebCameraView 
            onCancel={() => setWebCameraVisible(false)}
            onCapture={(uri) => {
              setWebCameraVisible(false);
              if (pickerType) handleUpload(uri, pickerType);
            }}
          />
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0F19' },
  container: { flex: 1, position: 'relative', overflow: 'hidden', ...Platform.select({ web: { maxWidth: 480, width: '100%', marginHorizontal: 'auto' } }) },
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
  input: { flex: 1, fontSize: 16, color: '#FFFFFF', fontWeight: '500', outlineStyle: 'none' as any, backgroundColor: 'transparent' },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 6, marginLeft: 16, fontWeight: '500' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  otpInput: { width: 48, height: 64, backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#FFFFFF', borderWidth: 1.5, borderColor: 'rgba(51, 65, 85, 0.8)', outlineStyle: 'none' as any },
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
    color: '#10B981',
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
  linkText: { color: '#10B981', fontSize: 15, fontWeight: '700' },
  labelTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 12, marginLeft: 4 },
  vehicleSelector: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  vehicleBtn: { flex: 1, height: 48, backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(51, 65, 85, 0.8)', justifyContent: 'center', alignItems: 'center' },
  vehicleBtnActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' },
  vehicleBtnText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  vehicleBtnTextActive: { color: '#10B981', fontWeight: '800' },
  uploadBtn: { height: 120, backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(51, 65, 85, 0.8)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  uploadBtnText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  uploadedImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderWidth: 1, borderColor: 'rgba(51, 65, 85, 0.8)', borderBottomWidth: 0, width: '100%', ...Platform.select({ web: { maxWidth: 480 } }) },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { color: '#94A3B8', fontSize: 14, marginBottom: 24, textAlign: 'center', fontWeight: '500' },
  modalButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(51, 65, 85, 0.8)' },
  modalButtonIcon: { marginRight: 16, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 10, borderRadius: 12 },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalCancelButton: { alignItems: 'center', padding: 16, marginTop: 4, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  modalCancelButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});
