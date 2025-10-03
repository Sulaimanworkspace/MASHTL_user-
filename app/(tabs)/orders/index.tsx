import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
  Modal,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserData, getUserServiceOrders, getServices } from '../../services/api';
import pusherService from '../../services/pusher';
import { useSpinner } from '../../contexts/SpinnerContext';

const { width, height } = Dimensions.get('window');

interface ServiceOrder {
  _id: string;
  orderNumber?: string;
  serviceType: string;
  serviceTitle: string;
  description: string;
  location: {
    address: string;
    city: string;
  };
  farmer?: {
    _id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  status: string;
  createdAt: string;
  price?: number;
  estimatedCost?: number;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

interface ServiceData {
  _id: string;
  title: string;
  description: string;
  serviceType: string;
  image: string;
  features: string[];
  rating: number;
  isActive: boolean;
  order: number;
}

const User17: React.FC = () => {
  const router = useRouter();
  const { showSpinner, hideSpinner } = useSpinner();
  const Container = View;
  const containerProps = {};
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);

  // Initialize Pusher for real-time updates
  useEffect(() => {
    pusherService.initialize().then(() => {
      console.log('Connected to Pusher server');
    });

    pusherService.on('order_status_update', (data: any) => {
      console.log('📱 Order status update received:', data);
      // Refresh orders to show updated status
    });

    pusherService.on('order_completed', (data: { orderId: string }) => {
      console.log('📱 Order completed event received:', data.orderId);
      // Refresh orders to show updated status
      fetchOrders();
    });

    // Listen for order_cancelled event
    pusherService.on('order_cancelled', (data: { orderId: string }) => {
      console.log('📱 Order cancelled event received:', data.orderId);
      setOrders(prev => prev.filter(order => order._id !== data.orderId));
    });

    return () => {
      pusherService.disconnect();
    };
  }, []);

  // Debug contact modal state changes
  useEffect(() => {
    console.log('🔍 Contact modal state changed:', showContactModal);
  }, [showContactModal]);

  useEffect(() => {
    console.log('🔍 Selected order changed:', selectedOrder ? selectedOrder._id : 'null');
  }, [selectedOrder]);



  // Fetch services data
  const fetchServices = async () => {
    try {
      const response = await getServices();
      if (response.success) {
        // Add the hardcoded المشاريع service to the dynamic services
        const projectsService: ServiceData = {
          _id: 'projects-hardcoded',
          title: 'المشاريع',
          description: 'تنفيذ المشاريع الزراعية الكبيرة والصغيرة مع فريق متخصص. نقدم حلول متكاملة للمشاريع الزراعية مع ضمان الجودة والالتزام بالمواعيد.',
          image: 'https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/b0048f76b43fdada220b661863a0798441bf574e?placeholderIfAbsent=true',
          serviceType: 'المشاريع',
          features: ['تخطيط المشروع.', 'تنفيذ بفريق متخصص.', 'ضمان الجودة.', 'التزام بالمواعيد.'],
          rating: 4.2,
          isActive: true,
          order: 4
        };
        
        // Combine dynamic services with hardcoded المشاريع
        const allServices = [...response.data, projectsService];
        setServices(allServices);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      // Fallback services if API fails
      setServices([
        {
          _id: 'fallback-1',
          title: 'تنسيق الحدائق',
          description: 'خدمة تنسيق الحدائق المنزلية والشركات بأحدث التصاميم والأساليب الحديثة. نقوم بتصميم وتنفيذ جميع أنواع الحدائق مع ضمان جودة العمل والمواد المستخدمة.',
          image: 'https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/9db5513cffa0f952bf72289940508e6bb2f43e86?placeholderIfAbsent=true',
          serviceType: 'تنسيق الحدائق',
          features: ['تصميم الحديقة.', 'اختيار النباتات المناسبة.', 'تركيب أنظمة الري.', 'تنسيق المساحات الخضراء.'],
          rating: 4.2,
          isActive: true,
          order: 1
        },
        {
          _id: 'fallback-2',
          title: 'زراعة الأشجار',
          description: 'خدمة زراعة الأشجار بأنواعها المختلفة مع توفير الرعاية اللازمة. نقوم باختيار أفضل أنواع الأشجار المناسبة للمناخ والتربة مع ضمان نجاح الزراعة.',
          image: 'https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/4f68288a8dfbd3be84b86a86f69f10b478b30bb2?placeholderIfAbsent=true',
          serviceType: 'زراعة الأشجار',
          features: ['اختيار أفضل أنواع الأشجار.', 'زراعة الأشجار بطريقة احترافية.', 'توفير الرعاية اللازمة.', 'ضمان نجاح الزراعة.'],
          rating: 4.2,
          isActive: true,
          order: 2
        },
        {
          _id: 'fallback-3',
          title: 'زراعة ثيل',
          description: 'خدمة زراعة الثيل الطبيعي والصناعي مع ضمان جودة العشب. نقوم بتجهيز الأرض وزراعة الثيل مع توفير خدمات الصيانة الدورية.',
          image: 'https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/46f551cf45a05c4bbd3169c8c33a7c6b72ea9cb1?placeholderIfAbsent=true',
          serviceType: 'زراعة ثيل',
          features: ['تجهيز الأرض.', 'زراعة الثيل الطبيعي أو الصناعي.', 'ضمان جودة العشب.', 'خدمات صيانة دورية.'],
          rating: 4.2,
          isActive: true,
          order: 3
        }
      ]);
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      console.log('🔍 Fetching user orders...');
      showSpinner('جاري تحميل الطلبات...');
      const response = await getUserServiceOrders();
      if (response.success) {
        console.log('🔍 Fetched orders:', response.data.map((order: ServiceOrder) => ({
          id: order._id,
          status: order.status,
          serviceTitle: order.serviceTitle,
          hasFarmer: !!order.farmer
        })));
        setOrders(response.data);
      } else {
        console.log('⚠️ No orders found or API returned success: false');
        setOrders([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      hideSpinner();
      if (error.message === 'يرجى تسجيل الدخول أولاً') {
        console.log('🔐 Redirecting to login due to authentication error');
        router.replace('/(tabs)/auth/login');
      } else {
        console.log('📱 Setting empty orders due to error');
        setOrders([]);
      }
    } finally {
      hideSpinner();
      setIsLoading(false);
    }
  };



  // Check authentication and redirect if not logged in
  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        try {
          console.log('🔍 Checking authentication status...');
          const userData = await getUserData();
          if (!userData || !userData.token || (!userData.name && !userData._id)) {
            console.log('⚠️ User not authenticated, redirecting to login');
            router.replace('/(tabs)/auth/login');
            return;
          }
          console.log('✅ User authenticated:', userData.name);
          setIsLoggedIn(true);
          
          // Fetch services and orders
          await fetchServices();
          await fetchOrders();
        } catch (error) {
          console.error('❌ Error checking authentication:', error);
          router.replace('/(tabs)/auth/login');
        }
      };
      checkAuthStatus();
    }, [])
  );

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    await fetchOrders();
    setRefreshing(false);
  };

