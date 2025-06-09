import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../_colors';

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { projectName, projectType, image, description } = useLocalSearchParams();
  const imageUrl = Array.isArray(image) ? image[0] : image;
  const [showWarning, setShowWarning] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setShowWarning(true);
    }, [])
  );

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
            <View style={styles.locationRow}>
              <FontAwesome5 name="map-marker-alt" size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
              <Text style={styles.locationText}>الرياض حي الزهرة, الرياض</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeLocation}>تغيير الموقع</Text>
            </TouchableOpacity>
          </View>

          {/* Notes Section */}
          <Text style={styles.sectionTitle}>ملاحظات</Text>
          <View style={styles.notesBox}>
            <Text style={styles.notesPlaceholder}>أضف أي ملاحظات إضافية هنا...</Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              if ([
                'زراعة الأشجار',
                'تنسيق الحدائق',
                'زراعة ثيل'
              ].includes(projectName as string)) {
                router.push('/(tabs)/Home/searching-farms');
              }
            }}
          >
            <Text style={styles.submitButtonText}>تأكيد الطلب</Text>
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
  },
  changeLocation: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'right',
  },
  notesBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    minHeight: 80,
    padding: 12,
    marginBottom: 24,
    justifyContent: 'flex-start',
  },
  notesPlaceholder: {
    color: '#bbb',
    fontSize: 14,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
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