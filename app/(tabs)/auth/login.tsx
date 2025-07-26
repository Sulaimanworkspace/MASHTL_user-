import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useRef, useCallback } from 'react';
import { Image, Keyboard, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Modal, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { login, sendOTP, verifyOTP, storeUserData } from '../../services/api';
import webSocketService from '../../services/websocket';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPushToken } from '../../utils/pushToken';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState<string>('unknown');
  const [showRetry, setShowRetry] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Clear form data when screen is focused for security
  useFocusEffect(
    useCallback(() => {
      setPhone('');
      setPassword('');
      setOtp(['', '', '', '', '', '']);
      setErrors({});
      setShowOTPModal(false);
      setShowPassword(false);
      setLoading(false);
      setOtpLoading(false);
    }, [])
  );

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Phone validation - must start with 5 and be exactly 9 digits
    if (!phone) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^5\d{8}$/.test(phone)) {
      if (!phone.startsWith('5')) {
        newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ 5';
      } else if (phone.length !== 9) {
        newErrors.phone = 'رقم الهاتف يجب أن يكون 9 أرقام';
      } else {
        newErrors.phone = 'رقم الهاتف غير صحيح';
      }
    }

    // Password validation
    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/\D/g, '');
    
    // If first digit is not 5, don't allow it
    if (digitsOnly.length > 0 && digitsOnly[0] !== '5') {
      return; // Don't update state if first digit is not 5
    }
    
    // Limit to 9 characters
    const cleaned = digitsOnly.substring(0, 9);
    setPhone(cleaned);
    
    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fullPhone = `+966${phone}`;
      
      // First verify credentials
      await login(fullPhone, password);
      
      // Then send OTP for login
      const otpResult = await sendOTP(fullPhone, 'login');
      
      // Store session ID for OTP verification
      if (otpResult.sessionId) {
        setSessionId(otpResult.sessionId);
      }
      
      // Show OTP modal
      setShowOTPModal(true);
      
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'فشل في تسجيل الدخول' });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next input when digit is entered
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto focus previous input when digit is deleted
    if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  async function forceRegisterPushToken() {
          console.log('🔔 forceRegisterPushToken: Starting push token registration...');
      // debugLogger.log('Starting push token registration...', 'info');
      try {
        console.log('🔔 forceRegisterPushToken: Checking existing permissions...');
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('🔔 forceRegisterPushToken: Existing status:', existingStatus);
        // debugLogger.log(`Permission status: ${existingStatus}`, 'info');
      
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        console.log('🔔 forceRegisterPushToken: Requesting permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('🔔 forceRegisterPushToken: New permission status:', status);
      }
      
      setNotifStatus(finalStatus);
      if (finalStatus !== 'granted') {
        console.log('❌ forceRegisterPushToken: Permission denied');
        Alert.alert('تنبيه', 'يجب تفعيل الإشعارات من الإعدادات لتلقي التنبيهات.', [
          { text: 'حاول مرة أخرى', onPress: forceRegisterPushToken },
          { text: 'إغلاق', style: 'cancel' }
        ]);
        setShowRetry(true);
        setPushToken(null);
        return null;
      }
      
              console.log('🔔 forceRegisterPushToken: Getting push token...');
        // debugLogger.log('Getting push token...', 'info');
        const token = await getPushToken();
        console.log('🔔 forceRegisterPushToken: Generated token:', token);
        // debugLogger.log(`Token generated: ${token ? 'YES' : 'NO'}`, token ? 'success' : 'error');
      
      setPushToken(token);
      setShowRetry(false);
      console.log('✅ forceRegisterPushToken: Successfully generated push token');
      return token;
    } catch (e) {
      console.log('❌ forceRegisterPushToken: Error occurred:', e);
      setShowRetry(true);
      setPushToken(null);
      setNotifStatus('error');
      return null;
    }
  }

  const handleVerifyOTP = async () => {
    console.log('🔔 handleVerifyOTP: Starting OTP verification...');
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      console.log('❌ handleVerifyOTP: Invalid OTP length:', otpCode.length);
      setErrors({ otp: 'يرجى إدخال رمز التحقق كاملاً' });
      return;
    }

    console.log('🔔 handleVerifyOTP: OTP code:', otpCode);
    setOtpLoading(true);
    try {
      const fullPhone = `+966${phone}`;
      console.log('🔔 handleVerifyOTP: Verifying OTP for phone:', fullPhone);
      await verifyOTP(fullPhone, otpCode, sessionId, 'login');
      console.log('✅ handleVerifyOTP: OTP verified successfully');
      
      // Get user data after successful login verification
      console.log('🔔 handleVerifyOTP: Attempting login...');
      const loginResult = await login(fullPhone, password);
      console.log('🔔 handleVerifyOTP: Login result:', loginResult);
      
      if (loginResult.success && loginResult.user) {
        console.log('✅ handleVerifyOTP: Login successful, storing user data...');
        await storeUserData(loginResult.user);
        
        // Register push token after login
        console.log('🔔 handleVerifyOTP: Starting push token registration...');
        const expoPushToken = await forceRegisterPushToken();
        
        if (!expoPushToken) {
          console.log('⚠️ handleVerifyOTP: Push token not generated. User will not receive push notifications.');
          // Optionally show a non-blocking warning to the user here
        } else {
          // Send push token to backend
          console.log('🔔 handleVerifyOTP: Sending push token to backend after login:', expoPushToken);
          // debugLogger.log('Sending push token to backend...', 'info');
          try {
            // debugLogger.log(`Using token: ${loginResult.user.token ? 'YES' : 'NO'}`, 'info');
            // debugLogger.log(`Target URL: http://172.20.10.12:9090/api/auth/push-token`, 'info');
            
            const response = await fetch('http://172.20.10.12:9090/api/auth/push-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginResult.user.token}`
              },
              body: JSON.stringify({ pushToken: expoPushToken })
            });
            
            // debugLogger.log(`Response status: ${response.status}`, 'info');
            
            if (response.ok) {
              const responseData = await response.json();
              console.log('✅ handleVerifyOTP: Push token sent to backend successfully after login');
              // debugLogger.log('Push token sent to backend successfully!', 'success');
              // debugLogger.log(`Response: ${JSON.stringify(responseData)}`, 'info');
            } else {
              const errorData = await response.text();
              console.log('❌ handleVerifyOTP: Failed to send push token to backend after login:', response.status);
              // debugLogger.log(`Failed to send push token: ${response.status}`, 'error');
              // debugLogger.log(`Error response: ${errorData}`, 'error');
            }
          } catch (error: any) {
            console.log('❌ handleVerifyOTP: Error sending push token to backend after login:', error);
            // debugLogger.log(`Error: ${error.message || 'Unknown error'}`, 'error');
            // debugLogger.log(`Error type: ${error.name}`, 'error');
          }
        }
        
        // Initialize WebSocket for the new user
        console.log('🔔 handleVerifyOTP: Initializing WebSocket...');
        await webSocketService.initialize(loginResult.user._id);
      }
      
      // Success - navigate to home
      console.log('✅ handleVerifyOTP: Login process completed, navigating to home...');
      setShowOTPModal(false);
      router.replace('/(tabs)/Home');
      
    } catch (error: any) {
      console.log('❌ handleVerifyOTP: Error during OTP verification:', error);
      setErrors({ otp: error.response?.data?.message || 'رمز التحقق غير صحيح' });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#222" />
        <View style={styles.container}>
          <Image source={require('../../../assets/images/icon.jpg')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>تسجيل الدخول</Text>
          
          <View style={styles.phoneContainer}>
            <TextInput
              style={[styles.phoneInput, errors.phone && styles.inputError]}
              placeholder="5xxxxxxxxx"
              value={phone}
              onChangeText={handlePhoneChange}
              placeholderTextColor="#BDBDBD"
              keyboardType="phone-pad"
              textAlign="right"
              maxLength={9}
            />
            <Text style={styles.phonePrefix}>+966</Text>
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, paddingLeft: 50 }, errors.password && styles.inputError]}
              placeholder="كلمة المرور"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholderTextColor="#BDBDBD"
              secureTextEntry={!showPassword}
              textAlign="right"
            />
            <TouchableOpacity 
              style={styles.eyeIconLeft}
              onPress={() => setShowPassword(!showPassword)}
            >
              <FontAwesome 
                name={showPassword ? 'eye' : 'eye-slash'} 
                size={18} 
                color="#888" 
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => router.push('./signup')}>
            <Text style={styles.buttonText}>إنشاء حساب جديد</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => router.push('/(tabs)/Home')}>
            <Text style={styles.buttonText}>متابعة من دون تسجيل الدخول</Text>
          </TouchableOpacity>
                  {/*Disabled Log view*/}
          {/*<TouchableOpacity style={[styles.button, { backgroundColor: '#FF9800', marginTop: 8 }]} onPress={() => router.push('/debug-logger')}>*/}
          {/*  <Text style={styles.buttonText}>View Debug Logs</Text>*/}
          {/*</TouchableOpacity>*/}
        </View>

        {/* OTP Modal */}
        <Modal
          visible={showOTPModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOTPModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>رمز التحقق</Text>
              <Text style={styles.modalSubtitle}>أدخل الرمز المرسل إلى رقمك</Text>
              
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { otpRefs.current[index] = ref; }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(value) => handleOTPChange(value, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    autoFocus={index === 0}
                  />
                ))}
              </View>
              
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
              
              <TouchableOpacity
                style={[styles.button, otpLoading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={otpLoading}
              >
                <Text style={styles.buttonText}>
                  {otpLoading ? 'جاري التحقق...' : 'تحقق'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowOTPModal(false)}
              >
                <Text style={styles.buttonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
    marginTop: 8,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#33691E',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 14,
    color: '#222',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF5252',
    backgroundColor: '#FFEBEE',
  },
  phoneContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 14,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
    textAlign: 'right',
  },
  phonePrefix: {
    paddingLeft: 16,
    paddingRight: 8,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  passwordRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  passwordIcon: {
    fontSize: 18,
    marginLeft: 8,
    color: '#888',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  eyeIconLeft: {
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    zIndex: 1,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    textAlign: 'right',
    width: '100%',
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 0,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  signupButton: {
    backgroundColor: '#388E3C',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#33691E',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
  },
  otpInput: {
    width: 45,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  cancelButton: {
    backgroundColor: '#757575',
    marginTop: 12,
  },
}); 