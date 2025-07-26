import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;

  // Initialize notifications
  async initialize() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }

      // Get push token
      if (Device.isDevice) {
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: '298f9159-3f1c-4cdb-97a8-8fc32fe63138', // Your actual EAS project ID
          });
          this.expoPushToken = token.data;
          console.log('Expo push token:', this.expoPushToken);
          
          // Send token to backend for push notifications
          this.sendTokenToBackend(this.expoPushToken);
        } catch (error: any) {
          console.error('❌ Could not get Expo push token:', error);
          console.log('🔍 Error details:', {
            message: error?.message,
            code: error?.code,
            stack: error?.stack
          });
          // Continue without push token for development
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Set up notification channels for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'مشتل الإشعارات',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2E8B57',
          showBadge: true,
        });
      }

      // Set up notification listeners for when app is closed/background
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('📱 Notification received (app in background):', notification);
      });

      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('📱 Notification tapped (app was closed):', response);
        // Handle notification tap - could navigate to specific screen
      });

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Get the push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Send token to backend
  private async sendTokenToBackend(token: string) {
    try {
      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) return;

      const user = JSON.parse(userData);
      if (!user.token) return;

      // Send token to backend using fetch
      const response = await fetch('http://172.20.10.12:9090/api/auth/push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ pushToken: token })
      });
      
      if (response.ok) {
        console.log('✅ Push token saved to backend');
      }
    } catch (error) {
      console.log('⚠️ Could not save push token to backend:', error);
    }
  }

  // Send local notification
  async sendLocalNotification(notification: NotificationData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Schedule notification for later
  async scheduleNotification(notification: NotificationData, trigger: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  // Get badge count
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  // Set badge count
  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Add notification received listener
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Add notification response listener (when user taps notification)
  addNotificationResponseReceivedListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Helper function to send notification from WebSocket
export const sendNotificationFromWebSocket = (notification: NotificationData) => {
  notificationService.sendLocalNotification(notification);
};

// Default export for the service
export default notificationService; 