import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, getNotificationCount, getServices, refreshUserDataFromServer } from '../../services/api';
import { ensureFreshUserData } from '../../utils/userDataManager';
import pusherService from '../../services/pusher';
import { notificationService } from '../../services/notifications';
import Banner from '../../components/Banner';
import CustomFooter from '../../components/CustomFooter';
import LocationPickerModal from '../../components/LocationPickerModal';
import TwoFactorTest from '../../components/TwoFactorTest';
// import { useSpinner } from '../../contexts/SpinnerContext'; //comment out 

// Debug notifications service import
console.log('🔧 [HOME] Importing notificationService:', notificationService);
console.log('🔧 [HOME] notificationService type:', typeof notificationService);
console.log('🔧 [HOME] notificationService has initialize:', notificationService && typeof notificationService.initialize === 'function');

const { width, height } = Dimensions.get('window');

interface ServiceItemProps {
  imageUri: string;
  title: string;
  onPress?: () => void;
  style?: any;
}

const ServiceItem: React.FC<ServiceItemProps> = React.memo(({ imageUri, title, onPress, style }) => {
  const [imageError, setImageError] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  return (
  <TouchableOpacity style={styles.serviceItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.serviceImageContainer}>
        <Animated.Image 
          source={{ 
            uri: imageUri,
            cache: 'force-cache' // Force cache to prevent mixing
          }} 
          style={[
            styles.serviceImage,
            { opacity: fadeAnim }
          ]}
          onLoadStart={() => {
            fadeAnim.setValue(0);
          }}
          onLoad={() => {
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }}
          onError={() => {
            setImageError(true);
          }}
        />
        {imageError && (
          <View style={styles.imageErrorContainer}>
            <FontAwesome5 name="image" size={20} color="#ccc" />
          </View>
        )}
    </View>
    <View style={styles.serviceTitleContainer}>
      <Text style={styles.serviceTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);
});

interface TabItemProps {
  imageUri: string;
  title: string;
  isActive?: boolean;
  onPress?: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ imageUri, title, isActive = false, onPress }) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
    <Image source={{ uri: imageUri }} style={[styles.tabIcon, isActive && styles.activeTabIcon]} />
    <Text style={[styles.tabTitle, isActive && styles.activeTabTitle]}>{title}</Text>
  </TouchableOpacity>
);

interface ServiceData {
  _id: string;
  title: string;
  image: string;
  description: string;
  serviceType: string;
  features: string[];
  rating: number;
  isActive: boolean;
  order: number;
}

