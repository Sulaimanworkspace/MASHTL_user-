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
  Linking
} from 'react-native';
import { getUserData, getUserServiceOrders, getUserNotifications, markNotificationAsRead } from '../../services/api';

const { width, height } = Dimensions.get('window');

interface ServiceOrder {
  _id: string;
  serviceType: string;
  serviceTitle: string;
  description: string;
  location: {
    address: string;
    city: string;
  };
  farmer?: {
    name: string;
    farmName: string;
    phone: string;
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

const User17: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // Debug contact modal state changes
  useEffect(() => {
    console.log('🔍 Contact modal state changed:', showContactModal);
  }, [showContactModal]);

  useEffect(() => {
    console.log('🔍 Selected order changed:', selectedOrder ? selectedOrder._id : 'null');
  }, [selectedOrder]);

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const response = await getUserServiceOrders();
      if (response.success) {
        console.log('🔍 Fetched orders:', response.data.map((order: ServiceOrder) => ({
          id: order._id,
          status: order.status,
          serviceTitle: order.serviceTitle,
          hasFarmer: !!order.farmer
        })));
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Check for new notifications
  const checkNotifications = async () => {
    try {
      const userData = await getUserData();
      if (!userData || !userData._id) return;

      console.log('🔔 Checking notifications for user:', userData._id);
      const response = await getUserNotifications(userData._id);
      console.log('🔔 Notifications response:', response);
      
      if (response.success) {
        console.log('🔔 All notifications:', response.data);
        
        // Find unread order acceptance notifications
        const unreadAcceptanceNotification = response.data.find(
          (notification: Notification) => 
            notification.type === 'order_accepted' && !notification.isRead
        );

        console.log('🔔 Found unread acceptance notification:', unreadAcceptanceNotification);

        if (unreadAcceptanceNotification) {
          setCurrentNotification(unreadAcceptanceNotification);
          setShowNotificationModal(true);
          console.log('🔔 Showing notification modal');
        } else {
          console.log('🔔 No unread acceptance notifications found');
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  // Check authentication and redirect if not logged in
  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        try {
          const userData = await getUserData();
          if (!userData || !userData.name) {
            router.replace('/(tabs)/auth/login');
            return;
          }
          setIsLoggedIn(true);
          setIsLoading(false);
          
          // Fetch orders and check notifications
          await fetchOrders();
          await checkNotifications();
        } catch (error) {
          router.replace('/(tabs)/auth/login');
        }
      };
      checkAuthStatus();
    }, [])
  );

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    await checkNotifications();
    setRefreshing(false);
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#22c55e';
      case 'completed': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'accepted': return 'مقبول';
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
    <View style={styles.container}>
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
            <Text style={styles.title}>طلباتى</Text>
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
                  shouldOpenModal: order.status === 'accepted' || order.status === 'completed'
                });
                
                if (order.status === 'accepted' || order.status === 'completed') {
                  console.log('🔍 Setting selected order and showing modal');
                  setSelectedOrder(order);
                  setShowContactModal(true);
                  console.log('🔍 Modal state should now be true');
                } else {
                  console.log('🔍 Order status is not accepted/completed, not showing modal');
                }
              }}
              activeOpacity={order.status === 'accepted' || order.status === 'completed' ? 0.7 : 1}
            >
              <View style={styles.orderContent}>
                <View style={styles.orderMainInfo}>
                  <Text style={styles.serviceTitle}>{order.serviceTitle}</Text>
                </View>
                
                <View style={styles.locationRow}>
                  <FontAwesome5 name="map-marker-alt" size={16} color="#4CAF50" />
                  <Text style={styles.locationText}>{order.location.address}</Text>
                </View>
                
                {order.description && (
                  <Text style={styles.orderDescription}>{order.description}</Text>
                )}
                
                {order.farmer && (
                  <Text style={styles.farmerInfo}>
                    المزارع: {order.farmer.name || order.farmer.farmName}
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

      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Success Icon */}
              <View style={styles.successIconContainer}>
                <FontAwesome5 name="check-circle" size={50} color="#4CAF50" />
              </View>
              
              {/* Title */}
              <Text style={styles.modalTitle}>
                {currentNotification?.title || 'تم قبول طلبك'}
              </Text>
              
              {/* Message */}
              <Text style={styles.modalMessage}>
                {currentNotification?.message || 'تم قبول طلبك بنجاح من قبل المزارع'}
              </Text>
              
              {/* OK Button */}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  // Mark notification as read
                  if (currentNotification) {
                    try {
                      const userData = await getUserData();
                      if (userData && userData._id) {
                        await markNotificationAsRead(currentNotification._id, userData._id);
                      }
                    } catch (error) {
                      console.error('Error marking notification as read:', error);
                    }
                  }
                  
                  setShowNotificationModal(false);
                  setCurrentNotification(null);
                  
                  // Refresh orders to show updated data
                  await fetchOrders();
                }}
              >
                <Text style={styles.modalButtonText}>حسناً</Text>
              </TouchableOpacity>
            </View>
          </View>
      </View>
      </Modal>

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
                    {selectedOrder.farmer?.name || selectedOrder.farmer?.farmName || 'المزارع المسؤول'}
                  </Text>
                  <Text style={styles.farmerContactPhone}>
                    {selectedOrder.farmer?.phone || 'سيتم توفير رقم الهاتف قريباً'}
                  </Text>
                  <Text style={styles.serviceContactTitle}>
                    {selectedOrder.serviceTitle}
                  </Text>
                </View>
              )}

              {/* Contact Options */}
              <View style={styles.contactOptions}>
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => {
                    setShowContactModal(false);
                    router.push('/(tabs)/chats');
                  }}
                >
                  <FontAwesome5 name="comments" size={24} color="#fff" />
                  <Text style={styles.chatButtonText}>محادثة</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.callButton, !selectedOrder?.farmer?.phone && styles.disabledButton]}
                  onPress={() => {
                    if (selectedOrder?.farmer?.phone) {
                      const phoneNumber = selectedOrder.farmer.phone.replace(/\s+/g, '');
                      Linking.openURL(`tel:${phoneNumber}`);
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

  // Navigation Bar Styles
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
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'right',
    letterSpacing: 0.2,
    flex: 1,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 6,
    width: '100%',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  locationText: {
    fontSize: 13,
    color: '#388E3C',
    marginLeft: 6,
    textAlign: 'right',
    fontWeight: '500',
  },

  orderDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    textAlign: 'right',
    lineHeight: 20,
    backgroundColor: 'rgba(245, 245, 245, 0.6)',
    padding: 8,
    borderRadius: 8,
    width: '100%',
  },

  farmerInfo: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '700',
    textAlign: 'right',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
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
