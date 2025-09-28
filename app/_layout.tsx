import { Stack } from 'expo-router';
import { StyleSheet, View, I18nManager } from 'react-native';
import { SpinnerProvider } from './contexts/SpinnerContext';
import GlobalSpinner from './components/GlobalSpinner';

export default function RootLayout() {
  // Force LTR layout on Android to prevent RTL mirroring
  if (I18nManager.isRTL) {
    I18nManager.forceRTL(false);
    I18nManager.allowRTL(false);
  }

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