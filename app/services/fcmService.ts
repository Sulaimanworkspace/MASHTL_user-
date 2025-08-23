import messaging from '@react-native-firebase/messaging';
import initializeFirebase from './firebaseInit';

// FCM Service for handling push notifications
export class FCMService {
  private static instance: FCMService;
  private fcmToken: string | null = null;

  private constructor() {}

  static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  // Initialize FCM and get token
  async initialize(): Promise<string | null> {
    try {
      // Initialize Firebase first
      await initializeFirebase();

      // Request permission for iOS
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('❌ User declined push notifications');
        return null;
      }

      // Get FCM token
      this.fcmToken = await messaging().getToken();
      console.log('🔧 FCM Service initialized with token:', this.fcmToken);

      // Listen to token refresh
      messaging().onTokenRefresh(token => {
        this.updateToken(token);
      });

      return this.fcmToken;
    } catch (error) {
      console.error('❌ Error initializing FCM Service:', error);
      return null;
    }
  }

  // Send 2FA verification code via FCM
  async send2FACode(phoneNumber: string, verificationCode: string): Promise<boolean> {
    try {
      if (!this.fcmToken) {
        console.log('⚠️ FCM token not available, initializing...');
        await this.initialize();
      }

      if (!this.fcmToken) {
        console.error('❌ FCM token still not available');
        return false;
      }

      // In production, this would be sent via your backend API
      // For now, we'll simulate the FCM message
      const fcmMessage = {
        to: this.fcmToken,
        notification: {
          title: 'Mashtl - رمز التحقق',
          body: `رمز التحقق الخاص بك هو: ${verificationCode}`,
          icon: '/assets/images/icon.png',
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        data: {
          type: '2fa_verification',
          code: verificationCode,
          phone: phoneNumber,
          timestamp: Date.now().toString()
        },
        priority: 'high'
      };

      console.log('📤 Sending FCM message:', fcmMessage);
      
      // Send via backend API
      return await this.sendFCMMessage(fcmMessage);
    } catch (error) {
      console.error('❌ Error sending 2FA code via FCM:', error);
      return false;
    }
  }

  // Send FCM message via backend API
  private async sendFCMMessage(message: any): Promise<boolean> {
    try {
      // Replace with your actual backend URL
      const backendUrl = 'http://localhost:3001/api/send-2fa-code';
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fcmToken: message.to,
          phoneNumber: message.data.phone,
          verificationCode: message.data.code
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ FCM message sent successfully via backend');
        return true;
      } else {
        console.error('❌ Backend error:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending FCM via backend:', error);
      // Fallback to simulation if backend is not available
      return this.simulateFCMSend(message);
    }
  }

  // Simulate FCM sending (fallback)
  private async simulateFCMSend(message: any): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ FCM message sent successfully (simulated)');
        console.log('📱 Verification code:', message.data.code);
        resolve(true);
      }, 1000);
    });
  }

  // Get current FCM token
  getToken(): string | null {
    return this.fcmToken;
  }

  // Update FCM token (called when token refreshes)
  updateToken(newToken: string): void {
    this.fcmToken = newToken;
    console.log('🔄 FCM token updated:', newToken);
  }
}

// Export singleton instance
export const fcmService = FCMService.getInstance();

// Default export for the service
export default FCMService; 