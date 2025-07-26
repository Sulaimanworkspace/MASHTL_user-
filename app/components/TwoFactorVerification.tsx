import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import firebaseService from '../services/firebase';

interface TwoFactorVerificationProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  visible,
  onClose,
  onSuccess,
  onCancel,
}) => {
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 300; // 5 minutes in seconds

  useEffect(() => {
    if (visible) {
      setVerificationCode('');
      setAttempts(0);
      setTimeRemaining(0);
      // Focus the input after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [visible]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeRemaining]);

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('خطأ', 'يرجى إدخال رمز مكون من 6 أرقام');
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      Alert.alert('تم حظر الحساب', 'تم حظر الحساب مؤقتاً بسبب المحاولات المتكررة');
      return;
    }

    try {
      setLoading(true);
      
      const isValid = await firebaseService.verify2FACode(verificationCode);
      
      if (isValid) {
        Alert.alert(
          'تم التحقق بنجاح',
          'تم التحقق من هويتك بنجاح',
          [{ text: 'حسناً', onPress: onSuccess }]
        );
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setTimeRemaining(LOCKOUT_TIME);
          Alert.alert(
            'تم حظر الحساب',
            'تم حظر الحساب لمدة 5 دقائق بسبب المحاولات المتكررة'
          );
        } else {
          Alert.alert(
            'رمز غير صحيح',
            `رمز التحقق غير صحيح. المحاولات المتبقية: ${MAX_ATTEMPTS - newAttempts}`
          );
        }
        
        setVerificationCode('');
        inputRef.current?.focus();
      }
    } catch (error: any) {
      console.error('Error verifying 2FA code:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء التحقق من الرمز');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, you'd resend the 2FA code
      Alert.alert('تم إرسال الرمز', 'تم إرسال رمز التحقق الجديد');
      
      // Reset attempts
      setAttempts(0);
      setTimeRemaining(0);
    } catch (error: any) {
      console.error('Error resending code:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الرمز');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLocked = attempts >= MAX_ATTEMPTS && timeRemaining > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <FontAwesome name="times" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>التحقق من الهوية</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="security" size={80} color="#2E8B57" />
            </View>
            
            <Text style={styles.title}>المصادقة الثنائية</Text>
            <Text style={styles.subtitle}>
              أدخل رمز التحقق من 6 أرقام من تطبيق المصادقة الخاص بك
            </Text>
            
            {isLocked && (
              <View style={styles.lockoutContainer}>
                <MaterialIcons name="lock" size={40} color="#dc3545" />
                <Text style={styles.lockoutTitle}>تم حظر الحساب مؤقتاً</Text>
                <Text style={styles.lockoutSubtitle}>
                  الوقت المتبقي: {formatTime(timeRemaining)}
                </Text>
              </View>
            )}
            
            {!isLocked && (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.verificationInput}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="000000"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={6}
                    textAlign="center"
                    editable={!loading}
                  />
                </View>
                
                <View style={styles.attemptsContainer}>
                  <Text style={styles.attemptsText}>
                    المحاولات المتبقية: {MAX_ATTEMPTS - attempts}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                >
                  <LinearGradient
                    colors={['#2E8B57', '#3CB371']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendCode}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>إعادة إرسال الرمز</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  verificationInput: {
    borderWidth: 3,
    borderColor: '#2E8B57',
    borderRadius: 12,
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
  },
  attemptsContainer: {
    marginBottom: 30,
  },
  attemptsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    paddingVertical: 15,
  },
  resendButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 15,
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  lockoutContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8d7da',
    borderRadius: 12,
    marginBottom: 30,
  },
  lockoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#721c24',
    marginTop: 10,
    marginBottom: 5,
  },
  lockoutSubtitle: {
    fontSize: 16,
    color: '#721c24',
    textAlign: 'center',
  },
});

export default TwoFactorVerification; 