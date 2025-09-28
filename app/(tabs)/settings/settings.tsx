import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getUserData, updateUserProfile } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Settings: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load user data when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          setIsLoading(true);
          const data = await getUserData();
          if (data && data.token) {
            setUserData(data);
            setFormData({
              name: data.name || '',
              phone: data.phone || '',
              email: '', // Always start with empty email field
            });
          } else {
            // User not authenticated, redirect to login
            router.replace('/(tabs)/auth/login');
            return;
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          router.replace('/(tabs)/auth/login');
        } finally {
          setIsLoading(false);
        }
      };

      loadUserData();
    }, [])
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      
      // Validate required fields
      if (!formData.name.trim()) {
        setModalType('error');
        setModalMessage('يرجى إدخال الاسم');
        setShowModal(true);
        return;
      }

      if (!formData.phone.trim()) {
        setModalType('error');
        setModalMessage('يرجى إدخال رقم الهاتف');
        setShowModal(true);
        return;
      }

      const response = await updateUserProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
      });

      if (response.success) {
        setModalType('success');
        setModalMessage('تم تحديث البيانات بنجاح');
        setShowModal(true);
        // Refresh user data
        const updatedData = await getUserData();
        setUserData(updatedData);
      } else {
        setModalType('error');
        setModalMessage(response.message || 'فشل في تحديث البيانات');
        setShowModal(true);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setModalType('error');
      setModalMessage(error.message || 'فشل في تحديث البيانات');
      setShowModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Call delete account API
      const response = await fetch('http://localhost:9090/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData?.token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear user data and redirect to login
        await AsyncStorage.clear();
        setModalMessage('تم حذف الحساب بنجاح');
        setModalType('success');
        setShowModal(true);
        setTimeout(() => {
          router.replace('/(tabs)/auth/login');
        }, 2000);
      } else {
        setModalMessage(data.message || 'فشل في حذف الحساب');
        setModalType('error');
        setShowModal(true);
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setModalMessage('حدث خطأ أثناء حذف الحساب');
      setModalType('error');
      setShowModal(true);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        <View style={styles.navBar}>
          <LinearGradient
            colors={["#4CAF50", "#102811"]}
            style={styles.headerFade}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            pointerEvents="none"
          />
          <View style={styles.navContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/settings')}
            >
              <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>الاعدادات</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Green Header Navigation Bar */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/settings')}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>الاعدادات</Text>
          </View>
        </View>
      </View>

      {/* Settings Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>البيانات الشخصية</Text>
          
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>الاسم</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="أدخل اسمك"
              placeholderTextColor="#999"
              textAlign="right"
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="أدخل رقم الهاتف"
              placeholderTextColor="#999"
              textAlign="right"
              keyboardType="phone-pad"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>البريد الإلكتروني (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="أدخل البريد الإلكتروني"
              placeholderTextColor="#999"
              textAlign="right"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
            onPress={handleUpdateProfile}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>تحديث البيانات</Text>
            )}
          </TouchableOpacity>

          {/* Delete Account Section */}
          <View style={[styles.section, { marginTop: 30 }]}>
            <Text style={styles.sectionTitle}>إدارة الحساب</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <FontAwesome5 name="trash" size={16} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>حذف الحساب</Text>
            </TouchableOpacity>
          </View>
        </View>


      </ScrollView>

      {/* Success/Error Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <FontAwesome5 
                  name={modalType === 'error' ? "times-circle" : "check-circle"} 
                  size={50} 
                  color={modalType === 'error' ? "#FF3B30" : "#4CAF50"} 
                />
              </View>
              <Text style={[
                styles.modalMessage,
                { color: '#333' }
              ]}>
                {modalMessage}
              </Text>
              <TouchableOpacity 
                style={[
                  styles.modalButton,
                  { backgroundColor: modalType === 'error' ? '#FF3B30' : '#4CAF50' }
                ]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>حسناً</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <FontAwesome5 name="exclamation-triangle" size={50} color="#FF9500" />
              </View>
              <Text style={[styles.modalTitle, { color: '#333' }]}>
                تأكيد حذف الحساب
              </Text>
              <Text style={[styles.modalMessage, { color: '#666', textAlign: 'center', marginBottom: 20 }]}>
                هل أنت متأكد من أنك تريد حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه وستفقد جميع بياناتك.
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#FF3B30', marginRight: 10 }]}
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>حذف الحساب</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#8E8E93' }]}
                  onPress={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  <Text style={styles.modalButtonText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    zIndex: 1,
    top: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'right',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.88,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  modalContent: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.02)',
  },
  successIconContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 16,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  modalMessage: {
    fontSize: 17,
    color: '#388E3C',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 28,
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 28,
    minWidth: 140,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Settings; 