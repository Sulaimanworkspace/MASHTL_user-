import { FontAwesome5 } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../_colors';

export default function CustomFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const isActive = (route: string) => {
    // Special handling for Home
    if (route === '/(tabs)/Home') {
      return pathname === '/' || pathname === '/(tabs)/Home' || pathname === '/(tabs)/Home/index';
    }
    // For other tabs
    return pathname === route || pathname === `${route}/index`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigateTo('/(tabs)/Home')}
      >
        <FontAwesome5
          name="home"
          size={24}
          color={isActive('/(tabs)/Home') ? Colors.primary : Colors.secondary}
          solid={isActive('/(tabs)/Home')}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isActive('/(tabs)/Home') ? Colors.primary : Colors.secondary },
          ]}
        >
          الرئيسية
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigateTo('/(tabs)/orders')}
      >
        <FontAwesome5
          name="clipboard-list"
          size={24}
          color={isActive('/(tabs)/orders') ? Colors.primary : Colors.secondary}
          solid={isActive('/(tabs)/orders')}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isActive('/(tabs)/orders') ? Colors.primary : Colors.secondary },
          ]}
        >
          الطلبات
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigateTo('/(tabs)/chats')}
      >
        <FontAwesome5
          name="comments"
          size={24}
          color={isActive('/(tabs)/chats') ? Colors.primary : Colors.secondary}
          solid={isActive('/(tabs)/chats')}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isActive('/(tabs)/chats') ? Colors.primary : Colors.secondary },
          ]}
        >
          المحادثات
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigateTo('/(tabs)/settings')}
      >
        <FontAwesome5
          name="cog"
          size={24}
          color={isActive('/(tabs)/settings') ? Colors.primary : Colors.secondary}
          solid={isActive('/(tabs)/settings')}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isActive('/(tabs)/settings') ? Colors.primary : Colors.secondary },
          ]}
        >
          الإعدادات
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
}); 