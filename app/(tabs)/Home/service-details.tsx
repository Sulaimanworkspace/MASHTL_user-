import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { getUserData, getServices } from '../../services/api';
import { useSpinner } from '../../contexts/SpinnerContext';

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const { id, name, image, description } = useLocalSearchParams();
  const { showSpinner, hideSpinner } = useSpinner();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [serviceFeatures, setServiceFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Load service features from API
  useEffect(() => {
    const loadServiceFeatures = async () => {
      try {
        setIsLoading(true);
        showSpinner(); // Show spinner when loading service details
        const response = await getServices();
        if (response.success && response.data) {
          // Find the service by name or id
          const service = response.data.find((s: any) => 
            s._id === id || s.title === name || s.serviceType === name
          );
          
          if (service && service.features && Array.isArray(service.features)) {
            setServiceFeatures(service.features);
            console.log('✅ Service features loaded:', service.features);
          } else {
            // Fallback to hardcoded features if not found in API
            const featuresData: Record<string, string[]> = {
              'تنسيق الحدائق': [
                'تصميم الحديقة.',
                'اختيار النباتات المناسبة.',
                'تركيب أنظمة الري.',
                'تنسيق المساحات الخضراء.'
              ],
              'زراعة الأشجار': [
                'اختيار أفضل أنواع الأشجار.',
                'زراعة الأشجار بطريقة احترافية.',
                'توفير الرعاية اللازمة.',
                'ضمان نجاح الزراعة.'
              ],
              'زراعة ثيل': [
                'تجهيز الأرض.',
                'زراعة الثيل الطبيعي أو الصناعي.',
                'ضمان جودة العشب.',
                'خدمات صيانة دورية.'
              ]
            };
            const fallbackFeatures = featuresData[name as string] || [];
            setServiceFeatures(fallbackFeatures);
            console.log('⚠️ Using fallback features:', fallbackFeatures);
          }
        }
      } catch (error) {
        console.error('❌ Error loading service features:', error);
        // Use fallback features on error
        const featuresData: Record<string, string[]> = {
          'تنسيق الحدائق': [
            'تصميم الحديقة.',
            'اختيار النباتات المناسبة.',
            'تركيب أنظمة الري.',
            'تنسيق المساحات الخضراء.'
          ],
          'زراعة الأشجار': [
            'اختيار أفضل أنواع الأشجار.',
            'زراعة الأشجار بطريقة احترافية.',
            'توفير الرعاية اللازمة.',
            'ضمان نجاح الزراعة.'
          ],
          'زراعة ثيل': [
            'تجهيز الأرض.',
            'زراعة الثيل الطبيعي أو الصناعي.',
            'ضمان جودة العشب.',
            'خدمات صيانة دورية.'
          ]
        };
        const fallbackFeatures = featuresData[name as string] || [];
        setServiceFeatures(fallbackFeatures);
      } finally {
        setIsLoading(false);
        // Hide spinner after a delay
        setTimeout(() => {
          hideSpinner();
        }, 1500);
      }
    };

    loadServiceFeatures();
  }, [id, name]);

  // Check authentication status and reset image state
  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        try {
          showSpinner(); // Show spinner when navigating to service details
          const userData = await getUserData();
          setIsLoggedIn(userData && userData.name ? true : false);
        } catch (error) {
          setIsLoggedIn(false);
        } finally {
          // Hide spinner after a delay
          setTimeout(() => {
            hideSpinner();
          }, 1500);
        }
      };
      
      // Reset image state when screen is focused
      fadeAnim.setValue(0);
      setImageError(false);
      
      checkAuthStatus();
    }, [id, image]) // Add dependencies to re-run when id or image changes
  );

  return (
    <View style={styles.container}>
      {/* Green Header Navigation Bar */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>تفاصيل الخدمة</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.bannerContainer}>
          <Animated.Image 
            key={`${id}-${image}-${Date.now()}`} // More unique key to force re-render
            source={{ 
              uri: image as string,
              cache: 'reload' // Force reload to prevent showing old image
            }} 
            style={[
              styles.bannerImageFull,
              { opacity: fadeAnim }
            ]}
            resizeMode="cover"
            onLoadStart={() => {
              fadeAnim.setValue(0);
              setImageError(false);
            }}
            onLoad={() => {
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
            }}
            onError={() => {
              setImageError(true);
              fadeAnim.setValue(0);
            }}
          />
          {imageError && (
            <View style={styles.imageErrorContainer}>
              <FontAwesome5 name="image" size={40} color="#ccc" />
              <Text style={styles.imageErrorText}>فشل في تحميل الصورة</Text>
            </View>
          )}
        </View>
        <View style={styles.textSection}>
          <Text style={styles.titleLarge}>{name}</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>وصف الخدمة</Text>
          <Text style={styles.descriptionLarge}>{description}</Text>
          <Text style={styles.sectionTitle}>ما تشمله الخدمة</Text>
          {isLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#666', fontSize: 14 }}>جاري تحميل المميزات...</Text>
            </View>
          ) : (
            serviceFeatures.map((feature: string, idx: number) => (
            <View key={idx} style={styles.featureRow}>
              <FontAwesome5 name="circle" size={10} color="#4CAF50" style={{ marginLeft: 6 }} solid />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
            ))
          )}
        </View>
        <TouchableOpacity style={styles.gradientButtonWrapper} onPress={() => {
          if (!isLoggedIn) {
            router.replace('/(tabs)/auth/login');
            return;
          }
          router.push({
            pathname: '/(tabs)/Home/order-summary',
            params: {
              projectName: name,
              projectType: 'خدمة',
              image: image,
              description: description,
            }
          });
        }}>
          <View style={styles.gradientButton}>
            <Text style={styles.gradientButtonText}>طلب الخدمة</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    zIndex: 1,
    top: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 0,
  },
  bannerImageFull: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderRadius: 0,
    marginBottom: 0,
  },

  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    zIndex: 1,
  },
  imageErrorText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  textSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  cardContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    marginHorizontal: 0,
    alignItems: 'flex-end',
    elevation: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  descriptionLarge: {
    fontSize: 15,
    color: '#444',
    marginBottom: 12,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  featureRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  featureText: {
    fontSize: 14,
    color: '#222',
    textAlign: 'right',
  },

  titleLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 4,
  },
  gradientButtonWrapper: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  gradientButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2,
    backgroundColor: '#2E8B57',
  },
  gradientButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 