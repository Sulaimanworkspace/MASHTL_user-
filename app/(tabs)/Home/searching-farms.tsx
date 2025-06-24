import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, Image, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createServiceOrder, getUserData } from '../../services/api';

export default function SearchingFarmsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  // Animated dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Create service order when component mounts
  useEffect(() => {
    const createOrder = async () => {
      if (orderCreated) return;
      
      try {
        const userData = await getUserData();
        if (!userData) {
          console.error('No user data found');
          return;
        }

        // Get service details from params or use defaults
        const serviceType = (params.projectName as string) || 'تنسيق الحدائق';
        const description = (params.description as string) || 'خدمة تصميم وتنفيذ الحدائق المنزلية';
        
        const orderData = {
          serviceType,
          serviceTitle: serviceType,
          description,
          location: {
            address: 'الرياض حي الزهرة, الرياض',
            city: 'الرياض',
            coordinates: {
              latitude: 24.7136,
              longitude: 46.6753
            }
          },
          notes: 'طلب جديد من التطبيق'
        };

        console.log('🔄 Creating service order:', orderData);
        const response = await createServiceOrder(orderData);
        console.log('✅ Service order created successfully:', response);
        setOrderCreated(true);
        
      } catch (error) {
        console.error('💥 Error creating service order:', error);
      }
    };

    createOrder();
  }, [params, orderCreated]);

  React.useEffect(() => {
    Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true, easing: Easing.linear }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true, easing: Easing.linear }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true, easing: Easing.linear }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      {/* Green Header */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.navContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowModal(true)}>
            <FontAwesome5 name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/images/icon.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
        <Text style={styles.mainText}>جارِ البحث عن أقرب مزارع...</Text>
        <Text style={styles.subText}>نحن نبحث عن أفضل مزارع بالقرب منك</Text>
      </View>
      {/* Modal for back warning */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>سيتم إلغاء البحث عن المزارع. هل أنت متأكد؟</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowModal(false)}>
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF3B30' }]} onPress={() => { setShowModal(false); router.back(); }}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>تأكيد</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
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
    top: -8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -60,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginHorizontal: 6,
  },
  mainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3a22',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 