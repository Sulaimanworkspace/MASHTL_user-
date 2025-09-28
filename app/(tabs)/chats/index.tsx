import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, getUserServiceOrders, getUnreadMessageCount } from '../../services/api';
import pusherService from '../../services/pusher';
import SimpleUserAvatar from '../../components/SimpleUserAvatar';

interface ChatOrder {
  _id: string;
  serviceTitle: string;
  farmer?: {
    _id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  status: string;
  createdAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const ChatInboxScreen: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatOrders, setChatOrders] = useState<ChatOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch chat orders (orders with farmers but not completed)
  const fetchChatOrders = async () => {
    try {
      console.log('🔍 Fetching chat orders...');
      const response = await getUserServiceOrders();
      if (response.success) {
        // Only show chats for active orders
        const activeStatuses = ['accepted', 'in_progress', 'working', 'almost_done', 'finalizing'];
        const ordersWithFarmers = response.data.filter((order: ChatOrder) => 
          order.farmer && activeStatuses.includes(order.status)
        );
        console.log('📱 User chat orders data:', ordersWithFarmers.map((o: any) => ({ 
          id: o._id, 
          serviceTitle: o.serviceTitle, 
          title: o.title,
          serviceType: o.serviceType,
          status: o.status
        })));
        setChatOrders(ordersWithFarmers);
      } else {
        console.log('⚠️ No orders found or API returned success: false');
        setChatOrders([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching chat orders:', error);
      if (error.message === 'يرجى تسجيل الدخول أولاً') {
        console.log('🔐 Redirecting to login due to authentication error');
        router.replace('/(tabs)/auth/login');
      } else {
        console.log('📱 Setting empty chat orders due to error');
        setChatOrders([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication and redirect if not logged in
  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        try {
          setIsLoading(true);
          console.log('🔍 Checking authentication status...');
          const userData = await getUserData();
          if (!userData || !userData.token || (!userData.name && !userData._id)) {
            console.log('⚠️ User not authenticated, redirecting to login');
            router.replace('/(tabs)/auth/login');
            return;
          }
          console.log('✅ User authenticated:', userData.name);
          setIsLoggedIn(true);
          await fetchChatOrders();
        } catch (error) {
          console.error('❌ Error checking authentication:', error);
          router.replace('/(tabs)/auth/login');
        }
      };
      checkAuthStatus();
    }, [])
  );

  // Initialize Pusher and listen for events
  useEffect(() => {
    let isInitialized = false;
    
    const initializePusher = async () => {
      if (isInitialized) return;
      isInitialized = true;
      
      try {
        console.log('🔌 Initializing Pusher in chat list...');
        // Get user ID from AsyncStorage and pass it explicitly
        const userData = await AsyncStorage.getItem('user_data');
        let userId = null;
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            userId = parsed._id;
            console.log('🔌 User ID from storage:', userId);
          } catch (error) {
            console.error('❌ Error parsing user data:', error);
          }
        }
        await pusherService.initialize(userId);
    
        // Create event handler functions
        const handleOrderCompleted = (data: { orderId: string }) => {
      console.log('📱 User received order_completed event:', data.orderId);
      setChatOrders(prev => prev.filter(order => order._id !== data.orderId));
        };

        const handleOrderCancelled = (data: { orderId: string }) => {
          console.log('📱 User received order_cancelled event:', data.orderId);
          setChatOrders(prev => prev.filter(order => order._id !== data.orderId));
        };

        const handleOrderRejected = (data: { orderId: string }) => {
          console.log('📱 User received order_rejected event:', data.orderId);
          setChatOrders(prev => prev.filter(order => order._id !== data.orderId));
        };

        const handleNewMessage = (message: any) => {
          console.log('📱 User received new_message event in chat list:', message);
          // Only refresh if not in a specific chat to avoid conflicts
          if (!message.orderId || message.orderId !== 'current_chat') {
          fetchChatOrders();
          }
        };

        // Add event listeners
        pusherService.on('order_completed', handleOrderCompleted);
        pusherService.on('order_cancelled', handleOrderCancelled);
        pusherService.on('order_rejected', handleOrderRejected);
        pusherService.on('new_message', handleNewMessage);
        
        console.log('🔌 Pusher initialized in chat list successfully');
      } catch (error) {
        console.error('❌ Error initializing Pusher:', error);
        isInitialized = false;
      }
    };

    if (isLoggedIn) {
    initializePusher();
    }

    return () => {
      console.log('🔌 Cleaning up Pusher listeners in chat list...');
      // Clean up event listeners with specific handlers
      pusherService.off('order_completed');
      pusherService.off('order_cancelled');
      pusherService.off('order_rejected');
      pusherService.off('new_message');
      isInitialized = false;
    };
  }, [isLoggedIn]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChatOrders();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ChatOrder }) => {
    return (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => {
        if (item.farmer) {
          router.push({
            pathname: '/(tabs)/chats/message',
            params: {
              orderId: item._id,
              farmerId: item.farmer._id,
              farmerName: item.farmer.name,
              farmerAvatar: item.farmer.avatar
            }
          });
        }
      }}
    >
        <SimpleUserAvatar 
          avatarUrl={item.farmer?.avatar}
          size={48}
          style={styles.avatarContainer}
        />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.name}>{item.farmer?.name || 'مزارع'}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString('en-US')}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || `خدمة: ${(item as any).title || item.serviceTitle || 'خدمة'}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
  };

  // Don't render anything if not authenticated (prevents flash)
  if (!isLoggedIn && isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      {/* Header */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>المحادثات</Text>
          </View>
        </View>
      </View>
      {/* Chat List */}
      <FlatList
        data={chatOrders}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <FontAwesome5 name="comments" size={48} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد محادثات </Text>
            <Text style={styles.emptySubtext}>ستظهر المحادثات هنا للطلبات المقبولة والتي لم تكتمل بعد</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatarContainer: {
    marginLeft: 14,
    marginRight: 0,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  chatHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    width: '100%',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    textAlign: 'right',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
    textAlign: 'left',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    width: '100%',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default ChatInboxScreen; 