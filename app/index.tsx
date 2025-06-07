import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
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

const User4: React.FC = () => {
  const handleServicePress = (serviceName: string) => {
    console.log(`Service pressed: ${serviceName}`);
  };

  const handleTabPress = (tabName: string) => {
    console.log(`Tab pressed: ${tabName}`);
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
        <View style={styles.notificationCircle}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1827/1827392.png' }}
            style={styles.notificationIconWhite}
          />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>1</Text>
          </View>
        </View>
        <View style={styles.nameAndNotification}>
          <TouchableOpacity style={styles.notificationButton}>
            <Image
              source={{ uri: "https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/5610980971e7eae9538d65e51902f648fe9062c8?placeholderIfAbsent=true" }}
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
          <View style={styles.nameSection}>
            <Text style={styles.greetingText}>مرحباً سليمان👋</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>حى الازدهار, الرياض</Text>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/484/484167.png' }}
                style={styles.waypointIcon}
              />
              <Image
                source={{ uri: "https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/3aade2a1cb28d2faf4973f9133e53a7e3e952884?placeholderIfAbsent=true" }}
                style={styles.locationIcon}
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: "https://cdn.builder.io/api/v1/image/assets/367dbe4879424ce6b810fe26f94ba4b7/93029b0fe0d878c1b88db46f2f108f549ea83b58?placeholderIfAbsent=true" }}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    top: 2,
    right: 2,
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
  },

  notificationButton: {
    marginRight: 15,
    marginTop: 5,
  },

  nameSection: {
    alignItems: 'flex-end',
  },

  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'right',
    marginBottom: 5,
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

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },

  // Banner Styles
  bannerContainer: {
    width: '100%',
    height: 200,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bannerImage: {
    width: '92%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: '#fff',
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
    backgroundColor: '#ffffff',
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
