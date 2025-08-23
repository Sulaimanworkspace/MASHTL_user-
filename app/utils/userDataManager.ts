import { getUserData, refreshUserDataFromServer, storeUserData } from '../services/api';

export const ensureFreshUserData = async () => {
  try {
    const localUserData = await getUserData();
    
    if (localUserData && localUserData._id) {
      console.log('🔄 Ensuring fresh user data...');
      
      // Only try to refresh if we have a token
      if (localUserData.token) {
        try {
          const freshUserData = await refreshUserDataFromServer();
          if (freshUserData && freshUserData.token) {
            console.log('✅ User data refreshed successfully');
            return freshUserData;
          } else {
            console.log('⚠️ Profile refresh returned data without token, using local data');
            return localUserData;
          }
        } catch (error) {
          console.log('⚠️ Could not refresh user data, using local data:', error);
          // Don't fail completely, just use local data
          return localUserData;
        }
      } else {
        console.log('⚠️ No token available for profile refresh');
        return localUserData;
      }
    }
    
    return localUserData;
  } catch (error) {
    console.error('❌ Error ensuring fresh user data:', error);
    return null;
  }
};

export const getUserDataWithLocation = async () => {
  try {
    const userData = await ensureFreshUserData();
    
    if (userData && userData.location && userData.location.address) {
      console.log('📍 User location found:', userData.location.address);
      return userData;
    } else {
      console.log('📍 No location data found for user');
      return userData;
    }
  } catch (error) {
    console.error('❌ Error getting user data with location:', error);
    return null;
  }
};

// Default export
export default {
  ensureFreshUserData,
  getUserDataWithLocation
}; 