import React from 'react';
import { View, StyleSheet } from 'react-native';
import APITestRunner from '../../components/APITestRunner';

const APITestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <APITestRunner />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default APITestScreen; 