import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Keyboard, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { checkPhoneExists, registerUser, storeUserData } from '../../services/api';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [phoneValidating, setPhoneValidating] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  
  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const phoneValidationTimeout = useRef<any>(null);

  // Clear all form data when screen is focused for security
  useFocusEffect(
    useCallback(() => {
      // Clear all form data for security
      setName('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
      setLoading(false);
      setShowOTPModal(false);
      setOtp(['', '', '', '', '', '']);
      setOtpLoading(false);
      setPhoneValidating(false);
      setPhoneValid(false);
      setGeneratedOTP('');
      // Clear any pending validation
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
    }, [])
  );

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
    };
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Name validation - only Arabic letters
    if (!name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    } else if (name.trim().length < 2) {
      newErrors.name = 'الاسم يجب أن يكون حرفين على الأقل';
    } else if (!/^[\u0600-\u06FF\s]+$/.test(name.trim())) {
      newErrors.name = 'الاسم يجب أن يحتوي على أحرف عربية فقط';
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

  const handleNameChange = (text: string) => {
    // Allow all characters but show warning for non-Arabic
    setName(text);
    
    // Check if contains non-Arabic characters
    if (text && !/^[\u0600-\u06FF\s]*$/.test(text)) {
      setErrors(prev => ({ ...prev, name: 'يرجى كتابة الاسم باللغة العربية' }));
    } else {
      // Clear name error when user types Arabic
      if (errors.name) {
        setErrors(prev => ({ ...prev, name: '' }));
      }
    }
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

    // Live validation with debounce - check if phone exists when user finishes typing 9 digits
    if (cleaned.length === 9) {
      // Clear any existing timeout
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
      
      // Set new timeout for validation
      phoneValidationTimeout.current = setTimeout(async () => {
        setPhoneValidating(true);
        try {
          const fullPhone = `+966${cleaned}`;
          await checkPhoneExists(fullPhone);
          // If no error, phone is available
          setErrors(prev => ({ ...prev, phone: '' }));
          setPhoneValid(true);
        } catch (error: any) {
          if (error.response?.data?.message === 'هذا الرقم مسجل بالفعل') {
            setErrors(prev => ({ ...prev, phone: 'رقم الهاتف مستخدم بالفعل' }));
          }
          setPhoneValid(false);
        } finally {
          setPhoneValidating(false);
        }
      }, 800); // 800ms delay for better UX
    } else if (cleaned.length < 9) {
      // Clear validation when less than 9 digits
      setPhoneValidating(false);
      setPhoneValid(false);
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
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
      console.log('🔍 Verifying OTP via server...');
      console.log('🔢 Entered OTP:', otpCode);
      
      const fullPhone = `+966${phone}`;
      
      // Verify OTP via server (which checks database)
      // const verifyResponse = await fetch('http://178.128.194.234:8080/api/auth/verify-otp', { // Production URL
      // Create AbortController for timeout
      const verifyController = new AbortController();
      const verifyTimeoutId = setTimeout(() => verifyController.abort(), 30000); // 30 second timeout
      
      const verifyResponse = await fetch('http://178.128.194.234:8080/api/auth/verify-otp', { // Production server URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhone,
          otp: otpCode
        }),
        signal: verifyController.signal,
      });
      
      clearTimeout(verifyTimeoutId);
      const verifyResult = await verifyResponse.json();
      console.log('🔍 Server verification result:', verifyResult);
      
      if (verifyResult.success) {
        console.log('✅ OTP verification successful via server!');
        
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
      } else {
        console.log('❌ OTP verification failed via server!');
        setErrors({ otp: verifyResult.message || 'رمز التحقق غير صحيح' });
      }
      
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      setErrors({ otp: error.message || 'حدث خطأ في التحقق من الرمز' });
    } finally {
      setOtpLoading(false);
    }
  };

  // Dreams SMS Configuration (same as test-dreams-sms-production-config.js)
  const dreamsSmsConfig = {
    username: 'Nwahtech',
    secretKey: 'd9877b42793f4a0adc2104000f38e0216f08e1f6cc342a3e381fd0f5509d8e37',
    sender: 'nwahtech',
  };

  // OTP message template
  const otpMessageTemplate = (otp: string) => 
    `رمز التحقق الخاص بك هو: ${otp}\n\nلا تشارك هذا الرمز مع أي شخص.\n\nمع تحيات فريق مشتل`;

  // Send SMS directly via Dreams SMS API
  const sendSMSDirectly = async (phone: string, otp: string) => {
    try {
      console.log('🧪 [DREAMS SMS] Sending SMS directly...');
      console.log('📱 Phone:', phone);
      console.log('🔢 OTP:', otp);
      // console.log('🌐 Simulating IP: 178.128.194.234 (Production Server)'); // Production only
      
      // Format phone number for Dreams SMS
      let dreamsPhone = phone.startsWith('+966') ? phone.substring(4) : phone;
      if (!dreamsPhone.startsWith('0') && dreamsPhone.length === 9) {
        dreamsPhone = '0' + dreamsPhone;
      }
      
      const message = otpMessageTemplate(otp);
      console.log('📝 Message:', message);
      
      // Dreams SMS API URL
      const apiUrl = 'https://www.dreams.sa/index.php/api/sendsms';
      
      // Create request parameters
      const params = new URLSearchParams({
        user: dreamsSmsConfig.username,
        secret_key: dreamsSmsConfig.secretKey,
        sender: dreamsSmsConfig.sender,
        to: dreamsPhone,
        message: message
      });
      
      // Add X-Forwarded-For header to simulate production server IP (for production only)
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 'X-Forwarded-For': '178.128.194.234', // Production server IP - commented for local dev
        // 'X-Real-IP': '178.128.194.234', // Production server IP - commented for local dev
        'User-Agent': 'Mashtal-Development-Server/1.1.1' // Changed from Production to Development
      };
      
      console.log('🔗 URL:', `${apiUrl}?${params.toString()}`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const result = await response.text();
      
      console.log('📊 Response Status:', response.status);
      console.log('📊 Response Data:', result);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('✅ SMS sent successfully via Dreams SMS!');
        return { success: true, messageId: result };
      } else {
        console.log('❌ SMS failed with status:', response.status);
        return { success: false, error: result };
      }
      
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error.message);
      return { success: false, error: error.message };
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
      
      // First, let server generate and save OTP to database
      console.log('💾 Getting OTP from server and saving to database...');
      // const saveResponse = await fetch('http://178.128.194.234:8080/api/auth/send-otp', { // Production URL
      // Create AbortController for timeout
      const saveController = new AbortController();
      const saveTimeoutId = setTimeout(() => saveController.abort(), 30000); // 30 second timeout
      
      const saveResponse = await fetch('http://178.128.194.234:8080/api/auth/send-otp', { // Production server URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhone,
          type: 'signup'
        }),
        signal: saveController.signal,
      });
      
      clearTimeout(saveTimeoutId);
      
      const saveResult = await saveResponse.json();
      console.log('💾 Database save result:', saveResult);
      
      if (!saveResult.success) {
        throw new Error(saveResult.message || 'Failed to save OTP to database');
      }
      
      // Get the OTP from server response
      const otp = saveResult.otp;
      console.log('🔢 Server generated OTP:', otp);
      
      // Store OTP for local verification
      setGeneratedOTP(otp);
      
      // Then send SMS directly via Dreams SMS with the server's OTP
      const smsResult = await sendSMSDirectly(fullPhone, otp);
      
      if (smsResult.success) {
        console.log('✅ OTP sent successfully via Dreams SMS!');
        console.log('🔢 OTP Code:', otp);
        console.log('📨 Message ID:', smsResult.messageId);
        
        // Clear previous OTP and show modal
        setOtp(['', '', '', '', '', '']);
        setErrors(prev => ({ ...prev, otp: '' })); // Clear OTP errors
        setShowOTPModal(true);
        console.log('OTP modal should be visible now');
      } else {
        throw new Error(smsResult.error || 'Failed to send SMS');
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ general: error.message || 'حدث خطأ في إنشاء الحساب' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#222" />
        <View style={styles.container}>
          <Image source={require('../../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>إنشاء حساب جديد</Text>
          
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="الاسم"
            value={name}
            onChangeText={handleNameChange}
            placeholderTextColor="#BDBDBD"
            textAlign="right"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          
          <View style={[
            styles.phoneContainer, 
            phoneValidating && styles.phoneValidating,
            phoneValid && styles.phoneValid
          ]}>
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
            {phoneValidating && (
              <View style={styles.validatingContainer}>
                <Text style={styles.validatingText}>جاري التحقق...</Text>
              </View>
            )}
            {phoneValid && !phoneValidating && (
              <View style={styles.validContainer}>
                <Text style={styles.validText}>متاح ✓</Text>
              </View>
            )}
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
          
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, paddingLeft: 50 }, errors.confirmPassword && styles.inputError]}
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              placeholderTextColor="#BDBDBD"
              secureTextEntry={!showConfirmPassword}
              textAlign="right"
            />
            <TouchableOpacity 
              style={styles.eyeIconLeft}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesome 
                name={showConfirmPassword ? 'eye' : 'eye-slash'} 
                size={18} 
                color="#888" 
              />
            </TouchableOpacity>
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
    position: 'relative',
    minHeight: 44,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingRight: 80, // Space for validation indicator
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
  phoneValidating: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  phoneValid: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  validatingContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 2,
  },
  validatingText: {
    fontSize: 9,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontWeight: '500',
  },
  validContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 2,
  },
  validText: {
    fontSize: 9,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontWeight: 'bold',
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