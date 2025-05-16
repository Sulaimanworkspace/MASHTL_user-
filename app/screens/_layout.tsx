import { Stack } from 'expo-router';
import { Slot } from 'expo-router';
import { View } from 'react-native';

// This is a minimal layout that won't interfere with tab visibility
// but provides a hook for screen title customization
export default function ScreenLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}

// export default function ScreenLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: true }}>
//       <Stack.Screen name="home/index" />
//       <Stack.Screen name="orders/index" />
//       <Stack.Screen name="offers/index" />
//       <Stack.Screen name="stores/index" />
//       <Stack.Screen name="settings/index" />
//     </Stack>
//   );
// } 