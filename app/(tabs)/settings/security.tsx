import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TwoFactorAuth from '../../components/TwoFactorAuth';
import firebaseService from '../../services/firebase';

const SecuritySettings = () => {
  const router = useRouter();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    biometricAuth: false,
    autoLock: true,
    sessionTimeout: 30, // minutes
    loginNotifications: true,
    deviceManagement: true,
  });

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const enabled = await firebaseService.is2FAEnabled();
      setIs2FAEnabled(enabled);
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = () => {
    setShow2FAModal(false);
    setIs2FAEnabled(true);
    Alert.alert('تم التفعيل', 'تم تفعيل المصادقة الثنائية بنجاح');
  };

  const handleBiometricToggle = (value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      biometricAuth: value
    }));
    
    if (value) {
      Alert.alert(
        'تفعيل المصادقة البيومترية',
        'سيتم استخدام بصمة الإصبع أو Face ID لتسجيل الدخول',
        [{ text: 'حسناً' }]
      );
    }
  };

  const handleAutoLockToggle = (value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      autoLock: value
    }));
  };

  const handleLoginNotificationsToggle = (value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      loginNotifications: value
    }));
  };

  const handleDeviceManagement = () => {
    Alert.alert(
      'إدارة الأجهزة',
      'عرض وإدارة الأجهزة المتصلة بحسابك',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'عرض الأجهزة', onPress: () => {
          // Navigate to device management screen
          Alert.alert('قريباً', 'سيتم إضافة هذه الميزة قريباً');
        }}
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'تغيير كلمة المرور',
      'سيتم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'إرسال', onPress: async () => {
          try {
            const currentUser = firebaseService.getCurrentUser();
            if (currentUser?.email) {
              await firebaseService.sendPasswordResetEmail(currentUser.email);
              Alert.alert('تم الإرسال', 'تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني');
            }
          } catch (error) {
            Alert.alert('خطأ', 'حدث خطأ أثناء إرسال رابط تغيير كلمة المرور');
          }
        }}
      ]
    );
  };

  const renderSecurityItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    showArrow: boolean = true
  ) => (
    <TouchableOpacity
      style={styles.securityItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.securityItemLeft}>
        <View style={styles.iconContainer}>
          <FontAwesome name={icon} size={20} color="#2E8B57" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.securityItemTitle}>{title}</Text>
          <Text style={styles.securityItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.securityItemRight}>
        {rightComponent}
        {showArrow && onPress && (
          <FontAwesome name="chevron-right" size={16} color="#999" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-right" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الأمان والخصوصية</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 2FA Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المصادقة الثنائية</Text>
          {renderSecurityItem(
            'shield',
            'المصادقة الثنائية',
            is2FAEnabled ? 'مفعلة - حسابك محمي' : 'غير مفعلة - إضافة طبقة أمان إضافية',
            () => setShow2FAModal(true),
            <View style={[styles.statusBadge, is2FAEnabled && styles.statusBadgeEnabled]}>
              <Text style={[styles.statusText, is2FAEnabled && styles.statusTextEnabled]}>
                {is2FAEnabled ? 'مفعلة' : 'غير مفعلة'}
              </Text>
            </View>
          )}
        </View>

        {/* Authentication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المصادقة</Text>
          {renderSecurityItem(
            'fingerprint',
            'المصادقة البيومترية',
            'استخدام بصمة الإصبع أو Face ID',
            undefined,
            <Switch
              value={securitySettings.biometricAuth}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#e0e0e0', true: '#2E8B57' }}
              thumbColor={securitySettings.biometricAuth ? '#fff' : '#f4f3f4'}
            />,
            false
          )}
          {renderSecurityItem(
            'lock',
            'قفل تلقائي',
            'قفل التطبيق تلقائياً عند عدم الاستخدام',
            undefined,
            <Switch
              value={securitySettings.autoLock}
              onValueChange={handleAutoLockToggle}
              trackColor={{ false: '#e0e0e0', true: '#2E8B57' }}
              thumbColor={securitySettings.autoLock ? '#fff' : '#f4f3f4'}
            />,
            false
          )}
          {renderSecurityItem(
            'key',
            'تغيير كلمة المرور',
            'تحديث كلمة المرور الخاصة بك',
            handleChangePassword
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإشعارات الأمنية</Text>
          {renderSecurityItem(
            'bell',
            'إشعارات تسجيل الدخول',
            'استلام إشعار عند تسجيل الدخول من جهاز جديد',
            undefined,
            <Switch
              value={securitySettings.loginNotifications}
              onValueChange={handleLoginNotificationsToggle}
              trackColor={{ false: '#e0e0e0', true: '#2E8B57' }}
              thumbColor={securitySettings.loginNotifications ? '#fff' : '#f4f3f4'}
            />,
            false
          )}
        </View>

        {/* Device Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إدارة الأجهزة</Text>
          {renderSecurityItem(
            'mobile',
            'الأجهزة المتصلة',
            'عرض وإدارة الأجهزة المتصلة بحسابك',
            handleDeviceManagement
          )}
        </View>

        {/* Security Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>نصائح أمنية</Text>
          <View style={styles.tipItem}>
            <MaterialIcons name="security" size={16} color="#2E8B57" />
            <Text style={styles.tipText}>استخدم كلمة مرور قوية وفريدة</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="security" size={16} color="#2E8B57" />
            <Text style={styles.tipText}>فعّل المصادقة الثنائية للحماية الإضافية</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="security" size={16} color="#2E8B57" />
            <Text style={styles.tipText}>لا تشارك رموز التحقق مع أي شخص</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="security" size={16} color="#2E8B57" />
            <Text style={styles.tipText}>راجع الأجهزة المتصلة بانتظام</Text>
          </View>
        </View>
      </ScrollView>

      {/* 2FA Modal */}
      <TwoFactorAuth
        visible={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onSuccess={handle2FASuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  securityItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  securityItemSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  securityItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f8d7da',
    marginRight: 10,
  },
  statusBadgeEnabled: {
    backgroundColor: '#d4edda',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#721c24',
  },
  statusTextEnabled: {
    color: '#155724',
  },
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
});

export default SecuritySettings; 