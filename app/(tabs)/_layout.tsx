import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import Colors from '../_colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          display: 'none', // This will hide the default tab bar
        },
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
      }}
    >
      <Tabs.Screen
        name="Home/index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FontAwesome5 name="home" size={size} color={color} solid />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: 'الطلبات',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FontAwesome5 name="clipboard-list" size={size} color={color} solid />
          ),
        }}
      />
      <Tabs.Screen
        name="chats/index"
        options={{
          title: 'المحادثات',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FontAwesome5 name="comments" size={size} color={color} solid />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FontAwesome5 name="cog" size={size} color={color} solid />
          ),
        }}
      />

    </Tabs>
  );
}