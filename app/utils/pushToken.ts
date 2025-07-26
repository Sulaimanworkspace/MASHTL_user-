// Check if we're in development mode (for reference only)
export const isDevelopment = __DEV__;

// Get push token - always use real Expo push token
export const getPushToken = async (): Promise<string | null> => {
  try {
    console.log('🚀 Getting real Expo push token');
    const Notifications = await import('expo-notifications');
    
    // Always use real Expo push token with the projectId
    const tokenResult = await Notifications.default.getExpoPushTokenAsync({
      projectId: '298f9159-3f1c-4cdb-97a8-8fc32fe63138' // Your actual EAS project ID
    });
    
    console.log('✅ Real push token generated:', tokenResult.data ? 'YES' : 'NO');
    return tokenResult.data;
  } catch (error) {
    console.error('❌ Error getting real push token:', error);
    console.log('🔄 No fallback - push notifications will not work');
    return null;
  }
};

// Default export
export default { getPushToken, isDevelopment }; 