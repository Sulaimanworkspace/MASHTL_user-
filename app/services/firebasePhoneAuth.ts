// Simple Firebase Phone Auth for SMS
import auth from '@react-native-firebase/auth';

// Basic auth instance getter
const getAuthInstance = () => {
  try {
    return auth();
  } catch (error) {
    console.error('❌ Error getting auth instance:', error);
    throw error;
  }
};

// Initialize recaptcha verifier for React Native
const initializeRecaptcha = async () => {
  // No need for reCAPTCHA initialization in the new API
  return true;
};

// Send verification code - Simple SMS only
const sendVerificationCode = async (phoneNumber: string) => {
  try {
    // Format phone number
    let formattedPhone = phoneNumber.trim()
      .replace(/^0+/, '') // Remove leading zeros
      .replace(/[^0-9]/g, ''); // Remove non-numeric characters
    
    // Ensure number starts with Saudi Arabia country code
    if (!formattedPhone.startsWith('966')) {
      formattedPhone = '966' + formattedPhone;
    }
    
    // Add the plus sign
    formattedPhone = '+' + formattedPhone;
    
    console.log('📱 Sending SMS to:', formattedPhone);
    
    // Send SMS and store confirmation result
    const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
    console.log('✅ SMS sent successfully');
    
    // Store confirmation result globally
    (global as any).confirmationResult = confirmation;
    
    return {
      success: true,
      message: 'SMS sent'
    };
  } catch (error: any) {
    console.error('❌ SMS send error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send SMS'
    };
  }
};

// Verify code
const verifyCode = async (verificationCode: string) => {
  try {
    console.log('🔐 Verifying code:', verificationCode);
    
    // Get the confirmation result from global storage
    const confirmationResult = (global as any).confirmationResult;
    if (!confirmationResult) {
      throw new Error('No confirmation result found. Please request a new code.');
    }
    
    // Confirm the verification code with Firebase
    const userCredential = await confirmationResult.confirm(verificationCode);
    
    // Clear the confirmation result after successful verification
    (global as any).confirmationResult = null;
    
    console.log('✅ Phone verification successful:', userCredential.user.phoneNumber);
    return {
      success: true,
      user: userCredential.user,
      message: 'Phone verification successful'
    };
  } catch (error: any) {
    console.error('❌ Error verifying code:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      return {
        success: false,
        message: 'Invalid verification code'
      };
    } else if (error.code === 'auth/code-expired') {
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      };
    } else {
      return {
        success: false,
        message: error.message || 'Failed to verify code'
      };
    }
  }
};

// Sign out
const signOut = async () => {
  try {
    console.log('🚪 Signing out user');
    
    // Clear stored confirmation result
    (global as any).confirmationResult = null;
    
    // Get auth instance and sign out
    const authInstance = await getAuthInstance();
    await authInstance.signOut();
    
    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error: any) {
    console.error('❌ Error signing out:', error);
    return {
      success: false,
      message: error.message || 'Failed to sign out'
    };
  }
};

// Get current user
const getCurrentUser = async (): Promise<any> => {
  const authInstance = await getAuthInstance();
  return authInstance.currentUser;
};

// Check if user is signed in
const isSignedIn = async (): Promise<boolean> => {
  const authInstance = await getAuthInstance();
  return !!authInstance.currentUser;
};

// Listen to auth state changes
const onAuthStateChanged = async (callback: (user: any) => void) => {
  console.log('🔐 Setting up auth state listener');
  const authInstance = await getAuthInstance();
  return authInstance.onAuthStateChanged((user: any) => {
    console.log('🔐 Auth state changed:', user ? 'User logged in' : 'User logged out');
    callback(user);
  });
};

// Export the firebasePhoneAuth object
export const firebasePhoneAuth = {
  sendVerificationCode,
  verifyCode,
  signOut,
  getCurrentUser,
  isSignedIn,
  onAuthStateChanged,
  initializeRecaptcha,
  getAuthInstance
};

export default firebasePhoneAuth; 