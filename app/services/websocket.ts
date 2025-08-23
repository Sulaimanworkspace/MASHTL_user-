import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketService {
  private socket: any = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private currentUserId: string | null = null;
  private currentOrderId: string | null = null;

  private socketUrl = 'http://172.20.10.12:9090';

  // Singleton pattern
  private static instance: WebSocketService;
  
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  // Initialize connection
  public async initialize(userId?: string): Promise<void> {
    try {
      // If no userId provided, try to get from storage
      if (!userId) {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          userId = parsed._id;
        }
      }

      // If still no userId, don't connect
      if (!userId) {
        console.log('🔌 No user ID available, skipping WebSocket connection');
        return;
      }

      // If already connected to the same user, don't reconnect
      if (this.socket && this.currentUserId === userId && this.socket.connected) {
        console.log('🔌 Already connected to same user, skipping reconnection');
        return;
      }

      // Disconnect existing connection if different user
      if (this.socket && this.currentUserId !== userId) {
        console.log('🔌 Different user detected, disconnecting existing socket');
        this.disconnect();
      }

      // Connect if not already connecting
      if (!this.isConnecting && (!this.socket || !this.socket.connected)) {
        await this.connect(userId);
      }
    } catch (error) {
      console.error('❌ Error initializing WebSocket:', error);
    }
  }

  // Connect to WebSocket
  private async connect(userId: string): Promise<void> {
    if (this.isConnecting) {
      console.log('🔌 Already connecting, skipping...');
      return;
    }

    this.isConnecting = true;
    console.log('🔌 Connecting to WebSocket...');

    try {
      this.socket = io(this.socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
        forceNew: true
    });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.currentUserId = userId;
      
      // Join user room for notifications
        this.socket?.emit('join_user_room', userId);
        console.log(`👤 Joined user room: user_${userId}`);
        
        // Listen for all events to debug
        this.socket.onAny((eventName: string, ...args: any[]) => {
          console.log(`🔌 WebSocket event received: ${eventName}`, args);
        });

        // Specific handling for new_message events
        this.socket.on('new_message', (message: any) => {
          console.log('🔌 WebSocket new_message received:', message);
          console.log('🔌 Message orderId:', message.orderId);
          console.log('🔌 Current orderId:', this.currentOrderId);
          
          // If we're in the same chat room, the message will be handled by the chat screen
          if (message.orderId === this.currentOrderId) {
            console.log('🔌 Message is for current chat room');
          } else {
            console.log('🔌 Message is for different chat room or general notification');
          }
        });

        // Specific handling for new_notification events
        this.socket.on('new_notification', (notification: any) => {
          console.log('🔌 WebSocket new_notification received:', notification);
          console.log('🔌 Notification title:', notification.title);
          console.log('🔌 Notification message:', notification.message);
          console.log('🔌 Notification type:', notification.type);
          console.log('🔌 Notification userId:', notification.userId);
          console.log('🔌 Current userId:', this.currentUserId);
        });
    });

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        this.isConnecting = false;
        this.handleReconnect(userId);
      });

      this.socket.on('disconnect', (reason: any) => {
        console.log('🔌 WebSocket disconnected:', reason);
        this.isConnecting = false;
        
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          this.handleReconnect(userId);
      }
    });

      this.socket.on('error', (error: any) => {
        console.error('❌ WebSocket error:', error);
      });

  } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.handleReconnect(userId);
  }
  }

  // Handle reconnection
  private handleReconnect(userId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(userId);
    }, delay);
  }

  // Join chat room
  public joinChat(orderId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.log('❌ Socket not connected, cannot join chat');
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

    console.log(`👥 Attempting to join chat room: chat_${orderId}`);
    this.socket.emit('join_chat', orderId);
    this.currentOrderId = orderId;
    console.log(`👥 Joined chat room: chat_${orderId}`);
  }

  // Leave chat room
  public leaveChat(): void {
    if (!this.socket || !this.socket.connected || !this.currentOrderId) {
      return;
    }

    this.socket.emit('leave_chat', this.currentOrderId);
    console.log(`👥 Left chat room: chat_${this.currentOrderId}`);
    this.currentOrderId = null;
  }

  // Listen for events
  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.log('❌ Socket not available for event listener');
      return;
    }

    console.log(`🔌 Adding event listener for: ${event}`);
    this.socket.on(event, callback);
  }

  // Remove event listener
  public off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) {
      return;
    }

    console.log(`🔌 Removing event listener for: ${event}`);
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Emit event
  public emit(event: string, data: any): void {
    if (!this.socket || !this.socket.connected) {
      console.log('❌ Socket not connected, cannot emit event');
      return;
    }

    this.socket.emit(event, data);
  }

  // Check if connected
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get current user ID
  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Get current order ID
  public getCurrentOrderId(): string | null {
    return this.currentOrderId;
  }

  // Test WebSocket connection
  public async testConnection(): Promise<boolean> {
    console.log('🧪 Testing WebSocket connection...');
    console.log('🧪 Socket URL:', this.socketUrl);
    console.log('🧪 Current connection status:', this.isConnected());
    
    if (!this.socket) {
      console.log('🧪 No socket instance, creating one...');
      await this.initialize();
    }
    
    if (this.socket && this.socket.connected) {
      console.log('✅ WebSocket connection test: SUCCESS');
      console.log('🧪 Socket ID:', this.socket.id);
      console.log('🧪 Current user ID:', this.currentUserId);
      return true;
    } else {
      console.log('❌ WebSocket connection test: FAILED');
      console.log('🧪 Socket exists:', !!this.socket);
      console.log('🧪 Socket connected:', this.socket?.connected);
      return false;
    }
  }

  // Disconnect from WebSocket
  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      
      // Leave chat room if in one
      if (this.currentOrderId) {
        this.socket.emit('leave_chat', this.currentOrderId);
      }
      
      // Leave user room if connected
      if (this.currentUserId) {
        this.socket.emit('leave_user_room', this.currentUserId);
      }
      
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
      this.currentOrderId = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
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
export const webSocketService = WebSocketService.getInstance();
export default webSocketService;