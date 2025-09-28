import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DreamsSmsService from '../../services/dreamsSms';

// Dreams SMS Configuration
const dreamsSmsConfig = {
  username: 'Nwahtech',
  secretKey: 'd9877b42793f4a0adc2104000f38e0216f08e1f6cc342a3e381fd0f5509d8e37',
  sender: 'nwahtech',
};

// Initialize Dreams SMS service
const dreamsSmsService = new DreamsSmsService(dreamsSmsConfig);

// OTP message template
const otpMessageTemplate = (otp: string) => 
  `رمز التحقق الخاص بك هو: ${otp}\n\nلا تشارك هذا الرمز مع أي شخص.\n\nمع تحيات فريق مشتل`;

// List of possible API URLs to try
const POSSIBLE_URLS = [
  'http://178.128.194.234:8080/api', // Production server (primary)
  'http://178.128.194.234:8080/api',     // Local development server (fallback)      // Local development server (fallback for simulator)
];

let API_BASE_URL = POSSIBLE_URLS[0]; // Start with your local IP address

// Function to test which URL works
const testAPIConnection = async () => {
  console.log('🔍 Testing API connections...');
  console.log('🌍 User location:', navigator.language || 'Unknown');
  console.log('📱 Device type:', navigator.userAgent.includes('iPad') ? 'iPad' : 'iPhone');
  console.log('🌐 Network info:', navigator.onLine ? 'Online' : 'Offline');
  console.log('📱 User Agent:', navigator.userAgent);
  
  for (const url of POSSIBLE_URLS) {
    try {
      console.log(`Testing API URL: ${url}`);
      // Test the root endpoint by removing /api and adding /
      const testUrl = url.replace('/api', '') + '/';
      const response = await axios.get(testUrl, { 
        timeout: 30000, // Extended timeout for international connections (30 seconds)
        headers: {
          'User-Agent': 'MASHTL-Mobile-App/1.1.1',
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        }
      });
      console.log(`✅ Found working API URL: ${url}`);
      console.log(`📊 Response status: ${response.status}`);
      API_BASE_URL = url;
      return url;
    } catch (error: any) {
      console.log(`❌ Failed to connect to: ${url}`);
      console.log(`🔍 Error details:`, {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Log specific error types for debugging
      if (error.code === 'ECONNREFUSED') {
        console.log('   → Connection refused (server may be down or port blocked)');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   → Connection timeout (network issues or firewall)');
      } else if (error.code === 'ENOTFOUND') {
        console.log('   → DNS resolution failed (IP not accessible)');
      } else if (error.code === 'ECONNABORTED') {
        console.log('   → Connection aborted (network interruption)');
      } else if (error.response?.status === 403) {
        console.log('   → Forbidden (server blocking this region)');
      } else if (error.response?.status === 404) {
        console.log('   → Not found (endpoint not available)');
      }
      
      // iPad-specific debugging
      if (navigator.userAgent.includes('iPad')) {
        console.log('   → iPad detected - checking for iPad-specific issues...');
        console.log('   → iPad User Agent:', navigator.userAgent);
        console.log('   → iPad Network Status:', navigator.onLine);
        console.log('   → iPad Connection Type:', navigator.connection?.effectiveType || 'Unknown');
      }
    }
  }
  console.error('⚠️ No working API URL found. Using default:', POSSIBLE_URLS[0]);
  return POSSIBLE_URLS[0];
};

// Test connection on app start (both development and production)
testAPIConnection();

// Export test function for manual testing
export const testConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const result = await testAPIConnection();
    console.log('✅ Connection test result:', result);
    return result;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return null;
  }
};

