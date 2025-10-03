import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createProjectRequest, getUserData, refreshUserDataFromServer } from '../../services/api';
import { useSpinner } from '../../contexts/SpinnerContext';

export default function ProjectFormScreen() {
  const router = useRouter();
  const Container = View;
  const containerProps = {};
  const { showSpinner, hideSpinner } = useSpinner();
  const { name, image, description } = useLocalSearchParams();
  const [form, setForm] = useState({
    projectName: '',
    projectType: '',
    city: '',
    address: '',
    duration: '',
    price: '',
    other: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Clear form data when screen is focused for security and scroll to top
  useFocusEffect(
    useCallback(() => {
      // Scroll to top when screen is focused
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);

      setForm({
        projectName: '',
        projectType: '',
        city: '',
        address: '',
        duration: '',
        price: '',
        other: '',
      });
    }, [])
  );

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.projectName.trim()) {
      setModalType('error');
      setModalMessage('يرجى إدخال اسم المشروع');
      setShowModal(true);
      return false;
    }
    if (!form.projectType.trim()) {
      setModalType('error');
      setModalMessage('يرجى إدخال نوع المشروع');
      setShowModal(true);
      return false;
    }
    if (!form.city.trim()) {
      setModalType('error');
      setModalMessage('يرجى إدخال المدينة والحي');
      setShowModal(true);
      return false;
    }
    if (!form.duration.trim()) {
      setModalType('error');
      setModalMessage('يرجى إدخال مدة المشروع');
      setShowModal(true);
      return false;
    }
    if (!form.price.trim()) {
      setModalType('error');
      setModalMessage('يرجى إدخال قيمة المشروع');
      setShowModal(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    showSpinner('جاري إرسال الطلب...');
    
    try {
      // Get user data to include location
      await refreshUserDataFromServer();
      const userData = await getUserData();
      let userLocation = null;
      
      if (userData && userData.location) {
        userLocation = {
          latitude: userData.location.latitude || 24.7136,
          longitude: userData.location.longitude || 46.6753
        };
      }
      
      const projectData = {
        projectName: form.projectName.trim(),
        projectType: form.projectType.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        duration: form.duration.trim(),
        price: form.price.trim(),
        other: form.other.trim(),
        userLocation: userLocation
      };

      const response = await createProjectRequest(projectData);
      
      if (response.success) {
        setModalType('success');
        setModalMessage('تم إرسال طلب المشروع بنجاح! سيتم مراجعته والتواصل معك قريباً.');
        setShowModal(true);
        
        // Clear form after successful submission
        setForm({
          projectName: '',
          projectType: '',
          city: '',
          address: '',
          duration: '',
          price: '',
          other: '',
        });
      } else {
        setModalType('error');
        setModalMessage(response.message || 'حدث خطأ أثناء إرسال الطلب');
        setShowModal(true);
      }
    } catch (error: any) {
      console.error('Error submitting project request:', error);
      hideSpinner();
      setModalType('error');
      setModalMessage('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
      setShowModal(true);
    } finally {
      hideSpinner();
      setIsSubmitting(false);
    }
  };

  return (
    <Container style={styles.container} {...containerProps}>
      {/* Header */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>تفاصيل المشاريع</Text>
          </View>
        </View>
      </View>
      <ScrollView ref={scrollViewRef} style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
        </View>
        {/* Card Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>استمارة المشاريع</Text>
          {/* Table-like layout */}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>اسم المشروع</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.projectName}
              onChangeText={v => handleChange('projectName', v)}
              textAlign="right"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>نوع المشروع</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.projectType}
              onChangeText={v => handleChange('projectType', v)}
              textAlign="right"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>المدينة - الحي</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.city}
              onChangeText={v => handleChange('city', v)}
              textAlign="right"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>مدة المشروع</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.duration}
              onChangeText={v => handleChange('duration', v)}
              textAlign="right"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>قيمة المشروع</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.price}
              onChangeText={v => handleChange('price', v)}
              textAlign="right"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>أخرى</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.other}
              onChangeText={v => handleChange('other', v)}
              textAlign="right"
              multiline
            />
          </View>
        </View>
        {/* Gradient Button */}
        <TouchableOpacity 
          style={[styles.buttonWrapper, { opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={["#2E8B57", "#4CAF50"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
            </Text>
            <FontAwesome5 
              name={isSubmitting ? "spinner" : "paper-plane"} 
              size={18} 
              color="#fff" 
              style={{ marginRight: 8 }} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Success/Error Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowModal(false);
                if (modalType === 'success') {
                  router.push('/(tabs)/Home');
                }
              }}
            >
              <FontAwesome5 name="times" size={20} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.modalContent}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <FontAwesome5 
                  name={modalType === 'success' ? "check-circle" : "exclamation-circle"} 
                  size={50} 
                  color={modalType === 'success' ? "#4CAF50" : "#FF3B30"} 
                />
              </View>
              
              {/* Title */}
              <Text style={styles.modalTitle}>
                {modalType === 'success' ? 'تم الإرسال بنجاح!' : 'خطأ في الإرسال'}
              </Text>
              
              {/* Message */}
              <Text style={styles.modalMessage}>
                {modalMessage}
              </Text>
              
              {/* OK Button */}
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: modalType === 'success' ? '#4CAF50' : '#FF3B30' }
                ]}
                onPress={() => {
                  setShowModal(false);
                  if (modalType === 'success') {
                    router.push('/(tabs)/Home');
                  }
                }}
              >
                <Text style={styles.modalButtonText}>
                  {modalType === 'success' ? 'العودة للرئيسية' : 'حسناً'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    paddingTop: Platform.OS === 'android' ? 20 : 50,
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
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 12,
  },
  logo: {
    width: 100,
    height: 100,
  },
  formCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 0,
    margin: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    backgroundColor: '#EDEDED',
    paddingVertical: 12,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  tableLabel: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    textAlign: 'right',
    paddingVertical: 12,
    paddingLeft: 8,
  },
  tableInput: {
    flex: 2,
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
    textAlign: 'right',
    borderWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  buttonWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  verticalLine: {
    width: 1,
    height: '70%',
    backgroundColor: '#e0e0e0',
    marginHorizontal: 6,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 