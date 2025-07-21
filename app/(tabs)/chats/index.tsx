import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Animated } from 'react-native';
import { getUserData, getUserServiceOrders, getUnreadMessageCount } from '../../services/api';
import webSocketService from '../../services/websocket';

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
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const fadeAnimRefs = useRef<{[key: string]: Animated.Value}>({});

  // Fetch chat orders (orders with farmers but not completed)
  const fetchChatOrders = async () => {
    try {
      console.log('🔍 Fetching chat orders...');
      const response = await getUserServiceOrders();
      if (response.success) {
        // Filter orders that have farmers (accepted orders) and are not completed
        const ordersWithFarmers = response.data.filter((order: ChatOrder) => 
          order.farmer && order.status !== 'completed'
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
          if (!userData || !userData.name || !userData.token) {
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

  // Initialize WebSocket and listen for events
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        await webSocketService.initialize();
        
        // Listen for order completion events
        webSocketService.on('order_completed', (data: { orderId: string }) => {
          console.log('📱 User received order_completed event:', data.orderId);
          setChatOrders(prev => prev.filter(order => order._id !== data.orderId));
        });

        // Listen for new messages to update chat list
        webSocketService.on('new_message', (message: any) => {
          console.log('📱 User received new_message event in chat list:', message);
          // Refresh chat orders to show updated last message
          fetchChatOrders();
        });
      } catch (error) {
        console.error('❌ Error initializing WebSocket:', error);
      }
    };

    initializeWebSocket();

    return () => {
      // Clean up event listeners
      webSocketService.off('order_completed');
      webSocketService.off('new_message');
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChatOrders();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ChatOrder }) => {
    // Get or create fade animation ref for this item
    if (!fadeAnimRefs.current[item._id]) {
      fadeAnimRefs.current[item._id] = new Animated.Value(0);
    }
    const fadeAnim = fadeAnimRefs.current[item._id];
    const imageError = imageErrors[item._id] || false;

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
        <View style={styles.avatarContainer}>
          <Animated.Image 
            source={require('../../../assets/images/icon.jpg')}
            style={[
              styles.avatar,
              { opacity: fadeAnim }
            ]}
            onLoadStart={() => {
              fadeAnim.setValue(0);
            }}
            onLoad={() => {
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }}
            onError={() => {
              setImageErrors(prev => ({ ...prev, [item._id]: true }));
            }}
          />
          {imageError && (
            <View style={styles.imageErrorContainer}>
              <FontAwesome5 name="image" size={20} color="#ccc" />
            </View>
          )}
        </View>
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
            <Text style={styles.emptyText}>لا توجد محادثات نشطة</Text>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    marginLeft: 14,
    marginRight: 0,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
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