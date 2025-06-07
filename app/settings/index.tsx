import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width, height } = Dimensions.get('window');

interface MenuListItemProps {
  iconName: string;
  iconFamily?: 'FontAwesome' | 'FontAwesome5';
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
  onPress
}) => {
  const IconComponent = iconFamily === 'FontAwesome5' ? FontAwesome5 : FontAwesome;
  const RightIconComponent = rightIconFamily === 'FontAwesome5' ? FontAwesome5 : FontAwesome;

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <IconComponent name={iconName} size={24} color="#222" style={styles.menuIcon} />
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
  const handleMenuPress = (menuName: string) => {
    console.log(`Menu pressed: ${menuName}`);
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
      </View>

      {/* Menu List */}
      <View style={styles.listContainer}>
        <MenuListItem
          iconName="wallet"
          iconFamily="FontAwesome"
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
          iconName="info-circle"
          iconFamily="FontAwesome"
          title="عن مشتل"
          rightIconFamily="FontAwesome"
          onPress={() => handleMenuPress('about')}
        />

        <MenuListItem
          iconName="sign-out"
          iconFamily="FontAwesome"
          title="تسجيل الخروج"
          onPress={() => handleMenuPress('logout')}
        />
      </View>
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
});

export default User19;
