import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { getInvoiceData } from '../../services/api';
import CustomModal from '../../components/CustomModal';
import webSocketService from '../../services/websocket';

interface InvoiceData {
  serviceType: string;
  area: string;
  location: string;
  date: string;
  serviceCost: number;
  vat: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMessage: string;
}

const InvoiceScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    serviceType: 'تنسيق الحديقة',
    area: '200 متر مربع',
    location: 'حي النرجس, الرياض',
    date: '١٥ رمضان ١٤٤٥',
    serviceCost: 800,
    vat: 120,
    totalAmount: 920,
    paymentStatus: 'pending',
    paymentMessage: 'تم إصدار الفاتورة - في انتظار الدفع'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Helper function to show custom modal
  const showCustomModal = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!orderId) {
        setError('معرف الطلب غير موجود');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getInvoiceData(orderId);
        
        if (response.success && response.data) {
          const data = response.data;
          const serviceCost = data.serviceCost || 800;
          const vat = Math.round(serviceCost * 0.15); // 15% VAT
          const totalAmount = serviceCost + vat;
          
          setInvoiceData({
            serviceType: data.serviceType,
            area: data.area || '200 متر مربع',
            location: data.location || 'حي النرجس, الرياض',
            date: data.date,
            serviceCost: data.serviceCost,
            vat: data.vat,
            totalAmount: data.totalAmount,
            paymentStatus: data.paymentStatus || 'pending',
            paymentMessage: data.paymentMessage || 'تم إصدار الفاتورة - في انتظار الدفع'
          });
        }
      } catch (error: any) {
        console.error('Error fetching invoice data:', error);
        setError(error.message || 'فشل في تحميل بيانات الفاتورة');
        // Keep using mock data as fallback
      } finally {
        setLoading(false);
      }
    };

    const initializeWebSocket = async () => {
      try {
        await webSocketService.initialize();
        webSocketService.joinChat(orderId);
        
        // Listen for payment status updates
        webSocketService.on('payment_status_updated', (data) => {
          console.log('💰 Payment status update received in user app:', data);
          if (data.orderId === orderId) {
            // Update payment status based on received data
            let newPaymentStatus = 'pending';
            let newPaymentMessage = 'تم إصدار الفاتورة - في انتظار الدفع';
            
            if (data.paymentStatus === 'Paid') {
              newPaymentStatus = 'paid';
              newPaymentMessage = 'تم إصدار الفاتورة - تم الدفع بنجاح';
            } else if (data.paymentStatus === 'Failed') {
              newPaymentStatus = 'failed';
              newPaymentMessage = 'تم إصدار الفاتورة - فشل في الدفع';
            } else if (data.paymentStatus === 'Cancelled') {
              newPaymentStatus = 'cancelled';
              newPaymentMessage = 'تم إصدار الفاتورة - تم إلغاء الدفع';
            }
            
            setInvoiceData(prev => ({
              ...prev,
              paymentStatus: newPaymentStatus,
              paymentMessage: newPaymentMessage
            }));
            
            console.log('✅ Payment status updated in user app:', newPaymentStatus);
          }
        });
      } catch (error) {
        console.error('❌ Error initializing WebSocket:', error);
      }
    };

    fetchInvoiceData();
    initializeWebSocket();

    // Check if user just completed payment
    const paymentSuccess = params.paymentSuccess as string;
    if (paymentSuccess === 'true') {
      showCustomModal('success', 'نجح الدفع', 'تم إتمام عملية الدفع بنجاح!');
    }

    return () => {
      // Cleanup WebSocket listeners
      webSocketService.off('payment_status_updated');
    };
  }, [orderId, params.paymentSuccess]);

  const handlePayment = () => {
    router.push({
      pathname: '/(tabs)/chats/payment',
      params: { orderId: orderId }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push({
              pathname: '/(tabs)/chats/message',
              params: { 
                orderId: orderId,
                userId: params.userId,
                userName: params.userName,
                userAvatar: params.userAvatar,
                orderStatus: params.orderStatus
              }
            })}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>فاتورة الخدمة</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>جاري تحميل الفاتورة...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={48} color="#f44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
                // Re-fetch data
                const fetchInvoiceData = async () => {
                  try {
                    const response = await getInvoiceData(orderId);
                    if (response.success && response.data) {
                      const data = response.data;
                      const serviceCost = data.serviceCost || 800;
                      const vat = Math.round(serviceCost * 0.15); // 15% VAT
                      const totalAmount = serviceCost + vat;
                      
                                              setInvoiceData({
                          serviceType: data.serviceType,
                          area: data.area || '200 متر مربع',
                          location: data.location || 'حي النرجس, الرياض',
                          date: data.date,
                          serviceCost: data.serviceCost,
                          vat: data.vat,
                          totalAmount: data.totalAmount,
                          paymentStatus: data.paymentStatus || 'pending',
                          paymentMessage: data.paymentMessage || 'تم إصدار الفاتورة - في انتظار الدفع'
                        });
                    }
                  } catch (error: any) {
                    setError(error.message || 'فشل في تحميل بيانات الفاتورة');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchInvoiceData();
              }}
            >
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Service Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>تفاصيل الخدمة</Text>
          
                                  <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{invoiceData.serviceType}</Text>
              <Text style={styles.detailLabel}>نوع الخدمة</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{invoiceData.location}</Text>
              <Text style={styles.detailLabel}>الموقع</Text>
            </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailValue}>{invoiceData.date}</Text>
            <Text style={styles.detailLabel}>التاريخ</Text>
          </View>
        </View>


        
        {/* Cost Details */}
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{invoiceData.serviceCost} ريال</Text>
          <Text style={styles.detailLabel}>تكلفة الخدمة</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{invoiceData.vat} ريال</Text>
          <Text style={styles.detailLabel}>ضريبة القيمة المضافة (15%)</Text>
        </View>
        
        {/* HR Line under VAT */}
        <View style={styles.hrLine} />
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailValue, styles.boldText]}>{invoiceData.totalAmount} ريال</Text>
          <Text style={[styles.detailLabel, styles.boldText]}>المبلغ الإجمالي</Text>
        </View>

            {/* Payment Information */}
            <View style={[styles.infoBox, { marginTop: 30 }]}>
              <MaterialIcons 
                name={invoiceData.paymentStatus === 'paid' ? 'check-circle' : 'info'} 
                size={20} 
                color={invoiceData.paymentStatus === 'paid' ? '#4CAF50' : '#666'} 
                style={styles.infoIcon} 
              />
              <Text style={[styles.infoText, { color: invoiceData.paymentStatus === 'paid' ? '#4CAF50' : '#666' }]}>
                {invoiceData.paymentStatus === 'paid' 
                  ? 'تم الدفع بنجاح! سيتم التواصل معك قريباً من قبل المزارع.'
                  : 'يجب دفع المبلغ عبر الدفع الإلكتروني لتأكيد الخدمة.'
                }
              </Text>
            </View>

            {/* Refresh Button for Payment Status */}
            {invoiceData.paymentStatus === 'pending' && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={async () => {
                  try {
                    setLoading(true);
                    const response = await getInvoiceData(orderId);
                    if (response?.success && response?.data) {
                      const data = response.data;
                      setInvoiceData({
                        serviceType: data.serviceType,
                        area: data.area || '200 متر مربع',
                        location: data.location || 'حي النرجس, الرياض',
                        date: data.date,
                        serviceCost: data.serviceCost,
                        vat: data.vat,
                        totalAmount: data.totalAmount,
                        paymentStatus: data.paymentStatus || 'pending',
                        paymentMessage: data.paymentMessage || 'تم إصدار الفاتورة - في انتظار الدفع'
                      });
                    }
                  } catch (error: any) {
                    console.error('Error refreshing payment status:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <MaterialIcons name="refresh" size={20} color="#4CAF50" />
                <Text style={styles.refreshButtonText}>تحديث حالة الدفع</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Payment Button - Show different text based on payment status */}
      {!loading && !error && (
        <View style={styles.paymentButtonContainer}>
          {invoiceData.paymentStatus === 'paid' ? (
            // Show paid status
            <View style={[styles.paymentButton, styles.paidButton]}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={[styles.paymentButtonText, styles.paidButtonText]}>
                تم الدفع بنجاح
              </Text>
            </View>
          ) : (
            // Show payment button
            <TouchableOpacity
              style={styles.paymentButton}
              onPress={handlePayment}
              activeOpacity={0.8}
            >
              <Text style={styles.paymentButtonText}>
                ادفع الآن {invoiceData.totalAmount} ريال
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Custom Modal */}
                     <CustomModal
                 visible={showModal}
                 type={modalType}
                 title={modalTitle}
                 message={modalMessage}
                 onClose={() => setShowModal(false)}
               />
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  section: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hrLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  greenText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    lineHeight: 20,
  },
  paymentButtonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  paidButton: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidButtonText: {
    color: '#4CAF50',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default InvoiceScreen; 