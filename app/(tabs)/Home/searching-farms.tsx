import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, Image, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createServiceOrder, getUserData, cancelServiceOrder, getUserNotifications, markNotificationAsRead, refreshUserDataFromServer } from '../../services/api';
import io from 'socket.io-client';

export default function SearchingFarmsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  // Debug modal state changes
  useEffect(() => {
    console.log('🔔 [SearchingFarms] Modal state changed:', {
      showNotificationModal,
      currentNotification: currentNotification ? {
        id: currentNotification._id,
        type: currentNotification.type,
        title: currentNotification.title
      } : null
    });
  }, [showNotificationModal, currentNotification]);

  // Animated dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Check for new notifications - ONLY for current order
  const checkNotifications = async () => {
    try {
      // First refresh user data from server to get latest location
      try {
        console.log('🔄 Refreshing user data from server to get latest location...');
        await refreshUserDataFromServer();
        console.log('✅ User data refreshed from server');
      } catch (refreshError) {
        console.log('⚠️ Could not refresh from server, using local data:', refreshError);
      }
      
      const userData = await getUserData();
      if (!userData || !userData._id) return;

      // Only check notifications if we have a current order
      if (!createdOrderId) {
        console.log('🔔 [SearchingFarms] No current order ID - skipping notification check');
        return;
      }

      console.log('🔔 [SearchingFarms] Checking notifications for current order:', createdOrderId);
      const response = await getUserNotifications(userData._id);
      
      if (response.success) {
        // Only look for notifications related to the current order
        const currentOrderNotifications = response.data.filter(
          (notification: any) => {
            const isMatch = notification.relatedId && notification.relatedId.toString() === createdOrderId;
            console.log('🔔 [SearchingFarms] Checking notification:', {
              notificationId: notification._id,
              notificationRelatedId: notification.relatedId,
              currentOrderId: createdOrderId,
              isMatch: isMatch,
              isUnread: !notification.isRead,
              type: notification.type
            });
            return isMatch && !notification.isRead;
          }
        );

        console.log('🔔 [SearchingFarms] All notifications:', response.data);
        console.log('🔔 [SearchingFarms] Current order ID:', createdOrderId);
        console.log('🔔 [SearchingFarms] Current order notifications:', currentOrderNotifications);
        
        // Find unread order acceptance notification for current order
        const unreadAcceptanceNotification = currentOrderNotifications.find(
          (notification: any) => notification.type === 'order_accepted'
        );

        // Find unread order rejection notification for current order
        const unreadRejectionNotification = currentOrderNotifications.find(
          (notification: any) => notification.type === 'order_rejected'
        );

        console.log('🔔 [SearchingFarms] Found unread acceptance notification for current order:', unreadAcceptanceNotification);
        console.log('🔔 [SearchingFarms] Found unread rejection notification for current order:', unreadRejectionNotification);

        // Only show modal if we're still on this screen and have a current order
        if (unreadAcceptanceNotification && createdOrderId) {
          console.log('🔔 [SearchingFarms] Setting acceptance notification and showing modal');
          setCurrentNotification(unreadAcceptanceNotification);
          setShowNotificationModal(true);
          console.log('🔔 [SearchingFarms] Modal state should now be true for acceptance');
        } else if (unreadRejectionNotification && createdOrderId) {
          console.log('🔔 [SearchingFarms] Setting rejection notification and showing modal');
          setCurrentNotification(unreadRejectionNotification);
          setShowNotificationModal(true);
          console.log('🔔 [SearchingFarms] Modal state should now be true for rejection');
        } else {
          console.log('🔔 [SearchingFarms] No unread notifications found for current order or order ID cleared');
          console.log('🔔 [SearchingFarms] Current order ID:', createdOrderId);
          console.log('🔔 [SearchingFarms] Acceptance notification:', unreadAcceptanceNotification);
          console.log('🔔 [SearchingFarms] Rejection notification:', unreadRejectionNotification);
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  // Create service order when screen is focused (fresh each time)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Screen focused - resetting state and creating new order');
      
      // Reset state completely on each focus
      setOrderCreated(false);
      setCreatedOrderId(null);
      setShowModal(false);
      setShowNotificationModal(false);
      setCurrentNotification(null);
      
      const createOrder = async () => {
        try {
          // First refresh user data from server to get latest location
          try {
            console.log('🔄 Refreshing user data from server to get latest location...');
            await refreshUserDataFromServer();
            console.log('✅ User data refreshed from server');
          } catch (refreshError) {
            console.log('⚠️ Could not refresh from server, using local data:', refreshError);
          }
          
          const userData = await getUserData();
          if (!userData) {
            console.error('❌ No user data found');
            return;
          }

          // Get service details from params or use defaults
          const serviceType = (params.projectName as string) || 'تنسيق الحدائق';
          const description = (params.description as string) || 'خدمة تصميم وتنفيذ الحدائق المنزلية';
          
          // Get location from params or use user's saved location or defaults
          let locationData = {
            address: 'الرياض حي الزهرة, الرياض',
            city: 'الرياض',
            coordinates: {
              latitude: 24.7136,
              longitude: 46.6753
            }
          };

          // Try to parse location from params first
          if (params.location) {
            try {
              const parsedLocation = JSON.parse(params.location as string);
              locationData = {
                address: parsedLocation.address,
                city: parsedLocation.city || 'الرياض',
                coordinates: {
                  latitude: parsedLocation.latitude || 24.7136,
                  longitude: parsedLocation.longitude || 46.6753
                }
              };
            } catch (error) {
              console.error('Error parsing location from params:', error);
            }
          } else if (userData.location && userData.location.address) {
            // Fall back to user's saved location
            locationData = {
              address: userData.location.address,
              city: userData.location.city || 'الرياض',
              coordinates: {
                latitude: userData.location.latitude || 24.7136,
                longitude: userData.location.longitude || 46.6753
              }
            };
          }

          // Get notes from params or use default
          const notes = (params.notes as string)?.trim() || 'لا يوجد ملاحظات';
          
          const orderData = {
            serviceType,
            serviceTitle: serviceType,
            description,
            location: locationData,
            notes
          };

          console.log('🔄 Creating fresh service order:', orderData);
          const response = await createServiceOrder(orderData);
          console.log('✅ Service order created successfully:', response);
          
          if (response && response.data && response.data._id) {
            setOrderCreated(true);
            setCreatedOrderId(response.data._id);
            console.log('📝 New order ID stored:', response.data._id);
          } else {
            console.error('❌ Invalid response from createServiceOrder:', response);
          }
          
        } catch (error) {
          console.error('💥 Error creating service order:', error);
          // Reset state on error to allow retry
          setOrderCreated(false);
          setCreatedOrderId(null);
        }
      };

      // Create order after a small delay to ensure state is reset
      const timer = setTimeout(createOrder, 200);
      
      // Cleanup function
      return () => {
        clearTimeout(timer);
        // Clear notification modal state when screen is unfocused
        setShowNotificationModal(false);
        setCurrentNotification(null);
      };
    }, [params.projectName, params.description]) // Depend on params to recreate when they change
  );

  React.useEffect(() => {
    Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true, easing: Easing.linear }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true, easing: Easing.linear }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true, easing: Easing.linear }),
        ]),
      ])
    ).start();
  }, []);

  // Initialize Socket.IO for real-time updates
  useEffect(() => {
    const socket = io('http://172.20.10.12:9090');
    
    socket.on('connect', () => {
      console.log('🔌 [SearchingFarms] Connected to socket server');
    });

    socket.on('order_status_update', (data: any) => {
      console.log('🔌 [SearchingFarms] Order status update received:', data);
      console.log('🔌 [SearchingFarms] Current order ID:', createdOrderId);
      console.log('🔌 [SearchingFarms] Data order ID:', data.orderId);
      
      // Check if this update is for our current order
      if (createdOrderId && data.orderId && data.orderId.toString() === createdOrderId) {
        console.log('🔌 [SearchingFarms] This is our order! Status:', data.status);
        
        // If order was accepted or rejected, check for notifications immediately
        if (data.status === 'accepted' || data.status === 'rejected') {
          console.log('🔌 [SearchingFarms] Order accepted/rejected - checking notifications immediately');
          setTimeout(() => {
            checkNotifications();
          }, 1000); // Small delay to ensure notification is created
        }
      } else {
        console.log('🔌 [SearchingFarms] Not our order or no current order ID');
        // Fallback: check notifications anyway in case of timing issues
        if (data.status === 'accepted' || data.status === 'rejected') {
          console.log('🔌 [SearchingFarms] Fallback: checking notifications for any order');
          setTimeout(() => {
            checkNotifications();
          }, 1500);
        }
      }
    });

    socket.on('order_update', (data: any) => {
      console.log('🔌 [SearchingFarms] Order update received:', data);
      
      // If this is a new order and we have a current order, check if it's ours
      if (data.type === 'new' && createdOrderId && data.order._id === createdOrderId) {
        console.log('🔌 [SearchingFarms] Our order was updated:', data.order);
        // Check notifications for any status changes
        setTimeout(() => {
          checkNotifications();
        }, 1000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Remove dependency to ensure socket is always active

  // Periodic notification checking
  React.useEffect(() => {
    // Check notifications immediately
    checkNotifications();
    
    // More frequent checking when we have an active order
    const interval = createdOrderId ? 3000 : 10000; // 3 seconds if order exists, 10 seconds otherwise
    
    const notificationInterval = setInterval(() => {
      console.log('🔔 [SearchingFarms] Periodic notification check (interval: ' + interval + 'ms)');
      checkNotifications();
    }, interval);

    return () => {
      clearInterval(notificationInterval);
    };
  }, [createdOrderId]); // Re-run when order ID changes

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      {/* Green Header */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.navContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>جاري البحث</Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
        <Text style={styles.mainText}>جارِ البحث عن أقرب مزارع...</Text>
        <Text style={styles.subText}>نحن نبحث عن أفضل مزارع بالقرب منك</Text>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.cancelButtonText}>إلغاء البحث</Text>
        </TouchableOpacity>
      </View>
      {/* Modal for back warning */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>سيتم إلغاء البحث عن المزارع. هل أنت متأكد؟</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowModal(false)}>
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF3B30' }]} onPress={async () => {
                setShowModal(false);
                // Cancel the order if it was created
                if (createdOrderId) {
                  try {
                    console.log('🚫 Attempting to cancel order:', createdOrderId);
                    await cancelServiceOrder(createdOrderId);
                    console.log('✅ Order cancelled successfully');
                  } catch (error: any) {
                    console.error('💥 Error cancelling order:', error);
                    if (error.response?.status === 404) {
                      console.log('ℹ️ Order not found (likely already processed) - continuing');
                    } else if (error.response?.status === 403) {
                      console.log('ℹ️ Authorization error (order may belong to different user) - continuing');
                    } else {
                      console.log('⚠️ Other error occurred - continuing anyway');
                    }
                    // Don't block navigation regardless of error type
                  }
                  // Reset the order ID after cancel attempt
                  setCreatedOrderId(null);
                  setOrderCreated(false);
                } else {
                  console.log('ℹ️ No order to cancel');
                }
                router.back();
              }}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>تأكيد</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.notificationModalOverlay}>
          <View style={styles.notificationModalContainer}>
            {/* X Button to close and go to home */}
            <TouchableOpacity
              style={styles.notificationModalCloseButton}
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
                
                // Navigate to home page
                router.push('/(tabs)/Home');
              }}
            >
              <FontAwesome5 name="times" size={20} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.notificationModalContent}>
              {/* Icon - Different for acceptance vs rejection */}
              <View style={styles.successIconContainer}>
                <FontAwesome5 
                  name={currentNotification?.type === 'order_rejected' ? "times-circle" : "check-circle"} 
                  size={50} 
                  color={currentNotification?.type === 'order_rejected' ? "#FF3B30" : "#4CAF50"} 
                />
              </View>
              
              {/* Title */}
              <Text style={styles.notificationModalTitle}>
                {currentNotification?.title || (currentNotification?.type === 'order_rejected' ? 'تم رفض طلبك' : 'تم قبول طلبك')}
              </Text>
              
              {/* Message */}
              <Text style={styles.notificationModalMessage}>
                {currentNotification?.message || (currentNotification?.type === 'order_rejected' ? 'تم رفض طلبك من قبل المزارع' : 'تم قبول طلبك بنجاح من قبل المزارع')}
              </Text>
              
              {/* OK Button */}
              <TouchableOpacity
                style={[
                  styles.notificationModalButton,
                  { backgroundColor: currentNotification?.type === 'order_rejected' ? '#FF3B30' : '#4CAF50' }
                ]}
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
                  
                  // Navigate to orders page to see the order
                  router.push('/(tabs)/orders');
                }}
              >
                <Text style={styles.notificationModalButtonText}>عرض الطلب</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -60,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginHorizontal: 6,
  },
  mainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3a22',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Notification Modal styles
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationModalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },

  notificationModalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },

  notificationModalContent: {
    padding: 24,
    alignItems: 'center',
  },

  successIconContainer: {
    marginBottom: 16,
  },

  notificationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },

  notificationModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  notificationModalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },

  notificationModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 