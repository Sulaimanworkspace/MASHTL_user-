import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import firebaseService from '../services/firebase';

interface TwoFactorAuthProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ visible, onClose, onSuccess }) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    if (visible) {
      check2FAStatus();
    }
  }, [visible]);

  const check2FAStatus = async () => {
    try {
      const enabled = await firebaseService.is2FAEnabled();
      setIs2FAEnabled(enabled);
      
      if (enabled) {
        Alert.alert(
          'المصادقة الثنائية مفعلة',
          'المصادقة الثنائية مفعلة بالفعل لحسابك.',
          [{ text: 'حسناً', onPress: onClose }]
        );
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      
      const result = await firebaseService.enable2FA();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setStep('verify');
      
      Alert.alert(
        'تم إنشاء رمز QR',
        'يرجى مسح رمز QR باستخدام تطبيق المصادقة مثل Google Authenticator أو Authy',
        [{ text: 'حسناً' }]
      );
    } catch (error: any) {
      console.error('Error enabling 2FA:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تفعيل المصادقة الثنائية');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('خطأ', 'يرجى إدخال رمز مكون من 6 أرقام');
      return;
    }

    try {
      setLoading(true);
      
      const isValid = await firebaseService.verify2FACode(verificationCode);
      
      if (isValid) {
        // Update 2FA status in Firestore
        const currentUser = firebaseService.getCurrentUser();
        if (currentUser) {
          await firebaseService.update2FAStatus(currentUser.uid, true);
        }
        
        Alert.alert(
          'تم التفعيل بنجاح',
          'تم تفعيل المصادقة الثنائية لحسابك بنجاح',
          [{ text: 'حسناً', onPress: onSuccess }]
        );
        setIs2FAEnabled(true);
      } else {
        Alert.alert('خطأ', 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى');
      }
    } catch (error: any) {
      console.error('Error verifying 2FA code:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء التحقق من الرمز');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    Alert.alert(
      'إلغاء تفعيل المصادقة الثنائية',
      'هل أنت متأكد من إلغاء تفعيل المصادقة الثنائية؟ هذا سيجعل حسابك أقل أماناً.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إلغاء التفعيل',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await firebaseService.disable2FA();
              
              const currentUser = firebaseService.getCurrentUser();
              if (currentUser) {
                await firebaseService.update2FAStatus(currentUser.uid, false);
              }
              
              setIs2FAEnabled(false);
              Alert.alert('تم الإلغاء', 'تم إلغاء تفعيل المصادقة الثنائية');
            } catch (error: any) {
              console.error('Error disabling 2FA:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء إلغاء التفعيل');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderSetupStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="security" size={60} color="#2E8B57" />
      </View>
      
      <Text style={styles.title}>المصادقة الثنائية</Text>
      <Text style={styles.subtitle}>
        أضف طبقة إضافية من الأمان لحسابك باستخدام المصادقة الثنائية
      </Text>
      
      <View style={styles.benefitsContainer}>
        <View style={styles.benefitItem}>
          <FontAwesome name="shield" size={20} color="#2E8B57" />
          <Text style={styles.benefitText}>حماية إضافية لحسابك</Text>
        </View>
        <View style={styles.benefitItem}>
          <FontAwesome name="lock" size={20} color="#2E8B57" />
          <Text style={styles.benefitText}>منع الوصول غير المصرح به</Text>
        </View>
        <View style={styles.benefitItem}>
          <FontAwesome name="check-circle" size={20} color="#2E8B57" />
          <Text style={styles.benefitText}>تحقق من هويتك</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleEnable2FA}
        disabled={loading}
      >
        <LinearGradient
          colors={['#2E8B57', '#3CB371']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            {loading ? 'جاري التفعيل...' : 'تفعيل المصادقة الثنائية'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="qr-code" size={60} color="#2E8B57" />
      </View>
      
      <Text style={styles.title}>مسح رمز QR</Text>
      <Text style={styles.subtitle}>
        افتح تطبيق المصادقة وامسح رمز QR أدناه
      </Text>
      
      <View style={styles.qrContainer}>
        {qrCode ? (
          <QRCode
            value={qrCode}
            size={200}
            color="#000"
            backgroundColor="#fff"
          />
        ) : (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>جاري إنشاء رمز QR...</Text>
          </View>
        )}
      </View>
      
      <View style={styles.secretContainer}>
        <Text style={styles.secretLabel}>الرمز السري (إذا لم يعمل QR):</Text>
        <Text style={styles.secretText}>{secret}</Text>
      </View>
      
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationLabel}>أدخل رمز التحقق من 6 أرقام:</Text>
        <TextInput
          style={styles.verificationInput}
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="000000"
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={6}
          textAlign="center"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={loading}
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
        style={styles.backButton}
        onPress={() => setStep('setup')}
      >
        <Text style={styles.backButtonText}>العودة</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الأمان</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 'setup' ? renderSetupStep() : renderVerifyStep()}
          
          {is2FAEnabled && (
            <View style={styles.disabledContainer}>
              <Text style={styles.disabledTitle}>المصادقة الثنائية مفعلة</Text>
              <Text style={styles.disabledSubtitle}>
                حسابك محمي بالمصادقة الثنائية
              </Text>
              <TouchableOpacity
                style={styles.disableButton}
                onPress={handleDisable2FA}
              >
                <Text style={styles.disableButtonText}>إلغاء التفعيل</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
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
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  qrPlaceholderText: {
    color: '#6c757d',
    fontSize: 14,
  },
  secretContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  secretLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  secretText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#333',
    textAlign: 'center',
  },
  verificationContainer: {
    width: '100%',
    marginBottom: 20,
  },
  verificationLabel: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  verificationInput: {
    borderWidth: 2,
    borderColor: '#2E8B57',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 5,
  },
  backButton: {
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    marginTop: 20,
  },
  disabledTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 5,
  },
  disabledSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  disableButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  disableButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TwoFactorAuth; 