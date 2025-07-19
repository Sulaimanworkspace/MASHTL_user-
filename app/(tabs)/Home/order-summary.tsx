import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import Colors from '../../_colors';
import { getUserData } from '../../services/api';
import LocationPickerModal from '../../components/LocationPickerModal';

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { projectName, projectType, image, description } = useLocalSearchParams();
  const imageUrl = Array.isArray(image) ? image[0] : image;
  const [showWarning, setShowWarning] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user location when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setShowWarning(true);
      loadUserLocation();
    }, [])
  );

  const loadUserLocation = async () => {
    try {
      const userData = await getUserData();
      if (userData && userData.location && userData.location.address) {
        setUserLocation({
          address: userData.location.address,
          city: userData.location.city || 'الرياض',
          latitude: userData.location.latitude,
          longitude: userData.location.longitude
        });
      } else {
        setUserLocation(null);
      }
    } catch (error) {
      console.error('Error loading user location:', error);
      setUserLocation(null);
    }
  };

  const handleLocationSaved = (location: any) => {
    setUserLocation({
      address: location.address,
      city: location.city || 'الرياض',
      latitude: location.latitude,
      longitude: location.longitude
    });
    setLocationModalVisible(false);
    console.log('📍 Location updated:', location);
  };

  const handleSubmit = async () => {
    // Validate location
    if (!userLocation || !userLocation.address) {
      Alert.alert(
        'الموقع مطلوب',
        'يجب عليك تحديد موقعك قبل تأكيد الطلب. يمكنك استخدام آخر موقعك أو تحديد موقع جديد.',
        [
          { text: 'تحديد الموقع', onPress: () => setLocationModalVisible(true) },
          { text: 'إلغاء', style: 'cancel' }
        ]
      );
      return;
    }

    // Proceed with order submission
    setLoading(true);
    try {
      if ([
        'زراعة الأشجار',
        'تنسيق الحدائق',
        'زراعة ثيل'
      ].includes(projectName as string)) {
        router.push({
          pathname: '/(tabs)/Home/searching-farms',
          params: {
            projectName: projectName,
            description: description,
            location: JSON.stringify(userLocation),
            notes: notes
          }
        });
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تأكيد الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = () => setShowWarning(false);

  return (
    <View style={styles.container}>
      {/* Warning Modal */}
      <Modal
        visible={showWarning}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.warningIconContainer}>
              <FontAwesome5 name="exclamation-circle" size={40} color="#FF0000" />
            </View>
            <Text style={styles.warningText}>
              نحن غير مسؤولين عن اي تعامل خارج المنصة وقد يتم حضر حسابك
            </Text>
            <TouchableOpacity 
              style={styles.warningButton}
              onPress={handleAcknowledge}
            >
              <Text style={styles.warningButtonText}>موافق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSaved={handleLocationSaved}
      />

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
          <TouchableOpacity style={styles.backButton} onPress={() => router.push({ pathname: '/(tabs)/Home/service-details', params: { name: projectName, image: imageUrl, description: description } })}>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>ملخص الطلب</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.detailsContainer}>
          {/* Service Card */}
          <View style={styles.serviceCard}>
            <Image
              source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' }}
              style={styles.serviceImage}
            />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{projectName || 'تنسيق الحدائق'}</Text>
              <Text style={styles.serviceDesc}>{description || 'خدمة تصميم وتنفيذ الحدائق المنزلية'}</Text>
            </View>
          </View>

          {/* Location Section */}
          <Text style={styles.sectionTitle}>الموقع</Text>
          <View style={styles.locationBox}>
            {userLocation ? (
              <View style={styles.locationRow}>
                <FontAwesome5 name="map-marker-alt" size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
                <Text style={styles.locationText}>
                  {userLocation.address}{userLocation.city ? `, ${userLocation.city}` : ''}
                </Text>
              </View>
            ) : (
              <View style={styles.locationRow}>
                <FontAwesome5 name="exclamation-triangle" size={16} color="#FF6B6B" style={{ marginLeft: 6 }} />
                <Text style={styles.noLocationText}>لم يتم تحديد الموقع</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => setLocationModalVisible(true)}>
              <Text style={styles.changeLocation}>
                {userLocation ? 'تغيير الموقع' : 'تحديد الموقع'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notes Section */}
          <Text style={styles.sectionTitle}>ملاحظات</Text>
          <View style={styles.notesBox}>
            <TextInput
              style={styles.notesInput}
              placeholder="أضف أي ملاحظات إضافية هنا..."
              placeholderTextColor="#bbb"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlign="right"
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <View style={styles.submitButtonInner}>
              <Text style={styles.submitButtonText}>
                {loading ? 'جاري التأكيد...' : 'تأكيد الطلب'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  detailsContainer: {
    padding: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    textAlign: 'right',
  },
  serviceDesc: {
    fontSize: 13,
    color: '#888',
    textAlign: 'right',
  },
  locationBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  locationText: {
    fontSize: 15,
    color: '#222',
    textAlign: 'right',
    flex: 1,
  },
  noLocationText: {
    fontSize: 15,
    color: '#FF6B6B',
    textAlign: 'right',
    flex: 1,
  },
  changeLocation: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'right',
  },
  notesBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
    padding: 12,
    marginBottom: 24,
  },
  notesInput: {
    fontSize: 14,
    color: '#222',
    textAlignVertical: 'top',
    minHeight: 60,
    textAlign: 'right',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonInner: {
    backgroundColor: '#2E8B57',
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  warningIconContainer: {
    marginBottom: 16,
  },
  warningText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  warningButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  warningButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'right',
  },
}); 