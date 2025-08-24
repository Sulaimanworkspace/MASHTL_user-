import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  }

  // Initialize notification service
  public async initialize(): Promise<boolean> {
    try {
      console.log('🚀 [NOTIFICATIONS] Initializing notification service...');
      
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
}

// Create and export singleton instance
const notificationServiceInstance = new NotificationService();
console.log('🔧 [NOTIFICATIONS] Created notification service instance:', notificationServiceInstance);
console.log('🔧 [NOTIFICATIONS] Instance type:', typeof notificationServiceInstance);
console.log('🔧 [NOTIFICATIONS] Instance has initialize method:', typeof notificationServiceInstance.initialize);

// Export singleton instance
export const notificationService = notificationServiceInstance;

// Export the class for testing
export { NotificationService };

// Add default export for compatibility
export default notificationServiceInstance;

// Add missing function for WebSocket notifications
export const sendNotificationFromWebSocket = (notification: any) => {
  try {
    console.log('🔔 [NOTIFICATIONS] Sending WebSocket notification:', notification);
    
    // Send local notification
    if (notificationServiceInstance && typeof notificationServiceInstance.sendLocalNotification === 'function') {
      notificationServiceInstance.sendLocalNotification({
        title: notification.title || 'إشعار جديد',
        body: notification.message || notification.body || 'لديك إشعار جديد',
        data: notification.data || {}
      });
      console.log('✅ [NOTIFICATIONS] WebSocket notification sent successfully');
    } else {
      console.log('⚠️ [NOTIFICATIONS] notificationServiceInstance is not properly initialized');
    }
  } catch (error) {
    console.log('⚠️ [NOTIFICATIONS] Error sending WebSocket notification:', error);
  }
}; 