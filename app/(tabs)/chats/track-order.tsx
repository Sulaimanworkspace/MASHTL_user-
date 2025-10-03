import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { getChatHistory } from '../../services/api';
import pusherService from '../../services/pusher';

const { width } = Dimensions.get('window');

const steps = [
  { label: 'تم قبول', key: 'accepted' },
  { label: 'تم بدء العمل', key: 'in_progress' },
  { label: 'جاري التنفيذ', key: 'working' },
  { label: 'مكتمل', key: 'completed' },
];

const progressDetails = [
  { label: 'تم قبول الطلب', key: 'accepted', icon: 'check-circle', date: '---' },
  { label: 'بدء العمل', key: 'in_progress', icon: 'check-circle', date: '---' },
  { label: 'جاري تنفيذ الاعمال', key: 'working', icon: 'check-circle', date: '---' },
  { label: 'اكتمل الطلب', key: 'completed', icon: 'check-circle', date: '---' },
];

// Helper to format date in Arabic Gregorian (ميلادي)
function formatArabicDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const dayMonth = date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  const time = date.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' });
  return `${dayMonth}, ${time}`;
}

export default function TrackOrderScreen() {
  const router = useRouter();
  const Container = View;
  const containerProps = {};
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const farmerName = params.farmerName as string;
  // Placeholder data
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<string>('accepted');
  const serviceTitle = 'خدمة تنسيق الحدائق';
  const provider = farmerName || 'محمد علي';
  const [farmerPhone, setFarmerPhone] = useState<string>('');
  const currentStep = 1; // 0: accepted, 1: in_progress, 2: completed
  const progressBarRef = useRef<View>(null);
  const [progressBarWidth, setProgressBarWidth] = useState<number>(0);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const response = await getChatHistory(orderId);
        if (response && response.order) {
          setOrder(response.order);
          if (response.order.orderNumber) setOrderNumber(response.order.orderNumber);
          if (response.order.status) setOrderStatus(response.order.status);
          if (response.order.farmer && response.order.farmer.phone) setFarmerPhone(response.order.farmer.phone);
          console.log('DEBUG: farmerPhone from backend:', response.order.farmer?.phone);
        } else {
          setOrder(null);
          setOrderNumber('');
          setOrderStatus('accepted');
          setFarmerPhone('');
        }
      } catch (e) {
        setOrder(null);
        setOrderNumber('');
        setOrderStatus('accepted');
        setFarmerPhone('');
      }
    };
    fetchOrder();
    // Pusher: listen for order status updates
    pusherService.on('order_status_update', (data: { orderId: string; status: string }) => {
      if (data.orderId === orderId && data.status) {
        setOrderStatus(data.status);
      }
    });
    return () => {
      pusherService.off('order_status_update');
    };
  }, [orderId]);

  return (
    <Container style={styles.container} {...containerProps}>
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
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>تتبع الطلب</Text>
          </View>
        </View>
      </View>
      {/* Order Card */}
      <View style={styles.orderCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.orderStatus}>جاري التنفيذ</Text>
          <Text style={styles.orderNumber}>طلب رقم {orderNumber ? `#${orderNumber.split('-').pop()}` : '-'}</Text>
        </View>
        <Text style={styles.serviceTitle}>{serviceTitle}</Text>
        <Text style={styles.provider}>المزارع: {provider}</Text>
        {order?.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>ملاحظات:</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
      </View>
      {/* Unified Progress Bar with Circles and Labels */}
      <View style={{ marginTop: 18, marginBottom: 40, width: '100%', position: 'relative', alignItems: 'center' }}>
        {/* Flex-based progress bar line for RTL */}
        <View style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          width: '100%',
          height: 4,
          backgroundColor: '#E0E0E0',
          borderRadius: 2,
          overflow: 'hidden',
          // Remove marginBottom so circles/labels are close
        }}>
          {/* Green filled part */}
          <View style={{
            backgroundColor: '#4CAF50',
            height: 4,
            borderRadius: 2,
            flex: (() => {
              const idx = steps.findIndex(s => s.key === orderStatus);
              const stepCount = steps.length - 1;
              if (stepCount <= 0) return 0;
              return idx / stepCount;
            })(),
          }} />
          {/* Gray unfilled part */}
          <View style={{
            backgroundColor: 'transparent',
            height: 4,
            flex: (() => {
              const idx = steps.findIndex(s => s.key === orderStatus);
              const stepCount = steps.length - 1;
              if (stepCount <= 0) return 1;
              return 1 - (idx / stepCount);
            })(),
          }} />
        </View>
        {/* Circles and labels row, absolutely positioned over the line */}
        <View style={{
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          position: 'absolute',
          top: -12, // move circles up to overlap the line
          left: 0,
          right: 0,
        }}>
          {steps.map((step, idx) => {
            const currentStepIdx = steps.findIndex(s => s.key === orderStatus);
            return (
              <View key={step.key} style={{ alignItems: 'center' }}>
                <View style={[
                  styles.progressCircle,
                  idx <= currentStepIdx && styles.progressCircleActive
                ]}>
                  {idx <= currentStepIdx && <View style={styles.progressCircleInner} />}
                </View>
                <Text style={[
                  styles.progressStepLabel,
                  idx === currentStepIdx && styles.progressStepLabelActive
                ]}>{step.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
      {/* Progress Details */}
      <Text style={styles.progressDetailsTitle}>تفاصيل التقدم</Text>
      <View style={styles.progressDetailsContainer}>
        {progressDetails.map((item, idx) => {
          // Find the current step index based on live orderStatus
          const currentStepIdx = steps.findIndex(s => s.key === orderStatus);
          const thisStepIdx = steps.findIndex(s => s.key === item.key);
          const isDone = thisStepIdx <= currentStepIdx;
          // Use createdAt for accepted, completedDate for completed, and createdAt for others as placeholder
          let dateToShow = '';
          if (item.key === 'accepted') dateToShow = order?.createdAt;
          else if (item.key === 'completed') dateToShow = order?.completedDate;
          else dateToShow = order?.createdAt;
          return (
            <View key={item.key} style={styles.progressDetailCard}>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginTop: 6 }}>
                <FontAwesome5
                  name={item.icon as any}
                  size={20}
                  color={isDone ? '#4CAF50' : '#888'}
                  style={{ marginLeft: 0, marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.progressDetailLabel}>{item.label}</Text>
                  <Text style={styles.progressDetailDate}>{formatArabicDate(dateToShow)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      {/* Call Provider Button */}
      <TouchableOpacity
        style={styles.notificationModalButton}
        onPress={() => {
          if (farmerPhone) Linking.openURL(`tel:${farmerPhone}`);
        }}
        disabled={!farmerPhone}
      >
        <Text style={styles.notificationModalButtonText}>الاتصال بالمزارع</Text>
      </TouchableOpacity>
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
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    margin: 18,
    marginTop: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginRight: 8, // RTL
    textAlign: 'right',
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
    marginLeft: 8, // RTL
    textAlign: 'right',
  },
  serviceTitle: {
    fontSize: 15,
    color: '#444',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'right',
  },
  provider: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'right',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    textAlign: 'right',
  },
  progressBarContainer: {
    marginTop: 18,
    marginBottom: 8,
    alignItems: 'center',
    width: '100%',
  },
  progressBarLine: {
    position: 'absolute',
    top: 18,
    left: 32,
    right: 32,
    height: 4,
    backgroundColor: '#E0E0E0',
    zIndex: 0,
    borderRadius: 2,
  },
  progressBarSteps: {
    flexDirection: 'row-reverse', // RTL
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 1,
  },
  progressStepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressCircleActive: {
    borderColor: '#4CAF50',
  },
  progressCircleInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
  },
  progressStepLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'right',
  },
  progressStepLabelActive: {
    color: '#22c55e',
  },
  progressDetailsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginTop: 18,
    marginRight: 24,
    marginBottom: 8,
    textAlign: 'right',
  },
  progressDetailsContainer: {
    marginHorizontal: 18,
    marginBottom: 18,
  },
  progressDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  progressDetailLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
    textAlign: 'right',
  },
  progressDetailDate: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    textAlign: 'right',
  },
  notificationModalButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
  },
  notificationModalButtonText: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
}); 