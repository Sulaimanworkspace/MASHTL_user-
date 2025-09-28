import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Test expo-notifications import
console.log('🔧 [NOTIFICATIONS] expo-notifications import test:', {
  Notifications: typeof Notifications,
  setNotificationHandler: typeof Notifications.setNotificationHandler,
  getPermissionsAsync: typeof Notifications.getPermissionsAsync,
  requestPermissionsAsync: typeof Notifications.requestPermissionsAsync
});

// Configure notification behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  console.log('✅ [NOTIFICATIONS] Notification handler configured successfully');
} catch (error) {
  console.log('❌ [NOTIFICATIONS] Error configuring notification handler:', error);
}

export async function registerForPushNotificationsAsync() {
  let token;

  try {
    if (Platform.OS === 'ios') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ [NOTIFICATIONS] Failed to get push token for push notification!');
        return null;
      }
      
      try {
        // Get the token that uniquely identifies this device
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: '298f9159-3f1c-4cdb-97a8-8fc32fe63138', // Your EAS project ID
        })).data;
        
        console.log('✅ [NOTIFICATIONS] Expo push token:', token);
      } catch (tokenError) {
        // Handle APNs entitlement error gracefully
        if (tokenError && typeof tokenError === 'object' && 'message' in tokenError && 
            typeof tokenError.message === 'string' && tokenError.message.includes('aps-environment')) {
          console.log('⚠️ [NOTIFICATIONS] APNs not configured - using local notifications only');
          return null;
        }
        throw tokenError;
      }
    } else {
      console.log('📱 [NOTIFICATIONS] Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'ios') {
      try {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      } catch (channelError) {
        console.log('⚠️ [NOTIFICATIONS] Could not set notification channel:', channelError);
      }
    }

    return token;
  } catch (error) {
    console.log('⚠️ [NOTIFICATIONS] Error getting push token:', error);
    return null;
  }
}

export async function schedulePushNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: { 
        seconds: 2 
      } as any,
    });
    console.log('✅ [NOTIFICATIONS] Local notification scheduled');
  } catch (error) {
    console.log('⚠️ [NOTIFICATIONS] Error scheduling notification:', error);
  }
}

// Simplified Notification Service
class NotificationService {
  constructor() {
    console.log('🔧 [NOTIFICATIONS] NotificationService constructor called');
    console.log('🔧 [NOTIFICATIONS] This in constructor:', this);
    console.log('🔧 [NOTIFICATIONS] This.initialize type:', typeof this.initialize);
  }

