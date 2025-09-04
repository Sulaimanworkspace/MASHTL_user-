import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../_colors';
import { getUserData, updateUserLocation, storeUserData, refreshUserDataFromServer } from '../services/api';
import { ensureFreshUserData } from '../utils/userDataManager';

const { width, height } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSaved: (location: LocationData) => void;
}

export default function LocationPickerModal({ 
  visible, 
  onClose, 
  onLocationSaved 
}: LocationPickerModalProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (visible) {
      // Load saved location from AsyncStorage
      loadSavedLocation();
    }
  }, [visible]);

  const loadSavedLocation = async () => {
    try {
      await refreshUserDataFromServer(); // Ensure latest user data
      const userData = await getUserData();
      console.log('🔍 LocationPickerModal - Loading user data:', userData);
      
      if (userData && userData.location && userData.location.address && userData.location.latitude && userData.location.longitude) {
        console.log('✅ Valid location found:', userData.location);
        setCurrentLocation({
          latitude: userData.location.latitude,
          longitude: userData.location.longitude,
          address: userData.location.address,
          city: userData.location.city || 'الرياض',
        });
      } else {
        console.log('❌ No valid location found for user');
        setCurrentLocation(null);
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
      setCurrentLocation(null);
    }
  };



  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        const address = `${location.street || ''} ${location.district || ''}`.trim();
        const city = location.city || 'الرياض';
        
        return {
          address: address || 'الموقع الحالي',
          city: city,
        };
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
    
    return {
      address: 'الموقع الحالي',
      city: 'الرياض',
    };
  };

  const handleUseCurrentLocation = async () => {
    // Open Google Maps picker to update location
    handleOpenGoogleMaps();
  };

  const handleOpenGoogleMaps = () => {
    // Navigate to the in-app Google Maps screen
    router.push('/(tabs)/Home/map-picker');
    onClose(); // Close the modal
  };

  // Refresh location when modal becomes visible again
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        loadSavedLocation();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={["#4CAF50", "#102811"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.headerContent}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>اختر موقعك</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome5 name="times" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Current Location Section */}
          {currentLocation ? (
            <View style={styles.currentLocationSection}>
              <Text style={styles.sectionTitle}>الموقع الحالي</Text>
              <TouchableOpacity
                style={styles.locationCard}
                onPress={handleUseCurrentLocation}
                disabled={saving}
              >
                <View style={styles.locationCardContent}>
                  <FontAwesome5 name="map-marker-alt" size={20} color={Colors.primary} />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationAddress}>{currentLocation.address}</Text>
                    <Text style={styles.locationCity}>{currentLocation.city}</Text>
                  </View>
                  {saving ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <FontAwesome5 name="check-circle" size={20} color={Colors.primary} />
                  )}
                </View>
              </TouchableOpacity>

            </View>
          ) : (
            <View style={styles.noLocationSection}>
              <FontAwesome5 name="location-arrow" size={40} color="#ccc" />
              <Text style={styles.noLocationText}>لا يمكن تحديد الموقع الحالي</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadSavedLocation}>
                <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Map Selection Option */}
          <View style={styles.mapSelectionSection}>
            <Text style={styles.sectionTitle}>اختر من الخريطة</Text>
            <TouchableOpacity
              style={styles.mapSelectionCard}
              onPress={handleOpenGoogleMaps}
              activeOpacity={0.7}
            >
              <View style={styles.mapSelectionContent}>
                <FontAwesome5 name="map-marked-alt" size={24} color={Colors.primary} />
                <View style={styles.mapSelectionTextContainer}>
                  <Text style={styles.mapSelectionTitle}>حدد من الخريطة</Text>
                  <Text style={styles.mapSelectionSubtitle}>اختر موقعك بدقة من خرائط جوجل</Text>
                </View>
                <FontAwesome5 name="chevron-left" size={16} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  currentLocationSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'right',
  },
  locationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    marginBottom: 5,
  },
  locationCity: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  currentLocationHint: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  noLocationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginBottom: 30,
  },
  noLocationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mapSelectionSection: {
    flex: 1,
  },
  mapSelectionCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  mapSelectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapSelectionTextContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  mapSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'right',
    marginBottom: 5,
  },
  mapSelectionSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'right',
    opacity: 0.8,
  },
}); 