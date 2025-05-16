import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
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

// Tell Expo Router to skip the "screens" directory
export const unstable_settings = {
  // Ensure only specific routes are included in the tab navigation
  initialRouteName: 'index',  
  excludeRoute: (route: string) => {
    // Hide all routes that start with underscore
    if (route.startsWith('_')) return true;
    
    // Only include the specific tabs we want
    const allowedRoutes = ['index', 'orders/index', 'screens', 'stores/index', 'settings/index'];
    return !allowedRoutes.includes(route);
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
      {/* Hide _components from tab navigation */}
      <Tabs.Screen
        name="_components"
        options={{
          tabBarItemStyle: { display: 'none', width: 0, height: 0 },
          tabBarButton: () => null,
        }}
      />
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: 'Orders',
          headerTitle: 'My Orders',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="screens"
        options={{
          title: 'Offers',
          headerTitle: 'Special Offers',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="percentage" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stores/index"
        options={{
          title: 'Stores',
          headerTitle: 'Garden Shops',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="store" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          headerTitle: 'Account Settings',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}