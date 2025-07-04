import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// List of possible API URLs to try
const POSSIBLE_URLS = [
  'http://172.20.10.3:9090/api',     // Your actual computer IP (found via ipconfig)
  'http://10.0.2.2:9090/api',        // Android Emulator
  'http://localhost:9090/api',       // iOS Simulator
  'http://127.0.0.1:9090/api',      // iOS Simulator alternative
  'http://192.168.1.100:9090/api',  // Common local network IP
  'http://192.168.0.100:9090/api',  // Alternative local network IP
  'http://172.20.166.176:9090/api', // Your previous working IP
];

let API_BASE_URL = POSSIBLE_URLS[0]; // Start with Android Emulator

// Function to test which URL works
const testAPIConnection = async () => {
  for (const url of POSSIBLE_URLS) {
    try {
      console.log(`🔍 Testing API URL: ${url}`);
      const response = await axios.get(`${url.replace('/api', '')}`, { timeout: 5000 });
      console.log(`✅ Found working API URL: ${url}`);
      API_BASE_URL = url;
      return url;
    } catch (error) {
      console.log(`❌ Failed to connect to: ${url}`);
    }
  }
  console.error('❌ No working API URL found. Using default:', POSSIBLE_URLS[0]);
  return POSSIBLE_URLS[0];
};

// Test connection on app start
testAPIConnection();

const api = axios.create({
  get baseURL() { return API_BASE_URL; },
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for debugging and authentication
api.interceptors.request.use(
  async (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
    console.log('📦 Request data:', config.data);
    
    // Add authentication token if available
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
          console.log('🔐 Added auth token to request');
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    console.log('📦 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('📦 Error response:', error.response.data);
      console.error('📦 Error status:', error.response.status);
    } else if (error.request) {
      console.error('📦 No response received - Check if server is running on correct port');
      console.error('📦 Current API URL:', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);

// User storage functions
export const storeUserData = async (userData: any) => {
  try {
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('user_data');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

// Auth API functions
export const login = async (phone: string, password: string) => {
  const response = await api.post('/auth/login', { phone, password });
  return response.data;
};

export const registerUser = async (userData: { name: string; phone: string; password: string }) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const sendOTP = async (phone: string, type?: string) => {
  // Try to find working URL if current one fails
  try {
    const response = await api.post('/auth/send-otp', { phone, type });
    return response.data;
  } catch (error) {
    console.log('🔄 Retrying with different API URL...');
    await testAPIConnection();
    const response = await api.post('/auth/send-otp', { phone, type });
    return response.data;
  }
};

export const verifyOTP = async (phone: string, otp: string) => {
  const response = await api.post('/auth/verify-otp', { phone, otp });
  return response.data;
};

export const checkPhoneExists = async (phone: string) => {
  const response = await api.post('/auth/check-phone', { phone });
  return response.data;
};

// Notification API functions
export const getUserNotifications = async (userId: string) => {
  try {
    const response = await api.get(`/notifications/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteNotification = async (notificationId: string, userId: string) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const response = await api.put(`/notifications/read/${notificationId}`, { userId });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getNotificationCount = async (userId: string) => {
  try {
    const response = await api.get(`/notifications/count/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Location API functions
export const updateUserLocation = async (userId: string, locationData: {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
}) => {
  try {
    const response = await api.put(`/auth/update-location/${userId}`, locationData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Service Order API functions
export const createServiceOrder = async (orderData: {
  serviceType: string;
  serviceTitle: string;
  description?: string;
  location: {
    address: string;
    city?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  notes?: string;
  images?: string[];
}) => {
  try {
    const response = await api.post('/service-orders', orderData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getUserServiceOrders = async () => {
  try {
    const response = await api.get('/service-orders/my-orders');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const cancelServiceOrder = async (orderId: string) => {
  try {
    const response = await api.put(`/service-orders/${orderId}/status`, {
      status: 'cancelled'
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export default api; 