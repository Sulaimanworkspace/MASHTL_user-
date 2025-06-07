import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../_colors';

export default function NotificationsScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>الإشعارات</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList}>
        {/* Example Notification Item */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationIcon}>
            <FontAwesome5 name="bell" size={20} color={Colors.primary} />
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>عنوان الإشعار</Text>
            <Text style={styles.notificationText}>محتوى الإشعار يظهر هنا</Text>
            <Text style={styles.notificationTime}>منذ 5 دقائق</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
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
    marginRight: 12,
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
}); 