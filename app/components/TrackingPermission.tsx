import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';

interface TrackingPermissionProps {
  onPermissionResult?: (granted: boolean) => void;
}

const TrackingPermission: React.FC<TrackingPermissionProps> = ({ onPermissionResult }) => {
  useEffect(() => {
    const requestTrackingPermission = async () => {
      try {
        console.log('TrackingPermission: Requesting tracking permission...');
        
        if (Platform.OS === 'ios') {
          // Request tracking permission on iOS
          const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
          console.log('TrackingPermission: iOS permission status:', status);
          
          if (onPermissionResult) {
            onPermissionResult(status === TrackingTransparency.PermissionStatus.GRANTED);
          }
        } else if (Platform.OS === 'android') {
          // On Android, tracking is generally allowed by default
          console.log('TrackingPermission: Android - assuming permission granted');
          if (onPermissionResult) {
            onPermissionResult(true);
          }
        }
      } catch (error) {
        console.error('TrackingPermission: Error requesting permission:', error);
        // Fallback: assume permission granted
        if (onPermissionResult) {
          onPermissionResult(true);
        }
      }
    };

    requestTrackingPermission();
  }, [onPermissionResult]);

  // This component doesn't render anything visible
  // It just handles the permission request in the background
  return null;
};

export default TrackingPermission;