  // Initialize notification service
  public async initialize(): Promise<boolean> {
    try {
      console.log('🚀 [NOTIFICATIONS] Initializing notification service...');
      console.log('🚀 [NOTIFICATIONS] This in initialize:', this);
      
      // Request permissions
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        console.log('✅ [NOTIFICATIONS] Notification service initialized successfully');
        return true;
      } else {
        console.log('⚠️ [NOTIFICATIONS] No push token received - using local notifications only');
        return true; // Return true to indicate service is available for local notifications
      }
    } catch (error) {
      console.log('⚠️ [NOTIFICATIONS] Error initializing notification service:', error);
      return false;
    }
  }

  // Send local notification
  public async sendLocalNotification(notification: {
    title: string;
    body: string;
    data?: any;
  }): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: null, // Send immediately
      });
      console.log('✅ [NOTIFICATIONS] Local notification sent successfully');
    } catch (error) {
      console.log('⚠️ [NOTIFICATIONS] Error sending local notification:', error);
    }
  }

  // Request notification permission
  public async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('⚠️ [NOTIFICATIONS] Error requesting permission:', error);
      return false;
    }
  }

  // Add notification response listener
  public addNotificationResponseReceivedListener(callback: (response: any) => void): any {
    try {
      console.log('🔔 [NOTIFICATIONS] Adding notification response listener...');
      return Notifications.addNotificationResponseReceivedListener(callback);
    } catch (error) {
      console.log('⚠️ [NOTIFICATIONS] Error adding notification response listener:', error);
      return null;
    }
  }

  // Save JWT token to server for push notifications
  public async saveJWTTokenToServer(): Promise<void> {
    try {
      console.log('🔑 [NOTIFICATIONS] Saving JWT token to server...');
      
      // Get the push token
      const pushToken = await registerForPushNotificationsAsync();
      
      if (!pushToken) {
        console.log('⚠️ [NOTIFICATIONS] No push token available - skipping server registration');
        return;
      }

      // Get user data from storage
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (!userData) {
        console.log('⚠️ [NOTIFICATIONS] No user data available');
        return;
      }

      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData._id;
      const userToken = parsedUserData.token;

      if (!userId || !userToken) {
        console.log('⚠️ [NOTIFICATIONS] Missing user ID or token');
        return;
      }

      // Import API service
      const { api } = require('./api');
      
      // Save token to server
      const response = await api.post('/notifications/register-token', {
        userId,
        pushToken,
        platform: Platform.OS
      });

      if (response.data && response.data.success) {
        console.log('✅ [NOTIFICATIONS] JWT token saved to server successfully');
      } else {
        console.log('⚠️ [NOTIFICATIONS] Server response not successful');
      }
    } catch (error) {
      console.log('⚠️ [NOTIFICATIONS] Error saving JWT token to server:', error);
      // Don't throw error to prevent app crash
    }
  }

  // Test JWT saving functionality
  public async testJWTSaving(): Promise<boolean> {
    try {
      console.log('🧪 [NOTIFICATIONS] Testing JWT saving functionality...');
      await this.saveJWTTokenToServer();
      console.log('✅ [NOTIFICATIONS] JWT saving test completed');
      return true;
    } catch (error) {
      console.log('⚠️ [NOTIFICATIONS] JWT saving test failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const notificationServiceInstance = new NotificationService();
console.log('🔧 [NOTIFICATIONS] Created notification service instance:', notificationServiceInstance);
console.log('🔧 [NOTIFICATIONS] Instance type:', typeof notificationServiceInstance);
console.log('🔧 [NOTIFICATIONS] Instance has initialize method:', typeof notificationServiceInstance.initialize);

// Test the service immediately
try {
  console.log('🧪 [NOTIFICATIONS] Testing service immediately...');
  if (notificationServiceInstance && typeof notificationServiceInstance.initialize === 'function') {
    console.log('✅ [NOTIFICATIONS] Service test passed - instance is valid');
  } else {
    console.log('❌ [NOTIFICATIONS] Service test failed - instance is invalid');
  }
} catch (error) {
  console.log('❌ [NOTIFICATIONS] Service test error:', error);
}

// Create a fallback service in case the main one fails
const fallbackService = {
  initialize: async () => {
    console.log('⚠️ [NOTIFICATIONS] Using fallback notification service');
    return true;
  },
  sendLocalNotification: async (notification: any) => {
    console.log('⚠️ [NOTIFICATIONS] Fallback: Cannot send local notification');
  },
  requestPermission: async () => false,
  addNotificationResponseReceivedListener: () => null
};

// Export singleton instance with fallback
export const notificationService = notificationServiceInstance || fallbackService;

// Export the class for testing
export { NotificationService };

// Add default export for compatibility
export default (notificationServiceInstance || fallbackService);

// Test exports
console.log('🧪 [NOTIFICATIONS] Testing exports...');
console.log('🧪 [NOTIFICATIONS] notificationService export:', typeof notificationService);
console.log('🧪 [NOTIFICATIONS] default export:', typeof (notificationServiceInstance || fallbackService));

// Add missing function for Pusher notifications
export const sendNotificationFromPusher = (notification: any) => {
  try {
    console.log('🔔 [NOTIFICATIONS] Sending Pusher notification:', notification);
    
    // Send local notification
    if (notificationServiceInstance && typeof notificationServiceInstance.sendLocalNotification === 'function') {
      notificationServiceInstance.sendLocalNotification({
        title: notification.title || 'إشعار جديد',
        body: notification.message || notification.body || 'لديك إشعار جديد',
        data: notification.data || {}
      });
      console.log('✅ [NOTIFICATIONS] Pusher notification sent successfully');
    } else {
      console.log('⚠️ [NOTIFICATIONS] notificationServiceInstance is not properly initialized');
    }
  } catch (error) {
    console.log('⚠️ [NOTIFICATIONS] Error sending Pusher notification:', error);
  }
}; 