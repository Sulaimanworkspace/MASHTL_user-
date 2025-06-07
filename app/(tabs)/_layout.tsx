import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

// Define colors locally since the colors file was deleted
const Colors = {
  primary: '#2E8B57',
  secondary: '#666666',
  background: '#FFFFFF',
  lightGray: '#E0E0E0',
  white: '#FFFFFF',
  text: {
    primary: '#333333',
    secondary: '#666666'
  }
};



export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          marginBottom: Platform.OS === 'ios' ? 20 : 10,
          marginHorizontal: 10,
          borderRadius: 20,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          position: 'absolute',
          justifyContent: 'center',
        },
        tabBarItemStyle: {
          padding: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Home/index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: 'طلباتي',
          headerTitle: 'My Orderss',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FontAwesome5 name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats/index"
        options={{
          title: 'المحادثات',
          headerTitle: 'Chats',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FontAwesome5 name="comments" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'حسابي',
          headerTitle: 'Account Settings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FontAwesome5 name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}