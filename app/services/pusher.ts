import Pusher from 'pusher-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PusherService {
  private pusher: Pusher | null = null;
  private isConnecting: boolean = false;
  private currentUserId: string | null = null;
  private currentOrderId: string | null = null;
  private currentChannel: any = null;
  private messageCallbacks: ((data: any) => void)[] = [];
  private notificationCallbacks: ((data: any) => void)[] = [];

  // Singleton pattern
  private static instance: PusherService;
  
  public static getInstance(): PusherService {
    if (!PusherService.instance) {
      PusherService.instance = new PusherService();
    }
    return PusherService.instance;
  }

  // Initialize connection
  public async initialize(userId?: string): Promise<void> {
    try {
      console.log('🔌 Pusher initialize called with userId:', userId);
      
      // If no userId provided, try to get from storage
      if (!userId) {
        console.log('🔌 No userId provided, checking AsyncStorage...');
        const userData = await AsyncStorage.getItem('user_data');
        console.log('🔌 AsyncStorage userData:', userData);
        
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            console.log('🔌 Parsed user data:', parsed);
            userId = parsed._id;
            console.log('🔌 Extracted user ID from storage:', userId);
          } catch (parseError) {
            console.error('❌ Error parsing user data from storage:', parseError);
          }
        } else {
          console.log('🔌 No user data found in AsyncStorage');
        }
      }

      // If still no userId, don't connect
      if (!userId) {
        console.log('🔌 No user ID available, skipping Pusher connection');
        return;
      }

      console.log('🔌 User ID confirmed:', userId);

      // If already connected to the same user, don't reconnect
      if (this.pusher && this.currentUserId === userId && this.pusher.connection.state === 'connected') {
        console.log('🔌 Already connected to same user, skipping reconnection');
        return;
      }

      // Disconnect existing connection if different user
      if (this.pusher && this.currentUserId !== userId) {
        console.log('🔌 Different user detected, disconnecting existing pusher');
        this.disconnect();
      }

      // Connect if not already connecting
      if (!this.isConnecting && (!this.pusher || this.pusher.connection.state !== 'connected')) {
        console.log('🔌 Proceeding with connection...');
        this.isConnecting = true;
        await this.connect(userId);
      } else {
        console.log('🔌 Connection conditions not met:', {
          isConnecting: this.isConnecting,
          hasPusher: !!this.pusher,
          isConnected: this.pusher?.connection.state === 'connected'
        });
      }
    } catch (error) {
      console.error('❌ Error initializing Pusher:', error);
    }
  }

  // Connect to Pusher
  private async connect(userId: string): Promise<void> {
    console.log('🔌 Connect method called with userId:', userId);
    
    this.isConnecting = true;
    console.log('🔌 Connecting to Pusher...');

    try {
      console.log('🔌 Creating Pusher connection...');
      
      // Use environment-based configuration
      const pusherKey = __DEV__ 
        ? '7038f3802cd2b0028148'  // Development key
        : '7038f3802cd2b0028148'; // Production key (replace with your production key)
      
      const pusherCluster = __DEV__ 
        ? 'mt1'  // Development cluster
        : 'mt1'; // Production cluster (replace with your production cluster)
      
      console.log('🔌 Pusher config:', { 
        key: pusherKey.substring(0, 8) + '...', 
        cluster: pusherCluster,
        environment: __DEV__ ? 'development' : 'production'
      });
      
      // Get user token for authentication
      const userData = await AsyncStorage.getItem('user_data');
      let userToken = '';
      if (userData) {
        const parsed = JSON.parse(userData);
        userToken = parsed.token;
      }

      // Determine API base URL
      const API_BASE_URL = __DEV__ 
        ? 'http://172.20.10.4:9090' 
        : 'http://178.128.194.234:8080';

      this.pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        encrypted: true,
        forceTLS: true,
        authorizer: (channel, options) => {
          return {
            authorize: (socketId, callback) => {
              console.log('🔐 Authorizing Pusher channel:', channel.name);
              
              fetch(`${API_BASE_URL}/api/pusher/auth`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                  socket_id: socketId,
                  channel_name: channel.name
                })
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Auth failed: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                console.log('✅ Pusher auth successful');
                callback(null, data);
              })
              .catch(error => {
                console.error('❌ Pusher auth failed:', error);
                callback(error, null);
              });
            }
          };
        }
      });

      this.pusher.connection.bind('connected', () => {
        console.log('✅ Pusher connected successfully');
        console.log('🔌 User ID:', userId);
        this.isConnecting = false;
        this.currentUserId = userId;
        
        // Join user room for notifications
        console.log('🔌 Subscribing to user room:', `user_${userId}`);
        const userChannel = this.pusher?.subscribe(`user_${userId}`);
        
        if (userChannel) {
          userChannel.bind('new_notification', (data: any) => {
            console.log('📱 Pusher new_notification received in service:', data);
            
            // Forward to registered notification callbacks
            this.notificationCallbacks.forEach((callback, index) => {
              try {
                callback(data);
              } catch (error) {
                console.error(`📱 Error in notification callback ${index}:`, error);
              }
            });
          });
        }
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log('🔌 Pusher disconnected');
        this.isConnecting = false;
      });

      this.pusher.connection.bind('error', (error: any) => {
        console.error('❌ Pusher connection error:', error);
        this.isConnecting = false;
      });

    } catch (error) {
      console.error('❌ Error creating Pusher connection:', error);
      this.isConnecting = false;
    }
  }

  // Join chat room
  public joinChat(orderId: string): void {
    console.log('🔌 joinChat called with orderId:', orderId);
    console.log('🔌 Pusher exists:', !!this.pusher);
    console.log('🔌 Pusher connected:', this.pusher?.connection.state === 'connected');
    console.log('🔌 Current order ID:', this.currentOrderId);
    
    if (!this.pusher || this.pusher.connection.state !== 'connected') {
      console.log('❌ Pusher not connected, cannot join chat');
      return;
    }

    if (this.currentOrderId === orderId) {
      console.log('🔌 Already in this chat room');
      return;
    }

    // Leave previous chat room if any
    if (this.currentOrderId) {
      this.leaveChat();
    }

    console.log(`👥 Subscribing to chat room: chat_${orderId}`);
    const chatChannel = this.pusher.subscribe(`chat_${orderId}`);
    this.currentOrderId = orderId;
    this.currentChannel = chatChannel; // Store reference to current channel
    console.log(`👥 Subscribed to chat room: chat_${orderId}`);
    
    // Bind to new_message events (only once per channel)
    chatChannel.bind('new_message', (data: any) => {
      console.log('💬 Pusher new_message received in service:', data);
      console.log('💬 Message callbacks count:', this.messageCallbacks.length);
      
      // Trigger all registered message callbacks
      this.messageCallbacks.forEach((callback, index) => {
        console.log(`💬 Triggering callback ${index}:`, callback);
        try {
          callback(data);
        } catch (error) {
          console.error('💬 Error in message callback:', error);
        }
      });
    });
  }

  // Leave chat room
  public leaveChat(): void {
    if (!this.pusher || this.pusher.connection.state !== 'connected' || !this.currentOrderId) {
      return;
    }

    // Unbind the event listener from the current channel
    if (this.currentChannel) {
      this.currentChannel.unbind('new_message');
      console.log('🔌 Unbound new_message event from current channel');
    }

    this.pusher.unsubscribe(`chat_${this.currentOrderId}`);
    console.log(`👥 Unsubscribed from chat room: chat_${this.currentOrderId}`);
    this.currentOrderId = null;
    this.currentChannel = null;
  }

  // Listen for events
  public on(event: string, callback: (...args: any[]) => void): void {
    if (event === 'new_message') {
      // Handle new_message events specially through our callback system
      console.log('🔌 Adding new_message callback, total callbacks:', this.messageCallbacks.length + 1);
      this.messageCallbacks.push(callback);
      console.log('🔌 new_message callback added successfully');
      return;
    }

    if (event === 'new_notification') {
      // Handle new_notification events specially through our callback system
      console.log('🔌 Adding new_notification callback, total callbacks:', this.notificationCallbacks.length + 1);
      this.notificationCallbacks.push(callback);
      console.log('🔌 new_notification callback added successfully');
      return;
    }

    console.log(`🔌 Adding event listener for: ${event}`);
    // For other events, you might need to implement channel-specific binding
  }

  // Remove event listener
  public off(event: string, callback?: (...args: any[]) => void): void {
    if (event === 'new_message') {
      // Handle new_message events specially through our callback system
      if (callback) {
        const index = this.messageCallbacks.indexOf(callback);
        if (index > -1) {
          this.messageCallbacks.splice(index, 1);
        }
      } else {
        this.messageCallbacks = [];
      }
      return;
    }

    if (event === 'new_notification') {
      // Handle new_notification events specially through our callback system
      if (callback) {
        const index = this.notificationCallbacks.indexOf(callback);
        if (index > -1) {
          this.notificationCallbacks.splice(index, 1);
        }
      } else {
        this.notificationCallbacks = [];
      }
      return;
    }

    console.log(`🔌 Removing event listener for: ${event}`);
  }

  // Emit event (not applicable for Pusher client)
  public emit(event: string, data: any): void {
    console.log('⚠️ Pusher client cannot emit events - this is handled by the server');
  }

  // Check if connected
  public isConnected(): boolean {
    return this.pusher?.connection.state === 'connected' || false;
  }

  // Get current user ID
  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Get current order ID
  public getCurrentOrderId(): string | null {
    return this.currentOrderId;
  }

  // Test pusher connection
  public testConnection(): void {
    if (!this.pusher || this.pusher.connection.state !== 'connected') {
      console.log('❌ Pusher not connected, cannot test');
      return;
    }
    
    if (!this.currentUserId) {
      console.log('❌ No user ID available for testing');
      return;
    }
    
    console.log('🧪 Testing pusher connection...');
    console.log('🧪 Current user ID:', this.currentUserId);
    console.log('🧪 Pusher connected:', this.pusher.connection.state === 'connected');
    console.log('🧪 Pusher socket ID:', this.pusher.connection.socket_id);
  }

  // Disconnect
  public disconnect(): void {
    if (this.pusher) {
      console.log('🔌 Disconnecting Pusher...');
      
      // Leave chat room if in one
      if (this.currentOrderId) {
        this.pusher.unsubscribe(`chat_${this.currentOrderId}`);
      }
      
      // Leave user room if connected
      if (this.currentUserId) {
        this.pusher.unsubscribe(`user_${this.currentUserId}`);
      }
      
      this.pusher.disconnect();
      this.pusher = null;
      this.currentUserId = null;
      this.currentOrderId = null;
      this.isConnecting = false;
      this.messageCallbacks = [];
      this.notificationCallbacks = [];
    }
  }

  // Update user location
  public async updateUserLocation(latitude: number, longitude: number): Promise<void> {
    if (!this.currentUserId) {
      console.log('❌ No user ID available for location update');
      return;
    }

    try {
      console.log('📍 Updating user location:', { latitude, longitude });
      console.log('📍 Current user ID:', this.currentUserId);
      
      // Get user token from storage
      const userData = await AsyncStorage.getItem('user_data');
      let token = '';
      if (userData) {
        const parsed = JSON.parse(userData);
        token = parsed.token || '';
        console.log('📍 User data from storage:', { _id: parsed._id, token: token ? 'present' : 'missing' });
      }
      
      if (!token) {
        console.error('❌ No user token available for location update');
        return;
      }
      
      if (!this.currentUserId) {
        console.error('❌ No current user ID available for location update');
        return;
      }
      
      // Get the real address from user data
      let currentAddress = 'موقع محدث عبر Pusher';
      let currentCity = 'الرياض';
      
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          console.log('📍 Full user data for address:', JSON.stringify(parsed, null, 2));
          
          // Try to get address from different possible locations
          if (parsed.address && typeof parsed.address === 'string' && parsed.address.trim() !== '') {
            currentAddress = parsed.address;
          } else if (parsed.location && parsed.location.address && typeof parsed.location.address === 'string') {
            currentAddress = parsed.location.address;
          } else if (parsed.address && typeof parsed.address === 'object' && parsed.address.address) {
            currentAddress = parsed.address.address;
          }
          
          // Get city
          if (parsed.location && parsed.location.city && typeof parsed.location.city === 'string') {
            currentCity = parsed.location.city;
          } else if (parsed.city && typeof parsed.city === 'string') {
            currentCity = parsed.city;
          }
        }
      } catch (error) {
        console.log('⚠️ Could not get address from storage:', error);
      }
      
      const requestBody = {
        latitude,
        longitude,
        address: currentAddress,
        city: currentCity
      };
      
      console.log('📍 Sending location update request:', requestBody);
      
      // Send location update to server via API (using existing working endpoint)
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:9090'}/api/auth/update-location/${this.currentUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        console.log('✅ User location updated successfully');
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to update user location:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error updating user location:', error);
    }
  }

  // Clear user data (for logout)
  public async clearUserData(): Promise<void> {
    this.disconnect();
    this.currentUserId = null;
    this.currentOrderId = null;
  }
}

// Export singleton instance
export const pusherService = PusherService.getInstance();
export default pusherService;
