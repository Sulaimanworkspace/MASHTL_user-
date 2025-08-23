import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import app from '@react-native-firebase/app';

const FirebaseAuthTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [status, setStatus] = useState('');

  // Initialize Firebase on component mount
  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Check if Firebase is already initialized
        try {
          app.app();
          setStatus('Firebase already initialized');
        } catch (error) {
          // Initialize Firebase with minimal config
          app.initializeApp({
            apiKey: "AIzaSyBx0p3xx74O-mqwsSha-V0v-SMWQkwHegU",
            projectId: "deenmuapp-2b18c",
            appId: "1:1033020474154:ios:3034731506a84e39e49453",
            messagingSenderId: "1033020474154"
          });
          setStatus('Firebase initialized');
        }
      } catch (error) {
        setStatus(`Firebase init error: ${error.message}`);
        Alert.alert('Error', error.message);
      }
    };

    initFirebase();
  }, []);

  // Handle Send Code
  const handleSendCode = async () => {
    try {
      setStatus('Sending code...');
      
      // Format phone number
      let formattedPhone = phoneNumber.trim()
        .replace(/^0+/, '')
        .replace(/[^0-9]/g, '');
      
      if (!formattedPhone.startsWith('966')) {
        formattedPhone = '966' + formattedPhone;
      }
      formattedPhone = '+' + formattedPhone;
      
      setStatus(`Sending code to ${formattedPhone}`);
      
      // Send code
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      setConfirm(confirmation);
      setStatus('Code sent successfully');
      Alert.alert('Success', 'Verification code sent!');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      Alert.alert('Error', error.message);
    }
  };

  // Handle Verify Code
  const handleVerifyCode = async () => {
    try {
      setStatus('Verifying code...');
      if (!confirm) {
        throw new Error('No confirmation available');
      }
      
      const result = await confirm.confirm(code);
      setStatus('Code verified successfully');
      Alert.alert('Success', 'Phone number verified!');
      
      // Log the user info
      if (result.user) {
        console.log('User:', {
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber
        });
      }
    } catch (error) {
      setStatus(`Verification error: ${error.message}`);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Phone number (e.g., 500600945)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Button
          title="Send Code"
          onPress={handleSendCode}
        />
      </View>

      {confirm && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <Button
            title="Verify Code"
            onPress={handleVerifyCode}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  status: {
    marginBottom: 20,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default FirebaseAuthTest;
