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

  if (Platform.OS === 'ios') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ [NOTIFICATIONS] Failed to get push token for push notification!');
      return;
    }
    
    // Get the token that uniquely identifies this device
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: '298f9159-3f1c-4cdb-97a8-8fc32fe63138', // Your EAS project ID
    })).data;
    
    console.log('✅ [NOTIFICATIONS] Expo push token:', token);
  } else {
    console.log('📱 [NOTIFICATIONS] Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'ios') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function schedulePushNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: { 
      seconds: 2 
    },
  });
}

// Notification Service Class
class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
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
        console.log('⚠️ [NOTIFICATIONS] No push token received');
        return false;
      }
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Error initializing notification service:', error);
      return false;
    }
  }

  // Save JWT token to server for push notifications
  public async saveJWTTokenToServer(): Promise<void> {
    try {
      console.log('🔑 [NOTIFICATIONS] Saving JWT token to server...');
      
      // Get the push token
      const pushToken = await registerForPushNotificationsAsync();
      
      if (!pushToken) {
        console.log('⚠️ [NOTIFICATIONS] No push token available to save');
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
      console.error('❌ [NOTIFICATIONS] Error saving JWT token to server:', error);
      // Don't throw error to prevent app crash
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
      console.error('❌ [NOTIFICATIONS] Error sending local notification:', error);
    }
  }

  // Request notification permission
  public async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Error requesting permission:', error);
      return false;
    }
  }

  // Add notification response listener
  public addNotificationResponseReceivedListener(callback: (response: any) => void): any {
    try {
      console.log('🔔 [NOTIFICATIONS] Adding notification response listener...');
      return Notifications.addNotificationResponseReceivedListener(callback);
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Error adding notification response listener:', error);
      return null;
    }
  }

  // Test JWT saving functionality
  public async testJWTSaving(): Promise<void> {
    try {
      console.log('🧪 [NOTIFICATIONS] Testing JWT saving functionality...');
      await this.saveJWTTokenToServer();
      console.log('✅ [NOTIFICATIONS] JWT saving test completed');
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] JWT saving test failed:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export the class for testing
export { NotificationService }; 