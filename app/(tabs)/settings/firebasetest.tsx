import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FirebaseTest from '../../components/FirebaseTest';

function FirebaseTestScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FirebaseTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default FirebaseTestScreen;
