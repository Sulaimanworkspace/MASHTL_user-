import React from 'react';
import { StyleSheet, View, Modal, Text } from 'react-native';
import AnimatedSpinner from './AnimatedSpinner';

interface ScreenSpinnerProps {
  visible: boolean;
  message?: string;
}

const ScreenSpinner: React.FC<ScreenSpinnerProps> = ({ 
  visible, 
  message = "جاري التحميل..." 
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.spinnerContainer}>
          <AnimatedSpinner size={60} color="#4CAF50" />
          {message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
        </View>
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
  spinnerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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

export default ScreenSpinner;
