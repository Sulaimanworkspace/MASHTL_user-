import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useRef } from 'react';
import { Image, Keyboard, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Modal } from 'react-native';
import { registerUser, sendOTP, verifyOTP, storeUserData } from '../../services/api';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Clear form when screen is focused (when user enters the page)
  useFocusEffect(
    useCallback(() => {
      setName('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      setLoading(false);
      setShowOTPModal(false);
      setOtp(['', '', '', '', '', '']);
      setOtpLoading(false);
    }, [])
  );

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

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

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
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

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setErrors({ otp: 'يرجى إدخال رمز التحقق كاملاً' });
      return;
    }

    setOtpLoading(true);
    try {
      const fullPhone = `+966${phone}`;
      await verifyOTP(fullPhone, otpCode);
      
      // Register user after OTP verification
      const result = await registerUser({
        name,
        phone: fullPhone,
        password
      });
      
      // Store user data
      if (result.success && result.data) {
        await storeUserData(result.data);
      }
      
      // Success - navigate to home
      setShowOTPModal(false);
      router.replace('/(tabs)/Home');
      
    } catch (error: any) {
      setErrors({ otp: error.response?.data?.message || 'رمز التحقق غير صحيح' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignup = async () => {
    console.log('Signup button pressed');
    console.log('Form data:', { name, phone, password, confirmPassword });
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, sending OTP...');
    setLoading(true);
    try {
      const fullPhone = `+966${phone}`;
      console.log('Sending OTP to:', fullPhone);
      
      // Send OTP first
      const otpResult = await sendOTP(fullPhone);
      console.log('OTP sent successfully:', otpResult);
      
      // Clear previous OTP and show modal
      setOtp(['', '', '', '', '', '']);
      setErrors(prev => ({ ...prev, otp: '' })); // Clear OTP errors
      setShowOTPModal(true);
      console.log('OTP modal should be visible now');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ general: error.response?.data?.message || 'حدث خطأ في إنشاء الحساب' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#222" />
        <View style={styles.container}>
          <Image source={require('../../../assets/images/icon.jpg')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>إنشاء حساب جديد</Text>
          
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="الاسم"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            placeholderTextColor="#BDBDBD"
            textAlign="right"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          
          <View style={styles.phoneContainer}>
            <TextInput
              style={[styles.phoneInput, errors.phone && styles.inputError]}
              placeholder="512345678"
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
              style={[styles.input, { flex: 1, marginBottom: 0 }, errors.password && styles.inputError]}
              placeholder="كلمة المرور"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholderTextColor="#BDBDBD"
              secureTextEntry
              textAlign="right"
            />
            <Text style={styles.passwordIcon}>🗝️</Text>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }, errors.confirmPassword && styles.inputError]}
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              placeholderTextColor="#BDBDBD"
              secureTextEntry
              textAlign="right"
            />
            <Text style={styles.passwordIcon}>🗝️</Text>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          
          {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => router.push('./login')}>
            <Text style={styles.buttonText}>لديك حساب؟ تسجيل الدخول</Text>
          </TouchableOpacity>
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
    borderColor: '#f44336',
    marginBottom: 5,
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
  errorText: {
    color: '#f44336',
    fontSize: 12,
    textAlign: 'right',
    width: '100%',
    marginBottom: 8,
    marginTop: -8,
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