  // Helper function to get service name based on serviceType
  const getServiceName = (serviceType: string) => {
    const service = services.find(s => s.serviceType === serviceType);
    return service ? service.title : serviceType;
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#22c55e';
      case 'in_progress': return '#FF9800';
      case 'working': return '#2196F3';
      case 'completed': return '#22c55e';
      case 'cancelled': return '#ef4444';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'accepted': return 'تم قبول الطلب';
      case 'in_progress': return 'تم بدء العمل';
      case 'working': return 'جاري التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      case 'rejected': return 'مرفوض';
      default: return 'غير محدد';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} د`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} س`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    // For older than a week, show the actual date
          return orderDate.toLocaleDateString('ar-SA', { calendar: 'gregory' });
  };

  // Don't render anything if not authenticated (prevents flash)
  if (!isLoggedIn && isLoading) {
    return null;
  }

  return (
    <Container style={styles.container} {...containerProps}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        {/* Navigation Content */}
        <View style={styles.navContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
                            <Text style={styles.title}>طلباتي</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent}
        contentContainerStyle={orders.length === 0 ? styles.emptyContentContainer : styles.ordersContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {orders.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          {/* Empty State Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4555/4555971.png' }}
              style={styles.emptyStateIcon}
            />
          </View>

          {/* Empty State Text */}
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyText}>لا توجد أي طلبات حاليةً</Text>
          </View>
        </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity 
              key={order._id} 
              style={styles.orderCard}
              onPress={() => {
                console.log('🔍 Order clicked:', {
                  id: order._id,
                  status: order.status,
                  hasFarmer: !!order.farmer,
                  isAccepted: order.status === 'accepted',
                  isCompleted: order.status === 'completed',
                  shouldOpenModal: order.status === 'accepted' || order.status === 'in_progress' || order.status === 'working'
                });
                
                if (order.status === 'accepted' || order.status === 'in_progress' || order.status === 'working') {
                  console.log('🔍 Setting selected order and showing modal');
                  setSelectedOrder(order);
                  setShowContactModal(true);
                  console.log('🔍 Modal state should now be true');
                } else {
                  console.log('🔍 Order status is not accepted/work started/currently working, not showing modal');
                }
              }}
              activeOpacity={order.status === 'accepted' || order.status === 'in_progress' || order.status === 'working' ? 0.7 : 1}
            >
              <View style={styles.orderContent}>
                <View style={styles.orderMainInfo}>
                  <Text style={styles.serviceTitle}>{getServiceName(order.serviceType)}</Text>
                </View>
                <View style={styles.locationRow}>
                  <FontAwesome5 name="map-marker-alt" size={16} color="#666" style={{ marginLeft: 6 }} />
                  <Text style={styles.locationText}>{order.location.address}</Text>
                </View>
                
                {order.orderNumber && (
                  <View style={styles.orderNumberContainer}>
                    <Text style={styles.orderNumber}>رقم الطلب: {order.orderNumber}</Text>
                  </View>
                )}
                
                {order.description && (
                  <Text style={styles.orderDescription}>{order.description}</Text>
                )}
                
                {order.farmer && (
                  <Text style={styles.farmerInfo}>
                    المزارع: {order.farmer.name}
                  </Text>
                )}

                {(order.price || order.estimatedCost) && (
                  <Text style={styles.priceInfo}>
                    السعر: {order.price || order.estimatedCost} ريال
                  </Text>
                )}
                
                <View style={styles.orderFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                  <Text style={styles.orderTime}>
                    {getTimeAgo(order.createdAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>



      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('🔍 Contact modal closing');
          setShowContactModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.contactModalContainer}>
            <View style={styles.contactModalContent}>
              {/* Header */}
              <View style={styles.contactModalHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowContactModal(false)}
                >
                  <FontAwesome5 name="times" size={20} color="#666" />
                </TouchableOpacity>
                <Text style={styles.contactModalTitle}>التواصل مع المزارع</Text>
              </View>

              {/* Farmer Info */}
              {selectedOrder && (
                <View style={styles.farmerContactInfo}>
                  <View style={styles.farmerAvatar}>
                    <FontAwesome5 name="user" size={30} color="#4CAF50" />
                  </View>
                  <Text style={styles.farmerContactName}>
                    {selectedOrder.farmer?.name || 'المزارع المسؤول'}
                  </Text>
                  <Text style={styles.farmerContactPhone}>
                    {selectedOrder.farmer?.phone || 'سيتم توفير رقم الهاتف قريباً'}
                  </Text>
                  <Text style={styles.serviceContactTitle}>
                    {getServiceName(selectedOrder.serviceType)}
                  </Text>
                </View>
              )}

              {/* Contact Options */}
              <View style={styles.contactOptions}>
                <TouchableOpacity
                  style={[styles.chatButton, !selectedOrder?.farmer && styles.disabledButton]}
                  onPress={() => {
                    if (selectedOrder?.farmer) {
                      setShowContactModal(false);
                      // Navigate to real chat with farmer data
                      router.push({
                        pathname: '/(tabs)/chats/message',
                        params: {
                          orderId: selectedOrder._id,
                          farmerId: selectedOrder.farmer._id || 'unknown',
                          farmerName: selectedOrder.farmer.name,
                          farmerAvatar: selectedOrder.farmer.avatar
                        }
                      });
                    } else {
                      Alert.alert('تنبيه', 'لا يمكن بدء المحادثة حتى يتم قبول الطلب من قبل مزارع');
                    }
                  }}
                >
                  <FontAwesome5 name="comments" size={24} color="#fff" />
                  <Text style={styles.chatButtonText}>محادثة</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.callButton, !selectedOrder?.farmer?.phone && styles.disabledButton]}
                  onPress={() => {
                    if (selectedOrder?.farmer?.phone) {
                      Linking.openURL(`tel:${selectedOrder.farmer.phone}`);
                    } else {
                      Alert.alert('تنبيه', 'رقم الهاتف غير متوفر حالياً');
                    }
                  }}
                >
                  <FontAwesome5 name="phone" size={24} color="#fff" />
                  <Text style={styles.callButtonText}>اتصال</Text>
                </TouchableOpacity>
              </View>

              {/* Order Status Info */}
              <View style={styles.contactOrderInfo}>
                <Text style={styles.contactOrderStatus}>
                  حالة الطلب: {getStatusText(selectedOrder?.status || '')}
                </Text>
                {selectedOrder?.price || selectedOrder?.estimatedCost ? (
                  <Text style={styles.contactOrderPrice}>
                    السعر: {selectedOrder.price || selectedOrder.estimatedCost} ريال
                  </Text>
                ) : null}
              </View>
              {/* Track Order Button - duplicate of order status container */}
              <TouchableOpacity
                style={[styles.contactOrderInfo, { marginTop: 12 }]}
                activeOpacity={0.7}
                onPress={() => {
                  if (selectedOrder) {
                    setShowContactModal(false);
                    router.push({
                      pathname: '/(tabs)/chats/track-order',
                      params: {
                        orderId: selectedOrder._id,
                        farmerName: selectedOrder.farmer?.name,
                        farmerId: selectedOrder.farmer?._id
                      }
                    });
                  }
                }}
              >
                <Text style={styles.contactOrderStatus}>تتبع الطلب</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Navigation Bar Styles
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

  // Status Bar Styles
  statusBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },

  statusBarLeft: {
    flex: 1,
  },

  timeText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.4,
  },

  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Signal Icon
  signalIcon: {
    width: 16,
    height: 16,
    tintColor: '#ffffff',
  },

  // WiFi Icon
  wifiIcon: {
    width: 16,
    height: 16,
    tintColor: '#ffffff',
  },

  // Battery Icon
  batteryIcon: {
    width: 16,
    height: 16,
    tintColor: '#ffffff',
  },

  // Navigation Content
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

  notificationButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
    zIndex: 1,
  },

  backArrow: {
    width: 20,
    height: 20,
    tintColor: '#F4F4F4',
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

  // Main Content Styles
  mainContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 320,
    backgroundColor: 'rgba(76, 175, 80, 0.02)',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },

  iconContainer: {
    marginBottom: 28,
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 20,
    borderRadius: 20,
  },

  emptyStateIcon: {
    width: 80,
    height: 80,
    tintColor: '#4CAF50',
  },

  emptyTextContainer: {
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.3,
  },

  // New styles for orders
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  ordersContentContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },

  orderCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    marginBottom: 24,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    transform: [{ translateY: 0 }],
  },

  orderContent: {
    padding: 12,
    alignItems: 'flex-end',
  },

  orderMainInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 8,
  },

  orderTime: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textAlign: 'center',
  },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'right',
    width: '100%',
  },
  orderNumberContainer: {
    alignItems: 'flex-end',
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  orderNumber: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 6,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 6,
  },

  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    textAlign: 'right',
    fontWeight: '500',
  },

  orderDescription: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    textAlign: 'right',
    lineHeight: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    width: '100%',
  },

  farmerInfo: {
    fontSize: 15,
    color: '#333',
    fontWeight: '700',
    textAlign: 'right',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  priceInfo: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '800',
    textAlign: 'right',
    backgroundColor: 'rgba(46, 125, 50, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 6,
    letterSpacing: 0.4,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)',
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

  // Contact Modal Styles
  contactModalContainer: {
    width: width * 0.92,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },

  contactModalContent: {
    padding: 28,
    alignItems: 'center',
  },

  contactModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },

  closeButton: {
    position: 'absolute',
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  contactModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  farmerContactInfo: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    backgroundColor: '#f8fffe',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },

  farmerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  farmerContactName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: -0.3,
  },

  farmerContactPhone: {
    fontSize: 15,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'monospace',
    fontWeight: '600',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  serviceContactTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },

  contactOptions: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'center',
  },

  chatButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  chatButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  callButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  callButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  disabledButton: {
    backgroundColor: '#e0e0e0',
    shadowColor: '#e0e0e0',
    shadowOpacity: 0.1,
  },

  contactOrderInfo: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  contactOrderStatus: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
  },

  contactOrderPrice: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
});

export default User17;
