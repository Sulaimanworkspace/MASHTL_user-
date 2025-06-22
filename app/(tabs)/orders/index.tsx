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
  View
} from 'react-native';
import { getUserData } from '../../services/api';

const { width, height } = Dimensions.get('window');

const User17: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        } catch (error) {
          router.replace('/(tabs)/auth/login');
        }
      };
      checkAuthStatus();
    }, [])
  );

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
      <View style={styles.mainContent}>
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
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
});

export default User17;