const User4: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userName, setUserName] = useState('بك في مشتل');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState('اختر موقعك');
  const [notificationCount, setNotificationCount] = useState(0);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isNetworkConnected, setIsNetworkConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [servicesLoaded, setServicesLoaded] = useState(false);

  // Check for refresh parameters from map-picker
  useEffect(() => {
    if (params.refreshLocation === 'true') {
      console.log('🔄 Location refresh detected - will refresh on next focus');
      // The actual refresh will happen in useFocusEffect
    }
  }, [params.refreshLocation]);

  // Debug: Log notification count changes
  useEffect(() => {
    console.log('🔴 Notification count changed to:', notificationCount);
  }, [notificationCount]);

  // Set up Pusher for real-time notification updates
  useEffect(() => {
    if (isLoggedIn) {
      console.log('🔌 Setting up Pusher for real-time notifications');
      
      // Initialize notification service
      notificationService.initialize().then((success) => {
        if (success) {
          console.log('✅ Notification service initialized successfully');
        } else {
          console.log('❌ Failed to initialize notification service');
          // Request permission manually
          requestNotificationPermission().then(async (granted) => {
            if (granted) {
              await notificationService.initialize();
        }
      });
        }
      });

      // Initialize Pusher connection
      const initializePusher = async () => {
        try {
          console.log('🔌 Initializing Pusher connection...');
          
          // Check user data first
          const userData = await AsyncStorage.getItem('user_data');
          console.log('🔌 User data from storage:', userData);
          if (userData) {
            const parsed = JSON.parse(userData);
            console.log('🔌 Parsed user ID:', parsed._id);
          }
          
          await pusherService.initialize();
          
          // Check connection status
          console.log('🔌 Pusher connected:', pusherService.isConnected());
          console.log('🔌 Current user ID:', pusherService.getCurrentUserId());
          
          // Listen for new notifications
          pusherService.on('new_notification', async (notification: any) => {
            console.log('📱 Pusher notification received:', notification);
            console.log('📱 Notification title:', notification.title);
            console.log('📱 Notification message:', notification.message);
            setNotificationCount(prev => prev + 1);
            
            // Send local notification for dropdown
            try {
              console.log('📱 Attempting to send local notification...');
              await notificationService.sendLocalNotification({
              title: notification.title || 'رسالة جديدة',
              body: notification.message || 'لديك رسالة جديدة من المزارع',
              data: notification
            });
              console.log('📱 Local notification sent successfully');
            } catch (error) {
              console.error('📱 Error sending local notification:', error);
            }
          });
          
          // Listen for connection events
          pusherService.on('connect', () => {
            console.log('🔌 Pusher connected successfully');
          });
          
          pusherService.on('disconnect', () => {
            console.log('🔌 Pusher disconnected');
          });
          
          pusherService.on('connect_error', (error: any) => {
            console.error('🔌 Pusher connection error:', error);
          });
          
        } catch (error) {
          console.error('❌ Error initializing WebSocket:', error);
        }
      };

      initializePusher();

      // Set up notification response listener (when user taps notification)
      const notificationResponseListener = notificationService.addNotificationResponseReceivedListener((response) => {
        console.log('📱 Notification tapped:', response);
        const data = response.notification.request.content.data;
        
        // Navigate to chat if it's a chat notification
        if (data && data.type === 'chat' && data.orderId) {
          router.push('/(tabs)/chats');
        }
      });

      // Cleanup on unmount
      return () => {
        console.log('🔌 Cleaning up Pusher connection');
        pusherService.off('new_notification');
        notificationResponseListener?.remove();
      };
    }
  }, [isLoggedIn]);

  // Load services on component mount (only once)
  useEffect(() => {
    const loadServices = async () => {
      if (servicesLoaded) return; // Prevent multiple loads
      
      try {
        console.log('🔄 Loading services...');
        setIsLoading(true); // Show loading state
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
          
          // Sort by order
          allServices.sort((a, b) => a.order - b.order);
          
          setServices(allServices);
          setIsNetworkConnected(true);
          setServicesLoaded(true);
          console.log('✅ Services loaded successfully:', allServices.length);
        } else {
          // If API response is not successful, don't show any services
          setServices([]);
          setIsNetworkConnected(false);
          setServicesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading services:', error);
        // If API fails due to network issues, don't show any services
        setServices([]);
        setIsNetworkConnected(false);
        setServicesLoaded(true);
      } finally {
        setIsLoading(false); // Hide loading state
      }
    };
    loadServices();
  }, [servicesLoaded]);

  // Check network connectivity when screen is focused (only if services not loaded)
  useFocusEffect(
    useCallback(() => {
      if (servicesLoaded) return; // Skip if services already loaded
      
      const checkNetworkConnectivity = async () => {
        try {
          const response = await getServices();
          if (response.success) {
            setIsNetworkConnected(true);
          } else {
            setIsNetworkConnected(false);
            setServices([]);
          }
        } catch (error) {
          console.error('Network connectivity check failed:', error);
          setIsNetworkConnected(false);
          setServices([]);
        }
      };

      checkNetworkConnectivity();
    }, [servicesLoaded])
  );

  // Load user data every time screen is focused (including after auth)
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          setIsLoading(true);
          
          // Check if we need to force refresh due to location update
          const shouldForceRefresh = params.refreshLocation === 'true';
          
          if (shouldForceRefresh) {
            console.log('🔄 Force refresh detected - clearing all cached data...');
            
            // Clear all cached data
            try {
              await AsyncStorage.multiRemove([
                'user_location_cache',
                'location_cache_timestamp',
                'services_cache',
                'orders_cache',
                'notifications_cache'
              ]);
              console.log('✅ All cached data cleared');
            } catch (cacheError) {
              console.log('⚠️ Error clearing cache:', cacheError);
            }
          }
          
          // First try to refresh user data from server to get latest location
          // Only refresh if user is logged in
          if (isLoggedIn) {
            try {
              console.log('🔄 Refreshing user data from server to get latest location...');
              await refreshUserDataFromServer();
              console.log('✅ User data refreshed from server');
            } catch (refreshError) {
              console.log('⚠️ Could not refresh from server, using local data:', refreshError);
            }
          } else {
            console.log('👤 User not logged in, skipping server refresh');
          }
          
          // If force refresh, also reload services
          if (shouldForceRefresh) {
            console.log('🔄 Force refresh - reloading services...');
            setServicesLoaded(false); // This will trigger services reload
            
            // Clear the refresh parameter to prevent repeated refreshes
            // Note: We can't modify params directly, but we can track it in state
            console.log('✅ Force refresh completed, clearing refresh flag');
          }
          
          // Use getUserData to get the refreshed data
          const userData = await getUserData();
          console.log('📱 Home screen focused - checking user data:', userData);
          
          if (userData && userData.token && (userData.name || userData._id)) {
            setUserName(userData.name || 'مستخدم');
            setIsLoggedIn(true);
            // Load user's saved location or show location picker prompt
            if (userData.location && userData.location.address) {
              const locationText = userData.location.city ? 
                `${userData.location.address}, ${userData.location.city}` : 
                userData.location.address;
              setUserLocation(locationText);
              console.log('📍 Location loaded:', locationText);
            } else {
              setUserLocation('اختر موقعك'); // Show location picker prompt for signed-in users without location
              console.log('📍 No location found, showing picker prompt');
            }
            console.log('✅ User is signed in:', userData.name);
            
            // Load notification count for logged-in users (non-blocking)
            getNotificationCount(userData._id).then(countResponse => {
              if (countResponse.success) {
                setNotificationCount(countResponse.data.unreadCount);
              }
            }).catch(error => {
              console.error('Error loading notification count:', error);
              setNotificationCount(0);
            });
            
            // Save JWT token to server if user is logged in
            notificationService.saveJWTTokenToServer().catch((error: any) => {
              console.log('⚠️ Could not save JWT token to server:', error);
            });
            
            // Test JWT token saving (for debugging)
            notificationService.testJWTSaving().then((result: boolean) => {
              console.log('🧪 Test JWT token saving result:', result);
            }).catch((error: any) => {
              console.log('🧪 Test JWT token saving error:', error);
            });
          } else {
            setUserName('بك في مشتل');
            setIsLoggedIn(false);
            setUserLocation('اختر موقعك');
            setNotificationCount(0);
            console.log('❌ No user data - showing guest');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUserName('بك في مشتل');
          setIsLoggedIn(false);
          setUserLocation('اختر موقعك');
        } finally {
          setIsLoading(false);
        }
      };

      loadUserData();
    }, [])
  );

  // Refresh notification count every time screen is focused (only for logged-in users)
  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) return; // Skip if user not logged in
      
      const refreshNotificationCount = async () => {
        try {
          const userData = await getUserData();
          if (userData && userData._id) {
                          const countResponse = await getNotificationCount(userData._id);
              console.log('🔔 API Response:', countResponse);
              if (countResponse.success) {
                console.log('🔔 Setting count to:', countResponse.data.unreadCount);
                setNotificationCount(countResponse.data.unreadCount);
              } else {
                console.log('❌ API response failed, setting count to 0');
                setNotificationCount(0);
              }
          } else {
            setNotificationCount(0);
          }
        } catch (error) {
          console.error('Error refreshing notification count:', error);
          setNotificationCount(0);
        }
      };

      // Always refresh count when screen is focused
      refreshNotificationCount();
    }, [])
  );

  const bannerImages = [
    "https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/93029b0fe0d878c1b88db46f2f108f549ea83b58?placeholderIfAbsent=true",
    "https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/93029b0fe0d878c1b88db46f2f108f549ea83b58?placeholderIfAbsent=true&theme=dark",
    "https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/93029b0fe0d878c1b88db46f2f108f549ea83b58?placeholderIfAbsent=true&theme=light"
  ];

  const handleServicePress = (service: ServiceData) => {
    if (service.serviceType === 'المشاريع') {
      router.push({
        pathname: '/(tabs)/Home/project',
        params: {
          id: service._id,
          name: service.title,
          image: service.image,
          description: service.description
        }
      });
    } else {
      router.push({
        pathname: '/(tabs)/Home/service-details',
        params: {
          id: service._id,
          name: service.title,
          image: service.image,
          description: service.description
        }
      });
    }
  };

  const handleTabPress = (tabName: string) => {
    console.log(`Tab pressed: ${tabName}`);
  };

  const handleNotificationPress = () => {
    router.push('/(tabs)/Home/notifications');
  };

  const handleLocationSaved = (location: any) => {
    const locationText = location.city ? 
      `${location.address}, ${location.city}` : 
      location.address;
    setUserLocation(locationText);
    console.log('📍 Location saved and updated:', locationText);
  };

  // Manual permission request for testing
  const requestNotificationPermission = async (): Promise<boolean> => {
    console.log('🔔 Manually requesting notification permission...');
    const success = await notificationService.initialize();
    if (success) {
      console.log('✅ Permission granted!');
      console.log('✅ Notification permission granted!');
    } else {
      console.log('❌ Permission denied!');
      console.log('❌ Notification permission denied!');
    }
    return success;
  };

  const setupNotifications = async () => {
    try {
      console.log('🔧 [HOME] Setting up notifications...');
      
      if (!notificationService) {
        console.log('⚠️ [HOME] notificationService is undefined, skipping setup');
        return;
      }
      
      if (typeof notificationService.initialize !== 'function') {
        console.log('⚠️ [HOME] notificationService.initialize is not a function, skipping setup');
        return;
      }
      
      const success = await notificationService.initialize();
      if (success) {
        console.log('✅ [HOME] Notifications setup successful');
      } else {
        console.log('⚠️ [HOME] Notifications setup failed');
      }
    } catch (error) {
      console.log('❌ [HOME] Error setting up notifications:', error);
    }
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
        <TouchableOpacity 
          style={styles.notificationCircle} 
          onPress={isLoggedIn ? handleNotificationPress : () => router.replace('/(tabs)/auth/login')}
        >
                         <Image
               source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png' }}
               style={styles.notificationIconWhite}
             />
          {isLoggedIn && notificationCount > 0 && (
               <View style={styles.notificationBadge}>
                 <Text style={styles.notificationBadgeText}>
                   {notificationCount > 99 ? '99+' : notificationCount}
                 </Text>
               </View>
             )}
          </TouchableOpacity>
        <View style={styles.nameAndNotification}>
          <View style={styles.nameSection}>
            <Text style={styles.greetingText}>مرحباً {userName}👋</Text>
            <TouchableOpacity 
              style={styles.locationRow}
              onPress={() => {
                if (isLoggedIn) {
                  setLocationModalVisible(true);
                } else {
                  router.replace('/(tabs)/auth/login');
                }
              }}
            >
              <Text style={[styles.locationText, !isLoggedIn && styles.locationTextGuest]}>
                {userLocation}
              </Text>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/484/484167.png' }}
                style={styles.waypointIcon}
              />
              <Image
                source={{ uri: "https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/3aade2a1cb28d2faf4973f9133e53a7e3e952884?placeholderIfAbsent=true" }}
                style={styles.locationIcon}
              />
            </TouchableOpacity>
          </View>
            <TouchableOpacity 
              style={styles.notificationButton}
            onPress={isLoggedIn ? handleNotificationPress : () => router.replace('/(tabs)/auth/login')}
            >
            </TouchableOpacity>
            {/* <TouchableOpacity 
              style={[styles.notificationButton, { marginLeft: 10, backgroundColor: '#ff6b6b' }]}
              onPress={requestNotificationPermission}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>🔔</Text>
              <Image
                source={{ uri: "https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/5610980971e7eae9538d65e51902f648fe9062c8?placeholderIfAbsent=true" }}
                style={styles.notificationIcon}
              />
            {isLoggedIn && notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity> */}
            {/* <TouchableOpacity 
              style={[styles.notificationButton, { marginLeft: 10, backgroundColor: '#4CAF50' }]}
              onPress={async () => {
                console.log('🧪 Test notification button pressed');
                const success = await notificationService.testNotification();
                if (success) {
                  alert('Test notification sent! Check your device notifications.');
                } else {
                  alert('Test notification failed. Check console for details.');
                }
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>🧪</Text>
            </TouchableOpacity> */}
            {/* <TouchableOpacity 
              style={[styles.notificationButton, { marginLeft: 10, backgroundColor: '#2196F3' }]}
              onPress={async () => {
                console.log('🔌 Test Pusher button pressed');
                const success = await pusherService.testConnection();
                if (success) {
                  alert('Pusher connection test: SUCCESS!');
                } else {
                  alert('Pusher connection test: FAILED! Check console for details.');
                }
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>🔌</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.notificationButton, { marginLeft: 10, backgroundColor: '#FF9800' }]}
              onPress={() => {
                console.log('🔐 2FA Test button pressed');
                router.push('/(tabs)/settings/two-factor-setup');
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>🔐</Text>
            </TouchableOpacity> */}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Banner and Services Section or Network Error */}
          {isNetworkConnected ? (
            <>
              {/* Banner Section */}
              <Banner images={bannerImages} />

              {/* Services Section */}
              {!servicesLoaded ? (
                <View style={styles.servicesContainer}>
                  <View style={styles.servicesHeader}>
                    <Text style={styles.servicesTitle}>الخدمات الزراعية</Text>
                  </View>
                  <View style={styles.servicesLoadingContainer}>
                    <View style={styles.servicesLoadingSpinner} />
                    <Text style={styles.servicesLoadingText}>جاري تحميل الخدمات...</Text>
                  </View>
                </View>
              ) : services.length > 0 ? (
                <View style={styles.servicesContainer}>
                  <View style={styles.servicesHeader}>
                    <Text style={styles.servicesTitle}>الخدمات الزراعية</Text>
                  </View>

                  <View style={styles.servicesContent}>
                    <View style={styles.servicesGrid}>
                      {services.reduce((rows: any[], service: ServiceData, index: number) => {
                        if (index % 2 === 0) {
                          rows.push([service]);
                        } else {
                          rows[rows.length - 1].push(service);
                        }
                        return rows;
                      }, []).map((row: ServiceData[], rowIndex: number) => (
                        <View key={rowIndex} style={styles.servicesRow}>
                          {row.map((service: ServiceData, itemIndex: number) => (
                            <ServiceItem
                              key={service._id}
                              imageUri={service.image}
                              title={service.title}
                              onPress={() => handleServicePress(service)}
                              style={itemIndex === 0 ? { marginRight: 2 } : {}}
                            />
                          ))}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.networkErrorContainer}>
              <View style={styles.networkErrorContent}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/44/44386.png' }}
                  style={[styles.networkErrorIcon, { tintColor: undefined }]}
                />
                <Text style={styles.networkErrorTitle}>لا يوجد اتصال بالإنترنت</Text>
                <Text style={styles.networkErrorMessage}>يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى</Text>
              </View>
            </View>
          )}
        </ScrollView>
        <CustomFooter />
      </View>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSaved={handleLocationSaved}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 80, // Add padding to prevent content from being hidden behind footer
  },

  // Green Header Navigation Bar Styles
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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

  notificationCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginTop: 5,
  },

  notificationIcon: {
    width: 20,
    height: 20,
    tintColor: '#4CAF50',
    backgroundColor: 'transparent',
  },

  notificationIconWhite: {
    width: 20,
    height: 20,
    tintColor: '#000',
    backgroundColor: 'transparent',
  },

  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    paddingHorizontal: 2,
  },

  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  nameAndNotification: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },

  notificationButton: {
    marginLeft: 15,
    marginTop: 5,
    position: 'relative',
  },

  nameSection: {
    alignItems: 'flex-end',
    flex: 1,
    marginRight: 10,
  },

  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'right',
    marginBottom: 5,
    marginRight: 20,
    width: '100%',
    alignSelf: 'flex-end',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'right',
    marginRight: 5,
    opacity: 0.9,
  },
  locationTextGuest: {
    color: '#CCCCCC',
    fontStyle: 'italic',
  },

  locationIcon: {
    width: 14,
    height: 14,
    tintColor: '#ffffff',
  },

  waypointIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    tintColor: '#4CAF50',
  },

  // Services Section Styles
  servicesContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  servicesHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  servicesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'right',
  },

  servicesContent: {
    paddingHorizontal: 20,
  },

  servicesGrid: {
    width: '100%',
  },

  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  serviceItem: {
    width: (width - 100) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
    margin: 10,
  },

  serviceImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#f8f9fa',
  },

  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },

  serviceTitleContainer: {
    padding: 15,
    alignItems: 'center',
  },

  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Footer Navigation Styles
  footer: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 25,
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 5,
  },

  tabIcon: {
    width: 26,
    height: 26,
    marginBottom: 6,
    tintColor: '#999999',
  },

  activeTabIcon: {
    tintColor: '#4CAF50',
  },

  tabTitle: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    fontWeight: '500',
  },

  activeTabTitle: {
    color: '#4CAF50',
    fontWeight: '600',
  },

  // Network Error Styles
  networkErrorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 350,
  },

  networkErrorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },

  networkErrorIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    tintColor: '#888888',
  },

  networkErrorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888888',
    textAlign: 'center',
    marginBottom: 10,
  },

  networkErrorMessage: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#e0e0e0',
    borderTopColor: '#4CAF50',
    marginBottom: 16,
  },
  servicesLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  servicesLoadingSpinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#f0f0f0',
    borderTopColor: '#4CAF50',
    marginBottom: 20,
  },
  servicesLoadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default User4;
