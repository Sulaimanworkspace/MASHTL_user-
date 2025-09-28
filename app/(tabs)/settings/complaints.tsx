import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { createComplaint, getUserComplaints } from '../../services/api';
import { pusherService } from '../../services/pusher';
import notificationService, { sendNotificationFromPusher } from '../../services/notifications';

// Debug notifications service import
console.log('🔧 [COMPLAINTS] Importing notificationService:', notificationService);
console.log('🔧 [COMPLAINTS] notificationService type:', typeof notificationService);
console.log('🔧 [COMPLAINTS] notificationService has initialize:', notificationService && typeof notificationService.initialize === 'function');

interface Complaint {
  _id: string;
  complaintType: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  adminResponse?: string;
}

const Complaints: React.FC = () => {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const complaintTypes = [
    {
      id: 'مشكلة في الخدمة',
      title: 'مشكلة في الخدمة',
      icon: 'build',
      color: '#ff6b6b'
    },
    {
      id: 'مشكلة في الدفع',
      title: 'مشكلة في الدفع',
      icon: 'payment',
      color: '#4ecdc4'
    },
    {
      id: 'مشكلة في التواصل',
      title: 'مشكلة في التواصل',
      icon: 'chat',
      color: '#45b7d1'
    },
    {
      id: 'مشكلة في التطبيق',
      title: 'مشكلة في التطبيق',
      icon: 'bug-report',
      color: '#96ceb4'
    },
    {
      id: 'شكوى على المزارع',
      title: 'شكوى على المزارع',
      icon: 'person-off',
      color: '#feca57'
    },
    {
      id: 'أخرى',
      title: 'أخرى',
      icon: 'more-horiz',
      color: '#ff9ff3'
    }
  ];

  useEffect(() => {
    loadComplaints();
    setupPusher();
    setupNotifications();
    
    return () => {
      // Cleanup Pusher listeners
      pusherService.off('complaint_status_updated');
      pusherService.off('new_complaint');
    };
  }, []);

  const setupPusher = async () => {
    try {
      // Initialize Pusher connection
      await pusherService.initialize();
      
      // Listen for complaint status updates
      pusherService.on('complaint_status_updated', (data: any) => {
        console.log('🔔 Complaint status updated via Pusher:', data);
        
        // Update the complaint in the list
        setComplaints(prevComplaints => 
          prevComplaints.map(complaint => 
            complaint._id === data.complaintId 
              ? { ...complaint, status: data.status, adminResponse: data.adminResponse }
              : complaint
          )
        );
        
        // Send push notification
        const statusText = getStatusText(data.status);
        sendNotificationFromPusher({
          title: 'تحديث حالة الشكوى',
          body: `تم تحديث حالة شكواك إلى: ${statusText}`,
          data: { type: 'complaint_update', complaintId: data.complaintId }
        });
      });
      
      // Listen for new complaints (if user submits from another device)
      pusherService.on('new_complaint', (data: any) => {
        console.log('🔔 New complaint received via Pusher:', data);
        loadComplaints(); // Refresh the list
      });
      
    } catch (error) {
      console.error('❌ Error setting up Pusher:', error);
    }
  };

  const setupNotifications = async () => {
    try {
      console.log('🔧 [COMPLAINTS] Setting up notifications...');
      
      if (!notificationService) {
        console.log('⚠️ [COMPLAINTS] notificationService is undefined, skipping setup');
        return;
      }
      
      if (typeof notificationService.initialize !== 'function') {
        console.log('⚠️ [COMPLAINTS] notificationService.initialize is not a function, skipping setup');
        return;
      }
      
      await notificationService.initialize();
      console.log('✅ [COMPLAINTS] Notifications setup successful');
    } catch (error) {
      console.error('❌ [COMPLAINTS] Error setting up notifications:', error);
    }
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const response = await getUserComplaints();
      if (response.success) {
        setComplaints(response.complaints || []);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!selectedType || !title.trim() || !description.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createComplaint({
        complaintType: selectedType,
        title: title.trim(),
        description: description.trim()
      });

      if (response.success) {
        setShowSuccessMessage(true);
        setShowComplaintModal(false);
        resetForm();
        loadComplaints(); // Refresh the list
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      }
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'فشل في إرسال الشكوى');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedType('');
    setTitle('');
    setDescription('');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in_progress': return 'قيد المعالجة';
      case 'resolved': return 'تم الحل';
      case 'closed': return 'مغلق';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory'
    });
  };

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
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/settings')}>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>الشكاوى</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : complaints.length === 0 ? (
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="report-problem" size={48} color="#BDBDBD" />
            </View>
            <Text style={styles.noComplaints}>لا يوجد شكاوى</Text>
            <TouchableOpacity 
              style={styles.addComplaintButton}
              onPress={() => setShowComplaintModal(true)}
            >
              <Text style={styles.addComplaintButtonText}>إضافة شكوى جديدة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.complaintsList}>
            {/* Success Message */}
            {showSuccessMessage && (
              <View style={styles.successMessage}>
                <MaterialIcons name="check-circle" size={20} color="#10b981" />
                <Text style={styles.successMessageText}>تم إرسال الشكوى بنجاح</Text>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>شكاوىي السابقة</Text>
            {complaints.map((complaint) => (
              <View key={complaint._id} style={styles.complaintCard}>
                <View style={styles.complaintHeader}>
                  <View style={styles.complaintTypeContainer}>
                    <MaterialIcons 
                      name={complaintTypes.find(t => t.id === complaint.complaintType)?.icon as any || 'report-problem'} 
                      size={20} 
                      color="#4CAF50" 
                    />
                    <Text style={styles.complaintType}>{complaint.complaintType}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(complaint.status)}</Text>
                  </View>
                </View>
                <Text style={styles.complaintTitle}>{complaint.title}</Text>
                <Text style={styles.complaintDescription}>{complaint.description}</Text>
                {complaint.adminResponse && (
                  <View style={styles.adminResponseContainer}>
                    <Text style={styles.adminResponseLabel}>رد الإدارة:</Text>
                    <Text style={styles.adminResponseText}>{complaint.adminResponse}</Text>
                  </View>
                )}
                <Text style={styles.complaintDate}>{formatDate(complaint.createdAt)}</Text>
              </View>
            ))}
            
            {/* Add More Button - Always visible */}
            <TouchableOpacity 
              style={styles.addComplaintButton}
              onPress={() => setShowComplaintModal(true)}
            >
              <Text style={styles.addComplaintButtonText}>إضافة شكوى جديدة</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Complaint Modal */}
      <Modal
        visible={showComplaintModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComplaintModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إضافة شكوى جديدة</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowComplaintModal(false);
                  resetForm();
                }}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalSectionTitle}>نوع الشكوى</Text>
              <View style={styles.complaintTypesGrid}>
                {complaintTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.complaintTypeCard,
                      selectedType === type.id && styles.selectedTypeCard
                    ]}
                    onPress={() => setSelectedType(type.id)}
                  >
                    <MaterialIcons 
                      name={type.icon as any} 
                      size={24} 
                      color={selectedType === type.id ? '#fff' : type.color} 
                    />
                    <Text style={[
                      styles.complaintTypeCardText,
                      selectedType === type.id && styles.selectedTypeCardText
                    ]}>
                      {type.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalSectionTitle}>عنوان الشكوى</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="أدخل عنوان الشكوى"
                maxLength={100}
              />

              <Text style={styles.modalSectionTitle}>تفاصيل الشكوى</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="اشرح تفاصيل الشكوى..."
                multiline
                numberOfLines={4}
                maxLength={1000}
              />

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitComplaint}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>إرسال الشكوى</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  noComplaints: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  addComplaintButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addComplaintButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  complaintsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  complaintCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complaintTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complaintType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  complaintDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'right',
    lineHeight: 20,
  },
  adminResponseContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  adminResponseLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
  },
  adminResponseText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    lineHeight: 20,
  },
  complaintDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'left',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  complaintTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  complaintTypeCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTypeCard: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  complaintTypeCardText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedTypeCardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successMessageText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'right',
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'right',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Complaints; 