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
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserData, clearUserData } from '../../services/api';
import pusherService from '../../services/pusher';
import { useSpinner } from '../../contexts/SpinnerContext';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface MenuListItemProps {
  iconName?: string;
  iconFamily?: 'FontAwesome' | 'FontAwesome5';
  iconImage?: any;
  title: string;
  rightIconName?: string;
  rightIconFamily?: 'FontAwesome' | 'FontAwesome5';
  hasRightIcon?: boolean;
  onPress?: () => void;
}

const MenuListItem: React.FC<MenuListItemProps> = ({
  iconName,
  iconFamily = 'FontAwesome',
  title,
  rightIconName,
  rightIconFamily = 'FontAwesome',
  hasRightIcon = true,
  onPress,
  iconImage
}) => {
  const IconComponent = iconFamily === 'FontAwesome5' ? FontAwesome5 : FontAwesome;
  const RightIconComponent = rightIconFamily === 'FontAwesome5' ? FontAwesome5 : FontAwesome;

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      {iconImage ? (
        <Image
          source={iconImage}
          style={{ width: 24, height: 24, marginLeft: 15 }}
          resizeMode="contain"
        />
      ) : (
        <IconComponent name={iconName!} size={24} color="#222" style={styles.menuIcon} />
      )}
      <Text style={styles.menuTitleWithIcon}>{title}</Text>
      {hasRightIcon && rightIconName && (
        <RightIconComponent name={rightIconName} size={16} color="#222" style={styles.menuChevron} />
      )}
      {hasRightIcon && !rightIconName && (
        <View style={styles.menuChevronPlaceholder} />
      )}
      {title !== 'تسجيل الخروج' && (
        <FontAwesome name="chevron-left" size={18} color="#222" style={styles.menuLeftChevron} />
      )}
    </TouchableOpacity>
  );
};

const User19: React.FC = () => {
  const router = useRouter();
  const { showSpinner, hideSpinner } = useSpinner();
  const Container = View;
  const containerProps = {};
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Check auth status when screen is focused
  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        try {
          const userData = await getUserData();
          console.log('⚙️ Settings - checking auth status:', userData);
          if (userData && userData.token && (userData.name || userData._id)) {
            setIsLoggedIn(true);
            console.log('✅ User is logged in');
          } else {
            setIsLoggedIn(false);
            console.log('❌ User is not logged in');
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
          setIsLoggedIn(false);
        }
      };

      checkAuthStatus();
    }, [])
  );

  const handleLogout = async () => {
    try {
      showSpinner('جاري تسجيل الخروج...');
      // Clear Pusher connection first
      await pusherService.clearUserData();
      await clearUserData();
      setIsLoggedIn(false);
      setShowLogoutModal(false); // Close the modal
      console.log('✅ User logged out successfully');
      hideSpinner();
      router.replace('/(tabs)/Home'); // Redirect to homepage instead of login
    } catch (error) {
      console.error('Error during logout:', error);
      hideSpinner();
      setShowLogoutModal(false); // Close modal even if error occurs
    }
  };

  const handleMenuPress = (menuName: string) => {
    // Check authentication for protected menu items
    const protectedMenus = ['wallet', 'notifications', 'complaints', 'settings'];
    
    if (protectedMenus.includes(menuName) && !isLoggedIn) {
      // Redirect to login if user is not authenticated
      router.replace('/(tabs)/auth/login');
      return;
    }

    switch (menuName) {
      case 'wallet':
        router.push('/settings/wallet');
        break;
      case 'notifications':
        router.push('/settings/notifications');
        break;
      case 'complaints':
        router.push('/settings/complaints');
        break;

      case 'settings':
        router.push('/settings/settings');
        break;
      case 'about':
        router.push('/(tabs)/settings/about');
        break;
      case 'logout':
        if (isLoggedIn) {
          setShowLogoutModal(true);
        } else {
          router.replace('/(tabs)/auth/login');
        }
        break;
    }
  };

  return (
    <Container 
      style={styles.container}
      {...containerProps}
      onTouchStart={(e) => {
        // Disable swipe gestures
        e.stopPropagation();
      }}>
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
        <View style={styles.navContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>الإعدادات</Text>
          </View>
        </View>
      </View>

      {/* Menu List */}
      <View style={styles.listContainer}>
        <MenuListItem
          iconName="wallet"
          iconFamily="FontAwesome5"
          title="المحفظة"
          onPress={() => handleMenuPress('wallet')}
        />

        <MenuListItem
          iconName="bell"
          iconFamily="FontAwesome"
          title="الاشعارات"
          rightIconFamily="FontAwesome"
          onPress={() => handleMenuPress('notifications')}
        />

        <MenuListItem
          iconName="exclamation-circle"
          iconFamily="FontAwesome"
          title="الشكاوي"
          rightIconFamily="FontAwesome"
          onPress={() => handleMenuPress('complaints')}
        />


        <MenuListItem
          iconName="cog"
          iconFamily="FontAwesome"
          title="الاعدادات"
          rightIconFamily="FontAwesome"
          onPress={() => handleMenuPress('settings')}
        />

        <MenuListItem
          iconImage={require('../../../assets/images/icon.png')}
          title="عن مشتل"
          rightIconFamily="FontAwesome"
          onPress={() => router.push('/(tabs)/settings/about')}
        />

        <MenuListItem
          iconImage={require('../../../assets/images/icon.png')}
          title="شروط وأحكام مشتل"
          rightIconFamily="FontAwesome"
          onPress={() => router.push('/(tabs)/settings/terms-conditions')}
        />

        <MenuListItem
          iconImage={require('../../../assets/images/icon.png')}
          title="اتفاقية استخدام البرنامج"
          rightIconFamily="FontAwesome"
          onPress={() => router.push('/(tabs)/settings/user-agreement')}
        />

        <MenuListItem
          iconName="sign-out"
          iconFamily="FontAwesome"
          title={isLoggedIn ? "تسجيل الخروج" : "تسجيل الدخول"}
          onPress={() => handleMenuPress('logout')}
        />
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.logoutIconContainer}>
              <FontAwesome5 name="sign-out-alt" size={40} color="#FF0000" />
            </View>
            <Text style={styles.logoutText}>
              هل أنت متأكد من تسجيل الخروج؟
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>تأكيد</Text>
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

  // Green Header Navigation Bar Styles
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

  statusBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  statusBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 8,
  },

  signalBar: {
    width: 3,
    backgroundColor: '#fff',
    marginRight: 1,
    borderRadius: 1,
  },

  signalBar1: {
    height: 4,
  },

  signalBar2: {
    height: 6,
  },

  signalBar3: {
    height: 8,
  },

  signalBar4: {
    height: 10,
  },

  wifiIcon: {
    marginLeft: 4,
  },

  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },

  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },

  bluetoothIcon: {
    marginRight: 8,
  },

  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  batteryLevel: {
    width: 20,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },

  batteryTip: {
    width: 2,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 1,
    marginLeft: 1,
  },

  // Menu List Styles
  listContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },

  menuIcon: {
    marginLeft: 15,
  },

  menuTitleWithIcon: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 8,
  },

  menuChevron: {
    marginLeft: 'auto',
  },

  menuChevronPlaceholder: {
    width: 20,
    height: 20,
    marginLeft: 'auto',
  },

  menuLeftChevron: {
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  logoutIconContainer: {
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default User19;
