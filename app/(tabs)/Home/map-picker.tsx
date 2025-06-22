import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { updateUserLocation, getUserData, storeUserData } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MapPicker() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 24.7136,
    longitude: 46.6753,
    address: 'الرياض, المملكة العربية السعودية',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // Using OpenStreetMap with current location and user pin
  const mapHTML = `
    <!DOCTYPE html>
    <html>
          <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          height: 100%; 
          font-family: Arial, sans-serif;
          direction: rtl;
        }
        #map { 
          height: 100vh; 
          width: 100%; 
          touch-action: manipulation;
        }
        .info-card {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
          text-align: right;
        }
        .info-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
          font-size: 14px;
        }
        .info-address {
          color: #666;
          font-size: 13px;
        }
        .location-btn {
          position: absolute;
          bottom: 100px;
          right: 20px;
          width: 50px;
          height: 50px;
          background: #2E8B57;
          border: none;
          border-radius: 25px;
          color: white;
          font-size: 18px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(46, 139, 87, 0.3);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .confirm-btn {
          position: absolute;
          bottom: 30px;
          left: 20px;
          right: 20px;
          background: #2E8B57;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          z-index: 1000;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          z-index: 2000;
        }
        /* Custom marker styles */
        .user-marker {
          background-color: #2196F3;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .selected-marker {
          background-color: #4CAF50;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="loading" class="loading">
        <div>جاري تحميل الخريطة...</div>
      </div>
      
      <div class="info-card">
        <div class="info-title">الموقع المحدد:</div>
        <div class="info-address" id="address">اضغط على الخريطة لتحديد الموقع</div>
      </div>
      
      <button class="location-btn" onclick="getCurrentLocation()" title="موقعي الحالي">📍</button>
      
      <div id="map"></div>
      
      <button class="confirm-btn" onclick="confirmLocation()">تأكيد الموقع</button>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        let map;
        let selectedMarker;
        let userLocationMarker;
        let currentLat = 24.7136;
        let currentLng = 46.6753;
        let currentAddress = "اضغط على الخريطة لتحديد الموقع";
        let locationSelected = false;
        let userLat = null;
        let userLng = null;

        function hideLoading() {
          const loading = document.getElementById('loading');
          if (loading) {
            loading.style.display = 'none';
          }
        }

        function updateAddress(address) {
          document.getElementById('address').textContent = address;
          currentAddress = address;
        }

        function initMap() {
          try {
            hideLoading();
            
            // Initialize Leaflet map
            map = L.map('map').setView([currentLat, currentLng], 12);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);

            // Handle map clicks - create or move selected marker
            map.on('click', function(e) {
              updateSelectedLocation(e.latlng.lat, e.latlng.lng);
            });
            
          } catch (error) {
            console.error('Map initialization error:', error);
            document.getElementById('loading').innerHTML = '<div>خطأ في تحميل الخريطة</div>';
          }
        }

        function updateSelectedLocation(lat, lng) {
          currentLat = lat;
          currentLng = lng;
          locationSelected = true;
          
          // Remove existing selected marker if any
          if (selectedMarker) {
            map.removeLayer(selectedMarker);
          }
          
          // Create selected location marker icon (green)
          const selectedIcon = L.divIcon({
            className: 'selected-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          
          // Add new selected marker
          selectedMarker = L.marker([lat, lng], {
            icon: selectedIcon,
            draggable: true
          }).addTo(map);
          
          // Handle marker drag
          selectedMarker.on('dragend', function(e) {
            const position = e.target.getLatLng();
            updateSelectedLocation(position.lat, position.lng);
          });
          
          // Get address for this location
          reverseGeocode(lat, lng);
        }

        function showUserLocation(lat, lng) {
          userLat = lat;
          userLng = lng;
          
          // Remove existing user location marker if any
          if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
          }
          
          // Create user location marker icon (blue)
          const userIcon = L.divIcon({
            className: 'user-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            html: '<div style="width:25px;height:25px;background:#2196F3;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(33,150,243,0.5);display:flex;align-items:center;justify-content:center;font-size:12px;">📍</div>'
          });
          
          // Add user location marker
          userLocationMarker = L.marker([lat, lng], {
            icon: userIcon,
            draggable: false
          }).addTo(map);
          
          // Center map on user location
          map.setView([lat, lng], 15);
          
          console.log('User location marker added at:', lat, lng);
        }

        function reverseGeocode(lat, lng) {
          try {
            // Using Nominatim for reverse geocoding (free)
            fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}&accept-language=ar\`)
              .then(response => response.json())
              .then(data => {
                if (data && data.display_name) {
                  updateAddress(data.display_name);
                } else {
                  updateAddress('موقع محدد على الخريطة');
                }
              })
              .catch(error => {
                console.error('Geocoding error:', error);
                updateAddress('موقع محدد على الخريطة');
              });
          } catch (error) {
            updateAddress('موقع محدد على الخريطة');
          }
        }

        function           getCurrentLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              function(position) {
                console.log('Got user location:', position.coords.latitude, position.coords.longitude);
                showUserLocation(position.coords.latitude, position.coords.longitude);
              }, 
              function(error) {
                console.log('Location access denied or unavailable:', error);
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000
              }
            );
          } else {
            console.log('Geolocation not supported');
          }
        }

        function confirmLocation() {
          if (!locationSelected) {
            // Don't show popup, just return
            return;
          }
          
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOCATION_SELECTED',
              latitude: currentLat,
              longitude: currentLng,
              address: currentAddress
            }));
          } catch (error) {
            console.error('Error sending message:', error);
          }
        }

        // Initialize map when page loads
        document.addEventListener('DOMContentLoaded', function() {
          initMap();
        });

        // Set up global error handler
        window.onerror = function(msg, url, line, col, error) {
          console.error('JavaScript error:', msg, url, line, col, error);
          return false;
        };
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'LOCATION_SELECTED') {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
        });
        
        setIsLoading(true);
        
        // Add slight delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Save location to backend and update local storage
        const userData = await getUserData();
        if (userData && userData._id) {
          const locationData = {
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            city: 'الرياض',
          };

          // Update backend
          await updateUserLocation(userData._id, locationData);
          
          // Update local storage immediately
          const updatedUserData = {
            ...userData,
            location: locationData
          };
          await storeUserData(updatedUserData);
          
          setIsLoading(false);
          router.back();
        } else {
          setIsLoading(false);
          router.back();
        }
      }
    } catch (error) {
      console.error('Error handling webview message:', error);
      setIsLoading(false);
      router.back();
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
          startInLoadingState={true}
          onLoadStart={() => setMapLoading(true)}
          onLoadEnd={() => setMapLoading(false)}
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
}); 