import React from 'react';
import { StyleSheet, View, Modal, Text } from 'react-native';
import AnimatedSpinner from './AnimatedSpinner';
import { useSpinner } from '../contexts/SpinnerContext';

const GlobalSpinner: React.FC = () => {
  const { isVisible, message } = useSpinner();

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <AnimatedSpinner size={60} color="#4CAF50" />
        {message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginTop: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default GlobalSpinner;
