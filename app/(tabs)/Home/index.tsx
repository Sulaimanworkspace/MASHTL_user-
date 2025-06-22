import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getUserData, getNotificationCount } from '../../services/api';
import Banner from '../../components/Banner';
import CustomFooter from '../../components/CustomFooter';
import LocationPickerModal from '../../components/LocationPickerModal';

const { width, height } = Dimensions.get('window');

interface ServiceItemProps {
  imageUri: string;
  title: string;
  onPress?: () => void;
  style?: any;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ imageUri, title, onPress, style }) => (
  <TouchableOpacity style={styles.serviceItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.serviceImageContainer}>
      <Image source={{ uri: imageUri }} style={styles.serviceImage} />
    </View>
    <View style={styles.serviceTitleContainer}>
      <Text style={styles.serviceTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);

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

type ServiceType = 'landscaping' | 'tree-planting' | 'projects' | 'grass-planting';

interface ServiceData {
  id: string;
  name: string;
  image: string;
  description: string;
}

const User4: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('بك في مشتل');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState('اختر موقعك');
  const [notificationCount, setNotificationCount] = useState(0);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Debug: Log notification count changes
  useEffect(() => {
    console.log('🔴 Notification count changed to:', notificationCount);
  }, [notificationCount]);

  // Load user data every time screen is focused (including after auth)
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const userData = await getUserData();
          console.log('📱 Home screen focused - checking user data:', userData);
          if (userData && userData.name) {
            setUserName(userData.name);
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
            
            // Load notification count for logged-in users
            try {
              const countResponse = await getNotificationCount(userData._id);
              if (countResponse.success) {
                setNotificationCount(countResponse.data.unreadCount);
              }
            } catch (error) {
              console.error('Error loading notification count:', error);
              setNotificationCount(0);
            }
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
        }
      };

      loadUserData();
    }, [])
  );

  // Refresh notification count every time screen is focused
  useFocusEffect(
    useCallback(() => {
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

  const handleServicePress = (serviceType: ServiceType) => {
    const serviceData: Record<ServiceType, ServiceData> = {
      'landscaping': {
        id: '1',
        name: 'تنسيق الحدائق',
        image: 'https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/9db5513cffa0f952bf72289940508e6bb2f43e86?placeholderIfAbsent=true',
        description: 'خدمة تنسيق الحدائق المنزلية والشركات بأحدث التصاميم والأساليب الحديثة. نقوم بتصميم وتنفيذ جميع أنواع الحدائق مع ضمان جودة العمل والمواد المستخدمة.'
      },
      'tree-planting': {
        id: '2',
        name: 'زراعة الأشجار',
        image: 'https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/4f68288a8dfbd3be84b86a86f69f10b478b30bb2?placeholderIfAbsent=true',
        description: 'خدمة زراعة الأشجار بأنواعها المختلفة مع توفير الرعاية اللازمة. نقوم باختيار أفضل أنواع الأشجار المناسبة للمناخ والتربة مع ضمان نجاح الزراعة.'
      },
      'projects': {
        id: '3',
        name: 'المشاريع',
        image: 'https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/b0048f76b43fdada220b661863a0798441bf574e?placeholderIfAbsent=true',
        description: 'تنفيذ المشاريع الزراعية الكبيرة والصغيرة مع فريق متخصص. نقدم حلول متكاملة للمشاريع الزراعية مع ضمان الجودة والالتزام بالمواعيد.'
      },
      'grass-planting': {
        id: '4',
        name: 'زراعة ثيل',
        image: 'https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/46f551cf45a05c4bbd3169c8c33a7c6b72ea9cb1?placeholderIfAbsent=true',
        description: 'خدمة زراعة الثيل الطبيعي والصناعي مع ضمان جودة العشب. نقوم بتجهيز الأرض وزراعة الثيل مع توفير خدمات الصيانة الدورية.'
      }
    };

    const service = serviceData[serviceType];
    if (service) {
      if (serviceType === 'projects') {
        router.push({
          pathname: '/(tabs)/Home/project',
          params: {
            id: service.id,
            name: service.name,
            image: service.image,
            description: service.description
          }
        });
      } else {
        router.push({
          pathname: '/(tabs)/Home/service-details',
          params: {
            id: service.id,
            name: service.name,
            image: service.image,
            description: service.description
          }
        });
      }
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
        {isLoggedIn && (
          <TouchableOpacity style={styles.notificationCircle} onPress={handleNotificationPress}>
                         <Image
               source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png' }}
               style={styles.notificationIconWhite}
             />
                         {notificationCount > 0 && (
               <View style={styles.notificationBadge}>
                 <Text style={styles.notificationBadgeText}>
                   {notificationCount > 99 ? '99+' : notificationCount}
                 </Text>
               </View>
             )}
          </TouchableOpacity>
        )}
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
          {isLoggedIn && (
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={handleNotificationPress}
            >
              <Image
                source={{ uri: "https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/5610980971e7eae9538d65e51902f648fe9062c8?placeholderIfAbsent=true" }}
                style={styles.notificationIcon}
              />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Banner Section */}
          <Banner images={bannerImages} />

          {/* Services Section */}
          <View style={styles.servicesContainer}>
            <View style={styles.servicesHeader}>
              <Text style={styles.servicesTitle}>الخدمات الزراعية</Text>
            </View>

            <View style={styles.servicesContent}>
              <View style={styles.servicesGrid}>
                <View style={styles.servicesRow}>
                  <ServiceItem
                    imageUri="https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/9db5513cffa0f952bf72289940508e6bb2f43e86?placeholderIfAbsent=true"
                    title="تنسيق الحدائق"
                    onPress={() => handleServicePress('landscaping')}
                    style={{ marginRight: 2 }}
                  />
                  <ServiceItem
                    imageUri="https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/4f68288a8dfbd3be84b86a86f69f10b478b30bb2?placeholderIfAbsent=true"
                    title="زراعة الأشجار"
                    onPress={() => handleServicePress('tree-planting')}
                  />
                </View>

                <View style={styles.servicesRow}>
                  <ServiceItem
                    imageUri="https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/b0048f76b43fdada220b661863a0798441bf574e?placeholderIfAbsent=true"
                    title="المشاريع"
                    onPress={() => handleServicePress('projects')}
                    style={{ marginRight: 2 }}
                  />
                  <ServiceItem
                    imageUri="https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/46f551cf45a05c4bbd3169c8c33a7c6b72ea9cb1?placeholderIfAbsent=true"
                    title="زراعة ثيل"
                    onPress={() => handleServicePress('grass-planting')}
                  />
                </View>
              </View>
            </View>
          </View>
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
  },

  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'right',
    marginBottom: 5,
    marginRight: 0,
    width: '100%',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    fontSize: 14,
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
});

export default User4;