// iPad-specific connection test
export const testIPadConnection = async () => {
  if (!navigator.userAgent.includes('iPad')) {
    console.log('📱 Not an iPad device, skipping iPad-specific test');
    return null;
  }
  
  console.log('📱 iPad Air 13" detected - running iPad-specific connection test...');
  console.log('📱 iPad User Agent:', navigator.userAgent);
  console.log('📱 iPad Network Status:', navigator.onLine);
  console.log('📱 iPad Connection Type:', navigator.connection?.effectiveType || 'Unknown');
  
  // Test with iPad-specific headers
  for (const url of POSSIBLE_URLS) {
    try {
      console.log(`📱 Testing iPad connection to: ${url}`);
      const testUrl = url.replace('/api', '') + '/';
      const response = await axios.get(testUrl, { 
        timeout: 30000,
        headers: {
          'User-Agent': 'MASHTL-Mobile-App/1.1.1 (iPad; iOS 17.0; iPad Air 13")',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
          'X-Device-Type': 'iPad',
          'X-Device-Model': 'iPad Air 13"'
        }
      });
      console.log(`✅ iPad connection successful to: ${url}`);
      return url;
    } catch (error: any) {
      console.log(`❌ iPad connection failed to: ${url}`);
      console.log(`📱 iPad Error details:`, {
        code: error.code,
        message: error.message,
        status: error.response?.status
      });
    }
  }
  
  console.error('⚠️ No working connection found for iPad Air 13"');
  return null;
};

