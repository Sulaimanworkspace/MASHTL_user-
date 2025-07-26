import React from 'react';
import { View, StyleSheet } from 'react-native';
import PaymentTest from '../../components/PaymentTest';

const PaymentTestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <PaymentTest />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default PaymentTestScreen; 