import io from 'socket.io-client';
import { getUserData } from './api';
import { notificationService, sendNotificationFromWebSocket } from './notifications';

// WebSocket connection
let socket: any = null;
let isConnected = false;

// List of possible WebSocket URLs to try
const POSSIBLE_WS_URLS = [
  'http://172.20.10.12:9090',   // Your Mac's IP address
  'http://10.0.2.2:9090',        // Android Emulator
  'http://localhost:9090',       // iOS Simulator
  'http://127.0.0.1:9090',      // iOS Simulator alternative
  'http://192.168.1.100:9090',  // Common local network IP
  'http://192.168.0.100:9090',  // Alternative local network IP
];

let WS_BASE_URL = POSSIBLE_WS_URLS[0];

// Callback function type for notification updates
type NotificationUpdateCallback = (count: number) => void;

// Store callback function
let notificationUpdateCallback: NotificationUpdateCallback | null = null;

// Function to test which WebSocket URL works
const testWebSocketURL = async (): Promise<string> => {
  for (const url of POSSIBLE_WS_URLS) {
    try {
      console.log(`Testing WebSocket URL: ${url}`);
      const testSocket = io(url, { timeout: 5000 });
      
      return new Promise<string>((resolve) => {
        testSocket.on('connect', () => {
          console.log(`Found working WebSocket URL: ${url}`);
          testSocket.disconnect();
          WS_BASE_URL = url;
          resolve(url);
        });
        
        testSocket.on('connect_error', () => {
          console.log(`Failed to connect to WebSocket: ${url}`);
          testSocket.disconnect();
          resolve(POSSIBLE_WS_URLS[0]);
        });
        
        setTimeout(() => {
          testSocket.disconnect();
          resolve(POSSIBLE_WS_URLS[0]);
        }, 3000);
      });
    } catch (error) {
      console.log(`Failed to test WebSocket URL: ${url}`);
    }
  }
  console.error('No working WebSocket URL found. Using default:', POSSIBLE_WS_URLS[0]);
  return POSSIBLE_WS_URLS[0];
};

// Initialize WebSocket connection
export const initializeWebSocket = async (onNotificationUpdate?: NotificationUpdateCallback) => {
  try {
    if (socket && isConnected) {
      console.log('WebSocket already connected');
      return socket;
    }

    // Store callback function
    if (onNotificationUpdate) {
      notificationUpdateCallback = onNotificationUpdate;
    }

    // Test connection and get working URL
    await testWebSocketURL();
    
    console.log('🔌 Initializing WebSocket connection to:', WS_BASE_URL);
    
    socket = io(WS_BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected successfully');
      isConnected = true;
      
      // Join user room for notifications
      joinUserRoom();
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      isConnected = false;
    });

    socket.on('connect_error', (error: any) => {
      console.error('🔌 WebSocket connection error:', error);
      isConnected = false;
    });

    // Notification event handler
    socket.on('new_notification', (notification: any) => {
      console.log('📱 Received new notification:', notification);
      
      // Send professional push notification
      sendNotificationFromWebSocket({
        title: notification.title || 'إشعار جديد',
        body: notification.message || 'لديك إشعار جديد',
        data: notification
      });
      
      // Update notification count immediately
      if (notificationUpdateCallback) {
        // Increment the current count by 1 for new notifications
        notificationUpdateCallback(1); // This will increment the count
      }
    });

    return socket;
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    return null;
  }
};

// Join user room for notifications
const joinUserRoom = async () => {
  try {
    const userData = await getUserData();
    if (userData && userData._id && socket) {
      socket.emit('join_user_room', userData._id);
      console.log(`👤 Joined user room: user_${userData._id}`);
    }
  } catch (error) {
    console.error('Error joining user room:', error);
  }
};

// Leave user room
export const leaveUserRoom = async () => {
  try {
    const userData = await getUserData();
    if (userData && userData._id && socket) {
      socket.emit('leave_user_room', userData._id);
      console.log(`👤 Left user room: user_${userData._id}`);
    }
  } catch (error) {
    console.error('Error leaving user room:', error);
  }
};

// Update notification callback
export const setNotificationUpdateCallback = (callback: NotificationUpdateCallback) => {
  notificationUpdateCallback = callback;
};

// Disconnect WebSocket
export const disconnectWebSocket = () => {
  if (socket) {
    console.log('🔌 Disconnecting WebSocket');
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
  notificationUpdateCallback = null;
};

// Get connection status
export const getWebSocketStatus = () => {
  return {
    isConnected,
    socket: socket
  };
};

// Reconnect WebSocket
export const reconnectWebSocket = async () => {
  console.log('🔌 Attempting to reconnect WebSocket');
  disconnectWebSocket();
  return await initializeWebSocket(notificationUpdateCallback || undefined);
};

// Export test function
export const testWebSocketConnection = async (): Promise<string | null> => {
  try {
    console.log('Testing WebSocket connection...');
    const result = await testWebSocketURL();
    console.log('WebSocket connection test result:', result);
    return result;
  } catch (error) {
    console.error('WebSocket connection test failed:', error);
    return null;
  }
}; 