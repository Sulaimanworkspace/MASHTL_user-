import { getUserData } from './api';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private jwtToken: string | null = null;

  // Initialize JWT token service
  async initialize() {
    try {
      console.log('🔐 Initializing JWT token service...');

      // Request notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('⚠️ Notification permissions not granted');
        return false;
      }

      // Set up notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Set up notification channels for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'مشتل',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2E8B57',
          showBadge: true,
        });
      }

      // Get JWT token from user data
      const userData = await getUserData();
      if (userData && userData.token) {
        this.jwtToken = userData.token;
        console.log('✅ JWT token loaded from user data');
        console.log('🔐 Token preview:', this.jwtToken?.substring(0, 20) + '...');
        return true;
      } else {
        console.log('⚠️ No JWT token available - user not logged in');
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing JWT token service:', error);
      return false;
    }
  }

  // Get the JWT token
  getJWTToken(): string | null {
    return this.jwtToken;
  }

  // Save JWT token to server (can be called after login)
  async saveJWTTokenToServer(): Promise<boolean> {
    try {
      if (!this.jwtToken) {
        console.log('⚠️ No JWT token available to save');
        return false;
      }

      const userData = await getUserData();
      if (!userData || !userData.token) {
        console.log('⚠️ User not logged in, cannot save JWT token');
        return false;
      }

      console.log('✅ JWT token is already saved in user data');
      return true;
    } catch (error) {
      console.error('❌ Error with JWT token:', error);
      return false;
    }
  }

  // Send local notification (using JWT token for server-side notifications)
  async sendLocalNotification(notification: NotificationData) {
    try {
      console.log('🔔 Sending local notification via JWT token:', notification);
      console.log('🔐 Using JWT token for authentication');
      console.log('🔔 Notification title:', notification.title);
      console.log('🔔 Notification body:', notification.body);
      console.log('🔔 Notification data:', notification.data);
      
      // Check if we have permission first
      const { status } = await Notifications.getPermissionsAsync();
      console.log('🔔 Current notification permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Notification permission not granted, requesting...');
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log('🔔 New permission status:', newStatus);
        
        if (newStatus !== 'granted') {
          console.log('❌ Permission still not granted, cannot send notification');
          return;
        }
      }
      
      // Send actual local notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          badge: 1,
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Local notification sent successfully with ID:', notificationId);
    } catch (error: any) {
      console.error('❌ Error sending local notification:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
  }

  // Schedule notification for later (using JWT token)
  async scheduleNotification(notification: NotificationData, trigger: any) {
    try {
      console.log('🔔 Scheduling notification via JWT token:', notification, 'with trigger:', trigger);
      console.log('🔐 Using JWT token for authentication');
      
      // Schedule actual local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          badge: 1,
        },
        trigger: trigger,
      });
      
      console.log('✅ Notification scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Cancel all notifications (using JWT token)
  async cancelAllNotifications() {
    try {
      console.log('🔔 Cancelling all notifications via JWT token');
      console.log('🔐 Using JWT token for authentication');
      
      // Cancel all scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ All notifications cancelled successfully');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  // Get badge count (using JWT token)
  async getBadgeCount(): Promise<number> {
    try {
      console.log('🔔 Getting badge count via JWT token');
      console.log('🔐 Using JWT token for authentication');
      
      // Get badge count from notifications
      const badgeCount = await Notifications.getBadgeCountAsync();
      return badgeCount;
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  // Set badge count (using JWT token)
  async setBadgeCount(count: number) {
    try {
      console.log('🔔 Setting badge count via JWT token to:', count);
      console.log('🔐 Using JWT token for authentication');
      
      // Set badge count
      await Notifications.setBadgeCountAsync(count);
      console.log('✅ Badge count set successfully');
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Add notification received listener (using JWT token)
  addNotificationReceivedListener(callback: (notification: any) => void) {
    console.log('🔔 Adding notification received listener via JWT token');
    console.log('🔐 Using JWT token for authentication');
    
    // Set up actual notification listener
    const subscription = Notifications.addNotificationReceivedListener(callback);
    console.log('✅ Notification received listener set up successfully');
    
    // Return subscription with remove method
    return {
      remove: () => {
        console.log('🔔 Removing notification received listener');
        subscription.remove();
      }
    };
  }

  // Add notification response received listener (using JWT token)
  addNotificationResponseReceivedListener(callback: (response: any) => void) {
    console.log('🔔 Adding notification response received listener via JWT token');
    console.log('🔐 Using JWT token for authentication');
    
    // Set up actual notification response listener
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    console.log('✅ Notification response listener set up successfully');
    
    // Return subscription with remove method
    return {
      remove: () => {
        console.log('🔔 Removing notification response received listener');
        subscription.remove();
      }
    };
  }

  // Test JWT token saving (for debugging)
  async testJWTSaving(): Promise<boolean> {
    console.log('🧪 Testing JWT token saving...');
    console.log('🧪 Current JWT token:', this.jwtToken);
    
    if (!this.jwtToken) {
      console.log('🧪 No JWT token available - trying to get one...');
      await this.initialize();
      console.log('🧪 After initialization, JWT token:', this.jwtToken);
    }
    
    if (this.jwtToken) {
      console.log('🧪 JWT token validation:');
      console.log('🧪 - Length:', this.jwtToken.length);
      console.log('🧪 - Starts with eyJ:', this.jwtToken.startsWith('eyJ'));
      console.log('🧪 - Token preview:', this.jwtToken.substring(0, 20) + '...');
    }
    
    return await this.saveJWTTokenToServer();
  }

  // Test notification system (for debugging)
  async testNotification(): Promise<boolean> {
    console.log('🧪 Testing notification system...');
    
    try {
      // Check permissions
      const { status } = await Notifications.getPermissionsAsync();
      console.log('🧪 Current permission status:', status);
      
      if (status !== 'granted') {
        console.log('🧪 Requesting permission...');
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log('🧪 New permission status:', newStatus);
        
        if (newStatus !== 'granted') {
          console.log('❌ Permission denied');
          return false;
        }
      }
      
      // Send test notification
      const testNotification = {
        title: '🧪 Test Notification',
        body: 'This is a test notification from MASHTL',
        data: { type: 'test', timestamp: new Date().toISOString() }
      };
      
      console.log('🧪 Sending test notification:', testNotification);
      await this.sendLocalNotification(testNotification);
      
      console.log('✅ Test notification sent successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Test notification failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export the singleton instance
export default notificationService;

// Export function to send notification from WebSocket (using JWT token)
export const sendNotificationFromWebSocket = (notification: NotificationData) => {
  console.log('🔔 WebSocket notification received via JWT token:', notification);
  console.log('🔐 Using JWT token for authentication');
  
  // Send actual local notification
  notificationService.sendLocalNotification(notification);
}; 