import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { updateUserLocation, getUserData, storeUserData, refreshUserDataFromServer } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Global refresh trigger for location updates
export const triggerLocationRefresh = () => {
  // This will be used by other components to know when to refresh
  console.log('🔄 Global location refresh triggered');
  // You can add event emitter or other global state management here
};

export default function MapPicker() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 24.7136,
    longitude: 46.6753,
    address: 'الرياض, المملكة العربية السعودية',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false); // Prevent duplicate updates
  const [locationPermission, setLocationPermission] = useState(false);

  // Refresh user data on mount to ensure latest location
  useEffect(() => {
    const refreshLocation = async () => {
      try {
        console.log('🔄 Refreshing user data on mount to get latest location...');
        await refreshUserDataFromServer();
        console.log('✅ User data refreshed on mount');
      } catch (error) {
        console.log('⚠️ Could not refresh user data on mount:', error);
      }
    };
    
    refreshLocation();
  }, []);

  // Refresh location data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshLocationOnFocus = async () => {
        try {
          console.log('🔄 Refreshing location data on screen focus...');
          await refreshUserDataFromServer();
          console.log('✅ Location data refreshed on focus');
        } catch (error) {
          console.log('⚠️ Could not refresh location data on focus:', error);
        }
      };
      
      refreshLocationOnFocus();
    }, [])
  );

  // Remove auto-request on mount, only use button
  // useEffect(() => {
  //   requestLocationPermission();
  // }, []);

  const requestLocationPermission = async () => {
    try {
      console.log('🔍 Requesting location permission...');
      
      // Request permission - this will show the Apple default modal
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        console.log('✅ Location permission granted');
        setLocationPermission(true);
        
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        console.log('📍 Current location:', location.coords);
        
        // Update the map with current location and auto-confirm
        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'SET_CURRENT_LOCATION_AND_CONFIRM',
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }));
        }
      } else {
        console.log('❌ Location permission denied');
        setLocationPermission(false);
        Alert.alert(
          'إذن الموقع',
          'نحتاج إلى إذن الموقع لعرض موقعك على الخريطة',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'إعادة المحاولة', onPress: requestLocationPermission }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('خطأ', 'حدث خطأ في الوصول إلى الموقع');
    }
  };

  // Using OpenStreetMap with current location and user pin
  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html { margin: 0; padding: 0; height: 100%; font-family: Arial, sans-serif; }
        #map { height: 100vh; width: 100%; touch-action: manipulation; }
        .info-card { position: absolute; top: 20px; left: 20px; right: 20px; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000; text-align: right; }
        .info-title { font-weight: bold; color: #333; margin-bottom: 5px; font-size: 14px; }
        .info-address { color: #666; font-size: 13px; }
        .confirm-btn { position: absolute; bottom: 30px; left: 20px; right: 20px; background: #2E8B57; color: white; border: none; padding: 15px; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; z-index: 1000; }
        .loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; text-align: center; z-index: 2000; }
                 .user-marker { background-color: #2196F3; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
         .selected-marker { background-color: #4CAF50; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
         .leaflet-control-attribution { display: none !important; }
         @keyframes pulse { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; } 50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.3; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; } }
      </style>
    </head>
    <body>
      <div id="loading" class="loading"><div>جاري تحميل الخريطة...</div></div>
      <div class="info-card"><div class="info-title">الموقع المحدد:</div><div class="info-address" id="address">اضغط على الخريطة لتحديد الموقع أو استخدم زر الموقع الحالي</div></div>
      <div id="map"></div>
      <button class="confirm-btn" onclick="confirmLocation()">تأكيد الموقع</button>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        let map;
        let selectedMarker;
        let userLocationMarker;
        let currentLat = 24.7136;
        let currentLng = 46.6753;
        let currentAddress = "اضغط على الخريطة لتحديد الموقع أو استخدم زر الموقع الحالي";
        let locationSelected = false;
        function hideLoading() { const loading = document.getElementById('loading'); if (loading) { loading.style.display = 'none'; } }
        function updateAddress(address) { document.getElementById('address').textContent = address; currentAddress = address; }
        function initMap() {
          try {
            hideLoading();
            map = L.map('map', { zoomControl: true, scrollWheelZoom: true, doubleClickZoom: true, boxZoom: false, keyboard: false, dragging: true, touchZoom: true, tap: true }).setView([currentLat, currentLng], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: false, maxZoom: 19, minZoom: 8, updateWhenIdle: true, updateWhenZooming: false }).addTo(map);
            map.on('click', function(e) { updateSelectedLocation(e.latlng.lat, e.latlng.lng); });
          } catch (error) { console.error('Map initialization error:', error); document.getElementById('loading').innerHTML = '<div>خطأ في تحميل الخريطة</div>'; }
        }
        function updateSelectedLocation(lat, lng) {
          currentLat = lat; currentLng = lng; locationSelected = true;
          if (selectedMarker) { map.removeLayer(selectedMarker); }
          const selectedIcon = L.divIcon({ className: 'selected-marker', iconSize: [30, 30], iconAnchor: [15, 15] });
          selectedMarker = L.marker([lat, lng], { icon: selectedIcon, draggable: true }).addTo(map);
          selectedMarker.on('dragend', function(e) { const position = e.target.getLatLng(); updateSelectedLocation(position.lat, position.lng); });
          reverseGeocode(lat, lng);
        }
        function showUserLocation(lat, lng) {
          if (userLocationMarker) { map.removeLayer(userLocationMarker); }
          const userIcon = L.divIcon({ className: 'user-marker', iconSize: [32, 32], iconAnchor: [16, 32], html: '<div style="width:32px;height:32px;position:relative;"><svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="#2196F3" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="white"/><circle cx="16" cy="16" r="2" fill="#2196F3"/></svg><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:24px;height:24px;border:2px solid rgba(33,150,243,0.3);border-radius:50%;animation:pulse 1.5s infinite;"></div></div>' });
          userLocationMarker = L.marker([lat, lng], { icon: userIcon, draggable: false }).addTo(map);
          map.flyTo([lat, lng], 16, { duration: 0.8, easeLinearity: 0.25 });
          console.log('User location marker added at:', lat, lng);
        }
        function reverseGeocode(lat, lng) {
          try {
            fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}&accept-language=ar\`)
              .then(response => response.json())
              .then(data => { 
                if (data && data.display_name) {
                  // Check if location is in Saudi Arabia
                  if (data.display_name.includes('السعودية') || data.display_name.includes('Saudi Arabia')) {
                    updateAddress(data.display_name);
                  } else {
                    // Location is outside Saudi Arabia, use default address
                    updateAddress('موقع خارج المملكة العربية السعودية - سيتم استخدام موقع الرياض');
                    // Reset to Riyadh coordinates
                    setTimeout(function() {
                      updateSelectedLocation(24.7136, 46.6753);
                    }, 2000);
                  }
                } else { 
                  updateAddress('موقع محدد على الخريطة'); 
                }
              })
              .catch(error => { console.error('Geocoding error:', error); updateAddress('موقع محدد على الخريطة'); });
          } catch (error) { updateAddress('موقع محدد على الخريطة'); }
        }
        function setLocationFromNative(lat, lng) { 
          showUserLocation(lat, lng); 
          // Automatically select the current location
          updateSelectedLocation(lat, lng);
        }
        function confirmLocation() {
          if (!locationSelected) { return; }
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOCATION_SELECTED', latitude: currentLat, longitude: currentLng, address: currentAddress }));
          } catch (error) { console.error('Error sending message:', error); }
        }
        document.addEventListener('DOMContentLoaded', function() { initMap(); });
        window.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'SET_CURRENT_LOCATION') {
              setLocationFromNative(data.latitude, data.longitude);
            } else if (data.type === 'SET_CURRENT_LOCATION_AND_CONFIRM') {
              setLocationFromNative(data.latitude, data.longitude);
              // Show feedback that location will be auto-confirmed
              updateAddress('جاري تحديد موقعك الحالي...');
              // Auto-confirm after a short delay
              setTimeout(function() {
                confirmLocation();
              }, 1500);
            }
          } catch (error) { console.error('Error parsing message:', error); }
        });
        window.onerror = function(msg, url, line, col, error) { console.error('JavaScript error:', msg, url, line, col, error); return false; };
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'LOCATION_SELECTED') {
        // Prevent duplicate location updates
        if (isUpdatingLocation) {
          console.log('📍 Location update already in progress, skipping...');
          return;
        }
        
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
        });
        
        setIsLoading(true);
        setIsUpdatingLocation(true);
        
        // Add timeout to prevent stuck state
        const updateTimeout = setTimeout(() => {
          if (isUpdatingLocation) {
            console.log('⚠️ Location update timeout, resetting state');
            setIsUpdatingLocation(false);
            setIsLoading(false);
          }
        }, 30000); // 30 second timeout
        
        // Add slight delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Save location to backend and update local storage
        const userData = await getUserData();
        if (userData && userData._id) {
          // Extract city from address or default to Riyadh
          let city = 'الرياض';
          if (data.address) {
            // Check if address contains Saudi Arabia indicators
            const isSaudiArabia = data.address.includes('السعودية') || 
                                  data.address.includes('Saudi Arabia') ||
                                  data.address.includes('الرياض') ||
                                  data.address.includes('Riyadh');
            
            if (isSaudiArabia) {
              // Extract city from address
              const addressParts = data.address.split(',');
              for (const part of addressParts) {
                const trimmed = part.trim();
                if (trimmed.includes('الرياض') || trimmed.includes('Riyadh')) {
                  city = 'الرياض';
                  break;
                } else if (trimmed.includes('جدة') || trimmed.includes('Jeddah')) {
                  city = 'جدة';
                  break;
                } else if (trimmed.includes('الدمام') || trimmed.includes('Dammam')) {
                  city = 'الدمام';
                  break;
                }
              }
            }
          }

          // Use default Riyadh coordinates if user is not in Saudi Arabia
          let finalLatitude = data.latitude;
          let finalLongitude = data.longitude;
          let finalAddress = data.address;
          
          if (!data.address.includes('السعودية') && !data.address.includes('Saudi Arabia')) {
            // User is not in Saudi Arabia, use default Riyadh coordinates
            finalLatitude = 24.7136;
            finalLongitude = 46.6753;
            finalAddress = 'الرياض, المملكة العربية السعودية';
            city = 'الرياض';
            
            console.log('📍 User location outside Saudi Arabia, using default Riyadh coordinates');
          }

          const locationData = {
            latitude: finalLatitude,
            longitude: finalLongitude,
            address: finalAddress,
            city: city,
          };

          console.log('📍 Saving location data:', locationData);

          try {
            // Update backend
            await updateUserLocation(userData._id, locationData);
            
            // Update local storage immediately
            const updatedUserData = {
              ...userData,
              location: locationData
            };
            await storeUserData(updatedUserData);
            
            // Force refresh user data from server to ensure consistency
            try {
              console.log('🔄 Refreshing user data from server to ensure latest location...');
              await refreshUserDataFromServer();
              console.log('✅ User data refreshed from server');
              
              // Clear all cached data to ensure fresh data is used
              try {
                console.log('🧹 Clearing all cached data to ensure fresh app state...');
                
                // Clear location cache
                await AsyncStorage.removeItem('user_location_cache');
                await AsyncStorage.removeItem('location_cache_timestamp');
                
                // Clear other potential cache keys
                await AsyncStorage.removeItem('services_cache');
                await AsyncStorage.removeItem('orders_cache');
                await AsyncStorage.removeItem('notifications_cache');
                
                // Clear any other cached data
                const keys = await AsyncStorage.getAllKeys();
                const cacheKeys = keys.filter(key => 
                  key.includes('cache') || 
                  key.includes('timestamp') || 
                  key.includes('temp')
                );
                
                if (cacheKeys.length > 0) {
                  await AsyncStorage.multiRemove(cacheKeys);
                  console.log('🧹 Cleared cache keys:', cacheKeys);
                }
                
                console.log('✅ All cached data cleared successfully');
                
                // Trigger global refresh
                triggerLocationRefresh();
                
              } catch (cacheError) {
                console.log('⚠️ Error clearing cache:', cacheError);
              }
            } catch (refreshError) {
              console.log('⚠️ Could not refresh from server, using local update:', refreshError);
            }
            
            console.log('✅ Location saved successfully');
            
            clearTimeout(updateTimeout); // Clear timeout
            setIsLoading(false);
            setIsUpdatingLocation(false);
            
            // Navigate back safely or to home if no previous screen
            try {
              // Pass refresh parameter to trigger Home screen refresh
              router.replace({
                pathname: '/(tabs)/Home',
                params: { refreshLocation: 'true', timestamp: Date.now().toString() }
              });
            } catch (error) {
              // If navigation fails, go to home with refresh
              router.replace({
                pathname: '/(tabs)/Home',
                params: { refreshLocation: 'true', timestamp: Date.now().toString() }
              });
            }
          } catch (error) {
            console.error('❌ Error saving location:', error);
            clearTimeout(updateTimeout); // Clear timeout
            setIsLoading(false);
            setIsUpdatingLocation(false);
            
            // Still navigate back even if save failed, but with refresh
            try {
              router.replace({
                pathname: '/(tabs)/Home',
                params: { refreshLocation: 'true', timestamp: Date.now().toString() }
              });
            } catch (navError) {
              router.replace({
                pathname: '/(tabs)/Home',
                params: { refreshLocation: 'true', timestamp: Date.now().toString() }
              });
            }
          }
        } else {
          console.error('❌ No user data available');
          clearTimeout(updateTimeout); // Clear timeout
          setIsLoading(false);
          setIsUpdatingLocation(false);
          
          // Navigate back safely or to home if no previous screen
          try {
            router.replace({
              pathname: '/(tabs)/Home',
              params: { refreshLocation: 'true', timestamp: Date.now().toString() }
            });
          } catch (error) {
            router.replace({
              pathname: '/(tabs)/Home',
              params: { refreshLocation: 'true', timestamp: Date.now().toString() }
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling webview message:', error);
      setIsLoading(false);
      setIsUpdatingLocation(false);
      
      // Navigate back safely or to home if no previous screen
      try {
        router.replace({
          pathname: '/(tabs)/Home',
          params: { refreshLocation: 'true', timestamp: Date.now().toString() }
        });
      } catch (navError) {
        router.replace({
          pathname: '/(tabs)/Home',
          params: { refreshLocation: 'true', timestamp: Date.now().toString() }
        });
      }
    }
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error: ', nativeEvent);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={["#2E8B57", "#006400"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.headerContent}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>اختر موقعك من الخريطة</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            try {
              // Navigate back with refresh parameter
              router.replace({
                pathname: '/(tabs)/Home',
                params: { refreshLocation: 'true', timestamp: Date.now().toString() }
              });
            } catch (error) {
              // If navigation fails, go to home with refresh
              router.replace({
                pathname: '/(tabs)/Home',
                params: { refreshLocation: 'true', timestamp: Date.now().toString() }
              });
            }
          }}>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map WebView */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          onError={handleWebViewError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          scalesPageToFit={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          bounces={false}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E8B57" />
              <Text style={styles.loadingText}>جاري تحميل الخريطة...</Text>
            </View>
          )}
        />
        {/* Floating Red Waypoint Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={requestLocationPermission}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="location-arrow" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.savingOverlay}>
          <View style={styles.savingContainer}>
            <ActivityIndicator size="large" color="#2E8B57" />
            <Text style={styles.savingText}>جاري حفظ الموقع...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  locationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerSpacer: {
    width: 36,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  savingContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 200,
  },
  savingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 96, // 30 (submit) + 56 (button height) + 10 (gap)
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E53935', // Red
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1001,
  },
}); 