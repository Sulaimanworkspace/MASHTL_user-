import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, Image, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createServiceOrder, getUserData, cancelServiceOrder, getUserNotifications, markNotificationAsRead } from '../../services/api';

export default function SearchingFarmsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  // Animated dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Check for new notifications
  const checkNotifications = async () => {
    try {
      const userData = await getUserData();
      if (!userData || !userData._id) return;

      console.log('🔔 [SearchingFarms] Checking notifications for user:', userData._id);
      const response = await getUserNotifications(userData._id);
      
      if (response.success) {
        console.log('🔔 [SearchingFarms] All notifications:', response.data);
        console.log('🔔 [SearchingFarms] Notification types found:', response.data.map((n: any) => ({ type: n.type, isRead: n.isRead, title: n.title })));
        
        // Find unread order acceptance notifications
        const unreadAcceptanceNotification = response.data.find(
          (notification: any) => 
            notification.type === 'order_accepted' && !notification.isRead
        );

        // Find unread order rejection notifications
        const unreadRejectionNotification = response.data.find(
          (notification: any) => 
            notification.type === 'order_rejected' && !notification.isRead
        );

        console.log('🔔 [SearchingFarms] Found unread acceptance notification:', unreadAcceptanceNotification);
        console.log('🔔 [SearchingFarms] Found unread rejection notification:', unreadRejectionNotification);

        if (unreadAcceptanceNotification) {
          setCurrentNotification(unreadAcceptanceNotification);
          setShowNotificationModal(true);
          console.log('🔔 [SearchingFarms] Showing acceptance notification modal');
        } else if (unreadRejectionNotification) {
          setCurrentNotification(unreadRejectionNotification);
          setShowNotificationModal(true);
          console.log('🔔 [SearchingFarms] Showing rejection notification modal');
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
      
      const createOrder = async () => {
        try {
          const userData = await getUserData();
          if (!userData) {
            console.error('❌ No user data found');
            return;
          }

          // Get service details from params or use defaults
          const serviceType = (params.projectName as string) || 'تنسيق الحدائق';
          const description = (params.description as string) || 'خدمة تصميم وتنفيذ الحدائق المنزلية';
          
          const orderData = {
            serviceType,
            serviceTitle: serviceType,
            description,
            location: {
              address: 'الرياض حي الزهرة, الرياض',
              city: 'الرياض',
              coordinates: {
                latitude: 24.7136,
                longitude: 46.6753
              }
            },
            notes: 'طلب جديد من التطبيق'
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

  // Periodic notification checking
  React.useEffect(() => {
    // Check notifications immediately
    checkNotifications();
    
    // Then check every 3 seconds while on this screen
    const notificationInterval = setInterval(() => {
      console.log('🔔 [SearchingFarms] Periodic notification check');
      checkNotifications();
    }, 3000);

    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

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
          <TouchableOpacity style={styles.backButton} onPress={() => setShowModal(true)}>
            <FontAwesome5 name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/images/icon.jpg')}
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
    top: -8,
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