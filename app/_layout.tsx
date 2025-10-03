import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SpinnerProvider } from './contexts/SpinnerContext';
import GlobalSpinner from './components/GlobalSpinner';
import TrackingPermission from './components/TrackingPermission';

export default function RootLayout() {

  return (
    <SpinnerProvider>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <GlobalSpinner />
        <TrackingPermission />
      </View>
    </SpinnerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});