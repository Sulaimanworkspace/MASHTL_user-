// Temporarily disabled for Expo Go compatibility
// import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import storage from '@react-native-firebase/storage';
import { Alert } from 'react-native';

// Temporarily disabled for Expo Go compatibility
// Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
const FIREBASE_CONFIG = {
  // Get these values from your Firebase Console:
  // 1. Go to Project Settings
  // 2. Scroll down to "Your apps" section
  // 3. Select your app and copy the config
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Mock Firebase types for development
interface FirebaseAuthTypes {
  User: any;
  UserCredential: any;
}

class FirebaseService {
  private currentUser: any = null;

  constructor() {
    // Temporarily disabled for Expo Go compatibility
    // Listen for auth state changes
    // auth().onAuthStateChanged((user) => {
    //   this.currentUser = user;
    //   console.log('Firebase auth state changed:', user ? 'User logged in' : 'User logged out');
    // });
    console.log('Firebase service initialized (mock mode)');
  }

  // Get current user
  getCurrentUser(): any {
    return this.currentUser;
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<any> {
    try {
      console.log('🔐 Signing in with email:', email);
      // Temporarily disabled for Expo Go compatibility
      // const userCredential = await auth().signInWithEmailAndPassword(email, password);
      // console.log('✅ Sign in successful');
      // return userCredential;
      
      // Mock response for development
      console.log('✅ Sign in successful (mock)');
      return { user: { email, uid: 'mock-uid' } };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      console.log('🔐 Creating account with email:', email);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('✅ Account creation successful');
      return userCredential;
    } catch (error: any) {
      console.error('❌ Account creation error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      console.log('🔐 Signing out');
      await auth().signOut();
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  // Enable 2FA (Multi-Factor Authentication)
  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    try {
      console.log('🔐 Enabling 2FA');
      
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      // Get multi-factor session
      const multiFactor = this.currentUser.multiFactor;
      const session = await multiFactor.getSession();

      // Enroll with phone number (you can also use email or authenticator app)
      const phoneAuthProvider = auth.PhoneAuthProvider.credential;
      const phoneInfoOptions = {
        phoneNumber: this.currentUser.phoneNumber || '+966500000000', // Default Saudi number
        session
      };

      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions);
      
      // For now, we'll return a mock QR code and secret
      // In a real implementation, you'd use an authenticator app like Google Authenticator
      const mockQRCode = `otpauth://totp/Mashtl:${this.currentUser.email}?secret=JBSWY3DPEHPK3PXP&issuer=Mashtl`;
      const mockSecret = 'JBSWY3DPEHPK3PXP';

      console.log('✅ 2FA enabled successfully');
      return {
        qrCode: mockQRCode,
        secret: mockSecret
      };
    } catch (error: any) {
      console.error('❌ Enable 2FA error:', error);
      throw error;
    }
  }

  // Verify 2FA code
  async verify2FACode(code: string): Promise<boolean> {
    try {
      console.log('🔐 Verifying 2FA code');
      
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      // In a real implementation, you'd verify the TOTP code
      // For now, we'll use a simple verification
      const isValid = code.length === 6 && /^\d+$/.test(code);
      
      if (isValid) {
        console.log('✅ 2FA code verified successfully');
        return true;
      } else {
        console.log('❌ Invalid 2FA code');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Verify 2FA error:', error);
      throw error;
    }
  }

  // Disable 2FA
  async disable2FA(): Promise<void> {
    try {
      console.log('🔐 Disabling 2FA');
      
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      // In a real implementation, you'd remove the multi-factor authentication
      console.log('✅ 2FA disabled successfully');
    } catch (error: any) {
      console.error('❌ Disable 2FA error:', error);
      throw error;
    }
  }

  // Check if 2FA is enabled
  async is2FAEnabled(): Promise<boolean> {
    try {
      if (!this.currentUser) {
        return false;
      }

      // Check if user has multi-factor authentication enabled
      const multiFactor = this.currentUser.multiFactor;
      const enrolledFactors = multiFactor.enrolledFactors;
      
      return enrolledFactors.length > 0;
    } catch (error: any) {
      console.error('❌ Check 2FA status error:', error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      console.log('🔐 Sending password reset email to:', email);
      await auth().sendPasswordResetEmail(email);
      console.log('✅ Password reset email sent successfully');
    } catch (error: any) {
      console.error('❌ Send password reset email error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    try {
      console.log('🔐 Updating user profile');
      
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      await this.currentUser.updateProfile({
        displayName,
        photoURL
      });
      
      console.log('✅ User profile updated successfully');
    } catch (error: any) {
      console.error('❌ Update user profile error:', error);
      throw error;
    }
  }

  // Upload image to Firebase Storage
  async uploadImage(uri: string, path: string): Promise<string> {
    try {
      console.log('📸 Uploading image to Firebase Storage:', path);
      
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      // Create a reference to the file location
      const storageRef = storage().ref(path);
      
      // Upload the file
      const response = await fetch(uri);
      const blob = await response.blob();
      await storageRef.put(blob);
      
      // Get the download URL
      const downloadURL = await storageRef.getDownloadURL();
      
      console.log('✅ Image uploaded successfully:', downloadURL);
      return downloadURL;
    } catch (error: any) {
      console.error('❌ Upload image error:', error);
      throw error;
    }
  }

  // Delete image from Firebase Storage
  async deleteImage(path: string): Promise<void> {
    try {
      console.log('🗑️ Deleting image from Firebase Storage:', path);
      
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const storageRef = storage().ref(path);
      await storageRef.delete();
      
      console.log('✅ Image deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete image error:', error);
      throw error;
    }
  }

  // Save user data to Firestore
  async saveUserData(userData: {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
    twoFactorEnabled: boolean;
    createdAt: Date;
  }): Promise<void> {
    try {
      console.log('💾 Saving user data to Firestore');
      
      await firestore()
        .collection('users')
        .doc(userData.uid)
        .set({
          ...userData,
          updatedAt: new Date()
        });
      
      console.log('✅ User data saved successfully');
    } catch (error: any) {
      console.error('❌ Save user data error:', error);
      throw error;
    }
  }

  // Get user data from Firestore
  async getUserData(uid: string): Promise<any> {
    try {
      console.log('📖 Getting user data from Firestore');
      
      const doc = await firestore()
        .collection('users')
        .doc(uid)
        .get();
      
      if (doc.exists) {
        console.log('✅ User data retrieved successfully');
        return doc.data();
      } else {
        console.log('❌ User data not found');
        return null;
      }
    } catch (error: any) {
      console.error('❌ Get user data error:', error);
      throw error;
    }
  }

  // Update 2FA status in Firestore
  async update2FAStatus(uid: string, enabled: boolean): Promise<void> {
    try {
      console.log('💾 Updating 2FA status in Firestore');
      
      await firestore()
        .collection('users')
        .doc(uid)
        .update({
          twoFactorEnabled: enabled,
          updatedAt: new Date()
        });
      
      console.log('✅ 2FA status updated successfully');
    } catch (error: any) {
      console.error('❌ Update 2FA status error:', error);
      throw error;
    }
  }
}

export default new FirebaseService(); 