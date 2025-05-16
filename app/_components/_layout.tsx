import { Slot } from 'expo-router';
import { View } from 'react-native';

// This layout prevents the _components folder from being shown in tab navigation
// By using Slot, it only renders the component content without navigation elements
export default function ComponentsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
} 