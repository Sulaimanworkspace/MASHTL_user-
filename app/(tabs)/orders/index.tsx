import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
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
  Alert
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

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const response = await getUserServiceOrders();
      if (response.success) {
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
          
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              console.log('🔔 Manual notification check triggered');
              checkNotifications();
            }}
          >
            <FontAwesome5 name="bell" size={18} color="#FFFFFF" />
          </TouchableOpacity>
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
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                </Text>
              </View>
              
              <View style={styles.orderContent}>
                <Text style={styles.serviceTitle}>{order.serviceTitle}</Text>
                <View style={styles.locationRow}>
                  <FontAwesome5 name="map-marker-alt" size={14} color="#666" />
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
              </View>
            </View>
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
    maxWidth: 300,
  },

  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },

  emptyStateIcon: {
    width: 120,
    height: 120,
    tintColor: '#CCCCCC',
  },

  emptyTextContainer: {
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
  },

  // New styles for orders
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  ordersContentContainer: {
    padding: 16,
  },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  orderDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
  },

  orderContent: {
    padding: 16,
    alignItems: 'flex-end',
  },

  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
    width: '100%',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
    width: '100%',
  },

  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    textAlign: 'right',
  },

  orderDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    textAlign: 'right',
    lineHeight: 20,
  },

  farmerInfo: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'right',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },

  modalContent: {
    padding: 24,
    alignItems: 'center',
  },

  successIconContainer: {
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

export default User17;
