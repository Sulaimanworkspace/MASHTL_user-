import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { getUserData, getUserServiceOrders, getUnreadMessageCount } from '../../services/api';

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

  // Fetch chat orders (orders with farmers)
  const fetchChatOrders = async () => {
    try {
      const response = await getUserServiceOrders();
      if (response.success) {
        // Filter orders that have farmers (accepted orders)
        const ordersWithFarmers = response.data.filter((order: ChatOrder) => order.farmer);
        setChatOrders(ordersWithFarmers);
      }
    } catch (error) {
      console.error('Error fetching chat orders:', error);
    }
  };

  // Check authentication and redirect if not logged in
  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        try {
          const userData = await getUserData();
          if (!userData || !userData.name) {
            router.replace('/(tabs)/auth/login');
            return;
          }
          setIsLoggedIn(true);
          setIsLoading(false);
          await fetchChatOrders();
        } catch (error) {
          router.replace('/(tabs)/auth/login');
        }
      };
      checkAuthStatus();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChatOrders();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ChatOrder }) => (
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
      <Image
        source={item.farmer?.avatar ? { uri: item.farmer.avatar } : { uri: 'https://ui-avatars.com/api/?name=Farmer' }}
        style={styles.avatar}
      />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.name}>{item.farmer?.name || 'مزارع'}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString('ar-SA')}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || `طلب: ${item.serviceTitle}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
            <Text style={styles.emptyText}>لا توجد محادثات بعد</Text>
            <Text style={styles.emptySubtext}>ستظهر المحادثات هنا بعد قبول طلباتك من قبل المزارعين</Text>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
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