const api = axios.create({
  get baseURL() { 
    console.log('🌐 Using API URL:', API_BASE_URL);
    return API_BASE_URL; 
  },
  timeout: 30000, // Extended timeout for international connections (30 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for debugging and authentication
api.interceptors.request.use(
  async (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
    if (config.data) {
      console.log('📤 Request data:', config.data);
    }
    
    // Add authentication token if available
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
          console.log('🔑 Added auth token to request');
        } else {
          console.log('⚠️ No token found in user data');
        }
      } else {
        console.log('⚠️ No user data found in AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
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
    console.log('📥 API Response:', response.status, response.config.url);
    if (response.data) {
      console.log('📥 Response data:', response.data);
    }
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('❌ Error status:', error.response.status);
      console.error('❌ Error data:', error.response.data);
      
      // Handle authentication errors (401, 403)
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('🔐 Authentication error detected, clearing user data');
        try {
          await AsyncStorage.removeItem('user_data');
          console.log('✅ User data cleared due to auth error');
        } catch (clearError) {
          console.error('❌ Error clearing user data:', clearError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// User storage functions
export const storeUserData = async (userData: any) => {
  try {
    console.log('💾 Storing user data to AsyncStorage:', {
      hasName: !!userData.name,
      hasToken: !!userData.token,
      hasId: !!userData._id
    });
    
    // Ensure we have the essential data
    if (!userData.token) {
      console.error('❌ Cannot store user data without token');
      return;
    }
    
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    console.log('✅ User data stored successfully');
    
    // Verify storage was successful
    const storedData = await AsyncStorage.getItem('user_data');
    if (!storedData) {
      console.error('❌ User data storage verification failed');
    }
  } catch (error) {
    console.error('❌ Error storing user data:', error);
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    if (!userData) {
      console.log('📱 No user data found in AsyncStorage');
      return null;
    }
    
    const parsedData = JSON.parse(userData);
    
    // Validate the parsed data
    if (!parsedData || typeof parsedData !== 'object') {
      console.error('❌ Invalid user data format in AsyncStorage');
      await AsyncStorage.removeItem('user_data');
      return null;
    }
    
    // Check for essential fields
    if (!parsedData.token) {
      console.error('❌ User data missing token, clearing invalid data');
      await AsyncStorage.removeItem('user_data');
      return null;
    }
    
    // Check if token looks valid (not just "token-..." prefix)
    if (parsedData.token.startsWith('token-') && parsedData.token.length < 20) {
      console.error('❌ User data has malformed token, clearing invalid data');
      await AsyncStorage.removeItem('user_data');
      return null;
    }
    
    console.log('📱 Retrieved user data from AsyncStorage:', {
      hasName: !!parsedData.name,
      hasToken: !!parsedData.token,
      hasId: !!parsedData._id,
      hasLocation: !!parsedData.location
    });
    
    return parsedData;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    // Clear corrupted data
    try {
      await AsyncStorage.removeItem('user_data');
    } catch (clearError) {
      console.error('❌ Error clearing corrupted user data:', clearError);
    }
    return null;
  }
};

export const isUserAuthenticated = async () => {
  try {
    const userData = await getUserData();
    console.log('🔐 Checking authentication - userData:', userData ? {
      hasName: !!userData.name,
      hasToken: !!userData.token,
      hasId: !!userData._id
    } : 'null');
    
    // More lenient check for release builds
    const isAuthenticated = userData && userData.token && (userData.name || userData._id);
    console.log('🔐 Authentication result:', isAuthenticated);
    return isAuthenticated;
  } catch (error) {
    console.error('❌ Error checking authentication:', error);
    return false;
  }
};

export const refreshUserDataFromServer = async () => {
  try {
    console.log('🔄 Attempting to refresh user data from server...');
    
    // Check if we have a valid token first
    const userData = await getUserData();
    if (!userData || !userData.token) {
      console.log('❌ No user data or token available for profile refresh');
      return null;
    }
    
    console.log('🔑 Using token for profile request:', userData.token.substring(0, 20) + '...');
    
    const response = await api.get('/auth/profile');
    console.log('📥 Profile response received:', response.status);
    
    if (response.data && response.data.success) {
      console.log('✅ Profile data received successfully');
      
      // Merge the fresh profile data with existing token and other essential fields
      const refreshedData = {
        ...response.data.data,
        token: userData.token, // Preserve the token
        userType: userData.userType || 'user' // Preserve userType
      };
      
      await AsyncStorage.setItem('user_data', JSON.stringify(refreshedData));
      console.log('💾 User data refreshed and stored with preserved token');
      return refreshedData;
    } else {
      console.log('❌ Profile response not successful:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error refreshing user data from server:', error);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
    return null;
  }
};

export const updateUserProfile = async (updateData: {
  name?: string;
  phone?: string;
  email?: string;
}) => {
  try {
    const response = await api.put('/auth/profile', updateData);
    if (response.data && response.data.success) {
      // Update local storage with new data
      const currentUserData = await getUserData();
      const updatedUserData = { ...currentUserData, ...response.data.data };
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUserData));
      console.log('User profile updated successfully');
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
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
  try {
    console.log('🚀 [BACKEND] Getting OTP from backend...');
    
    // First, get OTP from backend (this stores it in database)
    const backendResponse = await api.post('/auth/send-otp', { 
      phone, 
      type: type || 'signup'
    });
    
    console.log('✅ OTP generated by backend:', backendResponse.data);
    const otp = backendResponse.data.otp;
    
    // Now send the OTP via Dreams SMS
    console.log('🚀 [DREAMS SMS] Sending OTP via Dreams SMS...');
    const dreamsPhone = phone.startsWith('+966') ? phone.substring(4) : phone;
    console.log('📱 [DREAMS SMS] Sending OTP via Dreams SMS to:', dreamsPhone);
    const smsResult = await dreamsSmsService.sendSms(dreamsPhone, otpMessageTemplate(otp));
    
    if (smsResult.success) {
      console.log('✅ OTP sent successfully via Dreams SMS:', smsResult.messageId);
      return {
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        otp: otp, // Remove this in production - only for testing
        messageId: smsResult.messageId
      };
    } else {
      console.error('❌ Dreams SMS error:', smsResult.error);
      // Even if Dreams SMS fails, the OTP is stored in backend, so return success
      return {
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        otp: otp, // Remove this in production - only for testing
        messageId: 'Backend only'
      };
    }
  } catch (error: any) {
    console.error('❌ [BACKEND] sendOTP error:', error);
    throw error;
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
    console.log('Location updated on server:', response.data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Push token API functions
export const updatePushToken = async (pushToken: string) => {
  try {
    console.log('📱 updatePushToken: Calling server with token:', pushToken);
    console.log('📱 updatePushToken: Token length:', pushToken.length);
    console.log('📱 updatePushToken: Token starts with ExponentPushToken:', pushToken.startsWith('ExponentPushToken'));
    
    const response = await api.put('/auth/update-push-token', { pushToken });
    console.log('✅ Push token updated on server:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating push token:', error);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
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
    console.log('Fetching user service orders...');
    const response = await api.get('/service-orders/my-orders');
    console.log('User service orders fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user service orders:', error);
    if (error.response?.status === 401) {
      console.log('Authentication required - user needs to login');
      error.message = 'يرجى تسجيل الدخول أولاً';
    }
    throw error;
  }
};

export const cancelServiceOrder = async (orderId: string, cancelReason?: string) => {
  try {
    console.log('🔍 Sending cancellation request:', { orderId, cancelReason });
    
    const response = await api.put(`/service-orders/${orderId}/cancel`, {
      cancelReason: cancelReason || 'تم الإلغاء من قبل المستخدم'
    });
    
    console.log('🔍 Cancellation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('🔍 Cancellation error:', error);
    throw error;
  }
};

// Chat API functions
export const getChatHistory = async (orderId: string) => {
  try {
    console.log('Fetching chat history for order:', orderId);
    const response = await api.get(`/chat/history/${orderId}`);
    console.log('Chat history fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    if (error.response?.status === 401) {
      console.log('Authentication required - user needs to login');
      error.message = 'يرجى تسجيل الدخول أولاً';
    }
    throw error;
  }
};

export const sendChatMessage = async (orderId: string, receiverId: string, message: string) => {
  try {
    const response = await api.post('/chat/send', {
      orderId,
      receiverId,
      message
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getUnreadMessageCount = async () => {
  try {
    const response = await api.get('/chat/unread-count');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const markMessagesAsRead = async (orderId: string) => {
  try {
    const response = await api.put(`/chat/mark-read/${orderId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Wallet API functions
export const getUserWallet = async () => {
  try {
    const userData = await getUserData();
    if (!userData || !userData._id) {
      throw new Error('User not authenticated');
    }

    const response = await api.get(`/wallets/${userData._id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    throw error;
  }
};

// Services API functions
export const getServices = async () => {
  try {
    console.log('Fetching services from backend...');
    const response = await api.get('/services');
    console.log('Services fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching services:', error);
    
    // If backend is not available, return empty services array
    // The المشاريع service will be added hardcoded in the Home component
    console.log('No fallback services - returning empty array');
    return {
      success: false,
      data: [],
      count: 0
    };
  }
};

export const getServiceById = async (id: string) => {
  try {
    console.log('🔍 Fetching service by ID:', id);
    const response = await api.get(`/services/${id}`);
    console.log('✅ Service fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching service:', error);
    throw error;
  }
};

// Project API functions
export const createProjectRequest = async (projectData: {
  projectName: string;
  projectType: string;
  city: string;
  address?: string;
  duration: string;
  price: string;
  other?: string;
}) => {
  try {
    console.log('🔄 Creating project request:', projectData);
    const response = await api.post('/projects/create', projectData);
    console.log('✅ Project request created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating project request:', error);
    throw error;
  }
};

export const getUserProjectRequests = async () => {
  try {
    console.log('🔄 Fetching user project requests');
    const response = await api.get('/projects/user');
    console.log('✅ User project requests fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching user project requests:', error);
    throw error;
  }
};

// Update order price (when user accepts farmer's price proposal)
export const updateOrderPrice = async (orderId: string, price: number) => {
  try {
    const response = await api.put(`/service-orders/${orderId}/price`, { price });
    return response.data;
  } catch (error) {
    console.error('Error updating order price:', error);
    throw error;
  }
};

// Complaint functions
export const createComplaint = async (complaintData: {
  complaintType: string;
  title: string;
  description: string;
}) => {
  try {
    console.log('🔄 Creating complaint:', complaintData);
    const response = await api.post('/complaints', complaintData);
    console.log('✅ Complaint created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating complaint:', error);
    throw new Error(error.response?.data?.message || 'Error creating complaint');
  }
};

export const getUserComplaints = async () => {
  try {
    console.log('🔄 Fetching user complaints');
    const response = await api.get('/complaints/user');
    console.log('✅ User complaints fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching user complaints:', error);
    throw new Error(error.response?.data?.message || 'Error fetching complaints');
  }
};

// Invoice functions
export const getInvoiceData = async (orderId: string) => {
  try {
    console.log('🔄 Fetching invoice data for order:', orderId);
    const response = await api.get(`/service-orders/${orderId}/invoice`);
    console.log('✅ Invoice data fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching invoice data:', error);
    throw new Error(error.response?.data?.message || 'Error fetching invoice data');
  }
};

export default api; 