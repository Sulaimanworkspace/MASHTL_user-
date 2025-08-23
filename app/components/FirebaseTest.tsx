import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import { Platform } from 'react-native';
import initializeFirebase from '../services/firebaseInit';
import { registerForPushNotificationsAsync } from '../services/notifications';

// Country data with flags and phone codes
const countries = [
  { name: 'Saudi Arabia', code: 'SA', phoneCode: '+966', flag: '🇸🇦' },
];

const FirebaseTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState<any | null>(null); // Changed to any as FirebaseAuthTypes is removed
  const [status, setStatus] = useState('Initializing Firebase...');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to Saudi Arabia
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize Firebase and notifications on component mount
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize Firebase first
        await initializeFirebase();
        
        // Initialize notifications for APNs support on iOS
        if (Platform.OS === 'ios') {
          console.log('📱 [NOTIFICATIONS] Initializing notifications for iOS APNs...');
          const token = await registerForPushNotificationsAsync();
          if (token) {
            console.log('✅ [NOTIFICATIONS] APNs token registered:', token);
          }
        }
        
        setStatus('Firebase and notifications initialized successfully - Ready to send code');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setStatus(`Initialization failed: ${errorMessage}`);
        Alert.alert('Initialization Error', errorMessage);
      }
    };

    initApp();
  }, []);

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.phoneCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Send Code
  const handleSendCode = async () => {
    try {
      setStatus('Sending code...');
      
      // Validate phone number
      if (!phoneNumber.trim()) {
        Alert.alert('Error', 'Please enter a phone number');
        setStatus('Please enter a phone number');
        return;
      }
      
      // Format phone number with selected country code
      let formattedPhone = phoneNumber.trim();
      
      // Remove leading zeros and add country code if not present
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+966${formattedPhone}`;
      }
      
      console.log('📤 [AUTH] Step 5: Sending SMS with OLD API');
      console.log('📤 [AUTH] Calling signInWithPhoneNumber with:', formattedPhone);
      
      // Use the same approach for both platforms (since Android works)
      console.log(`📱 [AUTH] ${Platform.OS} detected - using unified approach`);
      
      // Try APNs-enabled approach for iOS
      if (Platform.OS === 'ios') {
        console.log('📱 [AUTH] iOS detected - trying APNs-enabled approach');
        
        // Add a small delay to ensure APNs is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('📱 [AUTH] About to call signInWithPhoneNumber with APNs...');
        const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
        console.log('📱 [AUTH] signInWithPhoneNumber completed with APNs');
        
        console.log('✅ [AUTH] iOS SMS sent successfully!');
        setConfirm(confirmation);
        setStatus('SMS sent successfully!');
      } else {
        const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
        
        console.log(`✅ [AUTH] ${Platform.OS} SMS sent successfully!`);
        setConfirm(confirmation);
        setStatus('SMS sent successfully!');
      }
      
    } catch (error: any) {
      console.error('❌ [AUTH] Error sending SMS:', error);
      
      let errorMessage = 'Failed to send SMS';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Phone authentication is not enabled in Firebase Console';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      setStatus(errorMessage);
    }
  };

  // Handle Verify Code
  const handleVerifyCode = async () => {
    try {
      setStatus('Verifying code...');
      if (!confirm) {
        throw new Error('No confirmation available');
      }
      
      // Ensure Firebase is initialized
      await initializeFirebase(); // Ensure app is initialized for verification
      
      const result = await confirm.confirm(code);
      setStatus('Code verified successfully');
      Alert.alert('Success', 'Phone number verified!');
      
      // Log the user info
      if (result && result.user) {
        console.log('User:', {
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber
        });
      }
    } catch (error: any) {
      console.error('Firebase verification error:', error);
      const errorMessage = error?.message || error?.code || 'Unknown error occurred';
      setStatus(`Verification error: ${errorMessage}`);
      
      // More specific error messages
      let userMessage = 'Failed to verify code';
      if (error?.code === 'auth/invalid-verification-code') {
        userMessage = 'Invalid verification code. Please check and try again';
      } else if (error?.code === 'auth/code-expired') {
        userMessage = 'Verification code has expired. Please request a new one';
      } else if (error?.code === 'auth/too-many-requests') {
        userMessage = 'Too many attempts. Please try again later';
      } else if (error?.code === 'auth/network-request-failed') {
        userMessage = 'Network error. Please check your connection';
      }
      
      Alert.alert('Error', userMessage);
    }
  };

  // Handle country selection
  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>
      
      <View style={styles.inputContainer}>
        {/* Country Picker Button */}
        <TouchableOpacity 
          style={styles.countryPickerButton} 
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={styles.flagText}>{selectedCountry.flag}</Text>
          <Text style={styles.countryCodeText}>{selectedCountry.phoneCode}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {/* Phone Number Input */}
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
          disabled={!phoneNumber.trim()}
        />
      </View>

      {confirm && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          
          <Button
            title="Verify Code"
            onPress={handleVerifyCode}
            disabled={!code.trim()}
          />
        </View>
      )}

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowCountryPicker(false);
                setSearchQuery('');
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => handleCountrySelect(item)}
              >
                <Text style={styles.flagText}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryPhoneCode}>{item.phoneCode}</Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  status: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  flagText: {
    fontSize: 20,
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    margin: 20,
    fontSize: 16,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countryInfo: {
    flex: 1,
    marginLeft: 15,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  countryPhoneCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default FirebaseTest;