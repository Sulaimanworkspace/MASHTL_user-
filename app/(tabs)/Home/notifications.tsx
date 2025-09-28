import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import Colors from '../../_colors';
import { getUserData, getUserNotifications, deleteNotification, markNotificationAsRead } from '../../services/api';
import { useSpinner } from '../../contexts/SpinnerContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { showSpinner, hideSpinner } = useSpinner();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  // Load notifications when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  // Mark all notifications as read when screen is focused and notifications are loaded
  useFocusEffect(
    useCallback(() => {
      const markAllAsRead = async () => {
        if (notifications.length > 0 && userId) {
          try {
            // Mark all unread notifications as read
            const unreadNotifications = notifications.filter(n => !n.isRead);
            if (unreadNotifications.length > 0) {
              console.log(`📖 Marking ${unreadNotifications.length} notifications as read`);
              
              // Mark all unread notifications as read
              for (const notification of unreadNotifications) {
                await markNotificationAsRead(notification._id, userId);
              }
              
              // Update local state to reflect read status immediately
              setNotifications(prev => 
                prev.map(n => ({ ...n, isRead: true }))
              );
              
              console.log('✅ All notifications marked as read');
            }
          } catch (error) {
            console.error('Error marking notifications as read:', error);
          }
        }
      };

      // Mark as read after notifications are loaded
      if (notifications.length > 0 && userId) {
        markAllAsRead();
      }
    }, [notifications.length, userId])
  );

  const loadNotifications = async () => {
    try {
      showSpinner('جاري تحميل الإشعارات...');
      const userData = await getUserData();
      if (!userData || !userData._id) {
        router.replace('/(tabs)/auth/login');
        return;
      }
      
      setUserId(userData._id);
      const response = await getUserNotifications(userData._id);
      
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      hideSpinner();
      Alert.alert('خطأ', 'فشل في تحميل الإشعارات');
    } finally {
      hideSpinner();
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId, userId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      console.log('✅ Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('خطأ', 'فشل في حذف الإشعار');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item._id)}
      >
        <FontAwesome5 name="times" size={16} color="#FF0000" />
      </TouchableOpacity>
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationText}>{item.message}</Text>
        <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
      </View>
      
      <View style={styles.notificationIcon}>
        <FontAwesome5 
          name={
            item.type === 'welcome' ? 'user-check' : 
            item.type === 'wallet' ? 'wallet' : 
            'bell'
          } 
          size={20} 
          color={
            item.type === 'wallet' ? '#666666' : Colors.primary
          } 
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Green Header Navigation Bar */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>الإشعارات</Text>
          </View>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="bell-slash" size={50} color="#CCCCCC" />
            <Text style={styles.emptyText}>لا توجد إشعارات</Text>
          </View>
        }
      />
    </View>
  );
}

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
    top: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333333',
    textAlign: 'right',
  },
  notificationText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'right',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
    textAlign: 'center',
  },
}); 