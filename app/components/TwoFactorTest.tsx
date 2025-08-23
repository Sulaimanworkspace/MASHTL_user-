import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { firebasePhoneAuth } from '../services/firebasePhoneAuth';
import initializeFirebase from '../services/firebaseInit';
import auth from '@react-native-firebase/auth';

export default function TwoFactorTest() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPhone, setCurrentPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      await initializeFirebase();
      const currentUser = auth().currentUser;
      setTwoFactorEnabled(!!currentUser);
      if (currentUser?.phoneNumber) {
        setCurrentPhone(currentUser.phoneNumber);
        setPhoneNumber(currentUser.phoneNumber);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleEnable = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    setLoading(true);
    try {
      const result = await firebasePhoneAuth.sendVerificationCode(phoneNumber);
      if (result.success) {
        setCurrentPhone(phoneNumber);
        Alert.alert('Success', 'Verification code sent! Please check your SMS.');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      const result = await firebasePhoneAuth.verifyCode(verificationCode);
      if (result.success) {
        setTwoFactorEnabled(true);
        Alert.alert('Success', 'Phone number verified successfully!');
        setVerificationCode('');
        await checkStatus();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const result = await firebasePhoneAuth.signOut();
      if (result.success) {
        setTwoFactorEnabled(false);
        setCurrentPhone('');
        setPhoneNumber('');
        Alert.alert('Success', 'Signed out successfully!');
        await checkStatus();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const result = await firebasePhoneAuth.sendVerificationCode(currentPhone);
      if (result.success) {
        Alert.alert('Success', 'New verification code sent! Please check your SMS.');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>2FA Test Component</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {twoFactorEnabled ? 'Enabled' : 'Disabled'}
        </Text>
        {currentPhone && (
          <Text style={styles.phoneText}>Phone: {currentPhone}</Text>
        )}
      </View>

      {!twoFactorEnabled ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enable 2FA</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number (+966XXXXXXXXX)"
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={[styles.button, styles.enableButton]}
            onPress={handleEnable}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Enabling...' : 'Enable 2FA'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verify Code</Text>
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.button, styles.verifyButton]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.resendButton]}
            onPress={handleResend}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Resend Code</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.disableButton]}
            onPress={handleDisable}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Disable 2FA</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  enableButton: {
    backgroundColor: '#4CAF50',
  },
  verifyButton: {
    backgroundColor: '#2196F3',
  },
  resendButton: {
    backgroundColor: '#FF9800',
  },
  disableButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 