// Firebase Initialization - Using OLD Firebase API for React Native Firebase v20+
import firebase from '@react-native-firebase/app';
import { Platform } from 'react-native';

// Firebase configuration with APNs support
const firebaseConfig = {
  apiKey: "AIzaSyBx0p3xx74O-mqwsSha-V0v-SMWQkwHegU",
  projectId: "deenmuapp-2b18c",
  databaseURL: "https://deenmuapp-2b18c-default-rtdb.firebaseio.com",
  storageBucket: "deenmuapp-2b18c.firebasestorage.app",
  messagingSenderId: "1033020474154",
  appId: "1:1033020474154:ios:3034731506a84e39e49453"
};

// iOS-specific configuration for APNs
const iosConfig = Platform.OS === 'ios' ? {
  ...firebaseConfig,
  // Enable APNs for phone authentication
  isDevelopment: __DEV__,
  // Add any iOS-specific settings here
} : firebaseConfig;

// Initialize Firebase with NEW API for React Native Firebase v23+
let app: any;
let isInitializing = false;

export default async function initializeFirebase(callback?: (app: any) => void) {
  console.log('🚀 [FIREBASE INIT] Starting Firebase initialization with OLD API...');
  console.log('🚀 [FIREBASE INIT] Current apps count:', firebase.apps.length);
  console.log(' [FIREBASE INIT] Is initializing:', isInitializing);
  
  try {
    // If already initializing, wait
    if (isInitializing) {
      console.log('⏳ [FIREBASE INIT] Already initializing, waiting...');
      while (isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      app = firebase.app();
      if (callback) callback(app);
      return app;
    }

    // Check if app already exists and is properly initialized
    if (firebase.apps.length > 0) {
      console.log('🔄 [FIREBASE INIT] Apps already exist, checking if properly initialized...');
      try {
        app = firebase.app();
        console.log('✅ [FIREBASE INIT] Existing app found:', {
          name: app?.name,
          options: app?.options ? 'Present' : 'Missing'
        });
        
        // If app exists but has no options, we need to reinitialize
        if (!app?.options) {
          console.log('⚠️ [FIREBASE INIT] App exists but has no options, reinitializing...');
          throw new Error('App exists but not properly initialized');
        }
        
        if (callback) callback(app);
        return app;
      } catch (existingAppError: any) {
        console.log('⚠️ [FIREBASE INIT] Existing app error, will reinitialize:', existingAppError.message);
      }
    }

    // Start fresh initialization
    console.log(' [FIREBASE INIT] Starting fresh initialization...');
    isInitializing = true;
    
    console.log('🔧 [FIREBASE INIT] About to call initializeApp with config...');
    console.log('🔧 [FIREBASE INIT] Config:', {
      apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId
    });
    
    try {
      console.log('🎯 [FIREBASE INIT] Calling initializeApp with OLD API...');
      
      // Initialize with OLD API and iOS-specific config
      const configToUse = Platform.OS === 'ios' ? iosConfig : firebaseConfig;
      app = firebase.initializeApp(configToUse);
      
      console.log('✅ [FIREBASE INIT] initializeApp called successfully!');
      console.log('✅ [FIREBASE INIT] App object created:', !!app);
      
      // Wait for the app to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the app was created properly
      console.log('🔍 [FIREBASE INIT] Verifying app initialization...');
      console.log('🔍 [FIREBASE INIT] Apps count after init:', firebase.apps.length);
      
      // Get the app again to ensure it's properly loaded
      app = firebase.app();
      console.log('✅ [FIREBASE INIT] App retrieved successfully:', !!app);
      
      console.log('✅ [FIREBASE INIT] App details after delay:', {
        name: app?.name,
        options: app?.options ? 'Present' : 'Missing',
        appId: app?.options?.appId
      });
      
      //  CHECK FIREBASE OPTIONS AND API KEY
      console.log(' [FIREBASE OPTIONS] === FIREBASE OPTIONS CHECK ===');
      if (app?.options) {
        console.log('✅ [FIREBASE OPTIONS] Options present:', {
          apiKey: app.options.apiKey ? 'Present' : 'Missing',
          projectId: app.options.projectId,
          appId: app.options.appId,
          storageBucket: app.options.storageBucket,
          messagingSenderId: app.options.messagingSenderId
        });
      } else {
        console.log('❌ [FIREBASE OPTIONS] No options found!');
        throw new Error('Firebase app initialized but options are missing');
      }
      
      console.log(`🔥 [FIREBASE INIT] Firebase initialized successfully for ${Platform.OS}`);
      if (callback) {
        console.log('📞 [FIREBASE INIT] Calling callback...');
        callback(app);
      }
      
      console.log('🎉 [FIREBASE INIT] Initialization completed successfully!');
      return app;
      
    } catch (error) {
      console.error('❌ [FIREBASE INIT] Firebase initialization error:', error);
      console.error('❌ [FIREBASE INIT] Error details:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack?.substring(0, 200) + '...'
      });
      throw error;
    } finally {
      console.log('🏁 [FIREBASE INIT] Initialization process completed');
      isInitializing = false;
    }
    
  } catch (error) {
    console.error('💥 [FIREBASE INIT] Critical initialization error:', error);
    console.error('💥 [FIREBASE INIT] Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.substring(0, 200) + '...'
    });
    isInitializing = false;
    throw error;
  }
}