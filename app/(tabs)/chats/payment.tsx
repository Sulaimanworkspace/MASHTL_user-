import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getInvoiceData, getUserData } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface InvoiceData {
  orderNumber: string;
  serviceType: string;
  serviceCost: number;
  vat: number;
  totalAmount: number;
  date: string;
  location: string;
  farmerName: string;
  paymentStatus: string;
  paymentMessage: string;
}

interface SavedCard {
  id: string;
  maskedNumber: string;
  cardholderName: string;
  expiryDate: string;
  lastFourDigits: string;
}

// Card View Component
const PaymentCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.cardContainer, style]}>
    {children}
  </View>
);

export default function PaymentPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [saveCard, setSaveCard] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    if (orderId) {
      fetchInvoiceData();
    } else {
      Alert.alert('خطأ', 'معرف الطلب غير موجود');
    }
  }, [orderId]);

  // Load saved cards on component mount
  useEffect(() => {
    handleRefreshCards();
  }, []);

  // Debug authentication status on component mount
  useEffect(() => {
    const debugAuth = async () => {
      const user = await getUserData();
      console.log('🔍 Payment page - User auth status:', user ? 'Authenticated' : 'Not authenticated');
      console.log('🔍 Payment page - User data:', user);
    };
    debugAuth();
  }, []);

  const fetchInvoiceData = async () => {
    if (!orderId) {
      Alert.alert('خطأ', 'معرف الطلب غير موجود');
      return;
    }

    try {
      setLoading(true);
      const response = await getInvoiceData(orderId);
      
      if (response.success) {
        setInvoiceData(response.data);
        console.log('✅ Invoice data fetched successfully:', response.data);
      } else {
        Alert.alert('خطأ', `فشل في جلب بيانات الفاتورة: ${response.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('❌ Error fetching invoice data:', error);
      Alert.alert('خطأ', 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
    };

    // Card number validation (16 digits)
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'رقم البطاقة يجب أن يكون 16 رقم';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'اسم حامل البطاقة مطلوب';
    }

    // Expiry date validation (MM/YY format)
    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'تاريخ الانتهاء يجب أن يكون MM/YY';
    }

    // CVV validation (3-4 digits)
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'CVV يجب أن يكون 3-4 أرقام';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    // Handle single digit input
    if (cleaned.length === 1) {
      return cleaned;
    }
    
    // Handle two digits - add slash only if it's a valid month
    if (cleaned.length === 2) {
      const month = cleaned.slice(0, 2);
      const monthNum = parseInt(month);
      
      // Only add slash for valid months (01-12)
      if (monthNum >= 1 && monthNum <= 12) {
        return month + '/';
      } else {
        // For invalid months, don't add slash automatically
        return month;
      }
    }
    
    // Handle three or more digits
    if (cleaned.length >= 3) {
      const month = cleaned.slice(0, 2);
      const year = cleaned.slice(2, 4);
      const monthNum = parseInt(month);
      
      // Validate month (01-12)
      if (monthNum >= 1 && monthNum <= 12) {
        return month + '/' + year;
      } else {
        // Invalid month, format as single digit + slash + rest
        return cleaned.slice(0, 1) + '/' + cleaned.slice(1, 3);
      }
    }
    
    return cleaned;
  };

  const formatCVV = (text: string) => {
    return text.replace(/\D/g, '').slice(0, 4);
  };

  const handlePayment = async () => {
    if (!validateForm() || !invoiceData) {
      return;
    }

    // Check authentication before proceeding
    const user = await getUserData();
    if (!user || !user.token) {
      Alert.alert('خطأ في المصادقة', 'يرجى تسجيل الدخول مرة أخرى');
      router.replace('/(tabs)/auth/login');
      return;
    }

    try {
      setLoading(true);
      console.log('💳 Starting custom payment process...');
      console.log('💳 Payment amount:', invoiceData.totalAmount);
      console.log('💳 Form data:', formData);
      console.log('💳 Order ID:', orderId);

      // Process payment through your backend API instead of Fatoorah SDK
      const token = user.token;
      
      console.log('🔑 Token retrieved:', token ? 'Token exists' : 'No token found');
      console.log('🔑 Token length:', token ? token.length : 0);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const paymentData = {
        orderId: orderId,
        amount: invoiceData.totalAmount,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardholderName: formData.cardholderName,
        expiryMonth: formData.expiryDate.split('/')[0],
        expiryYear: '20' + formData.expiryDate.split('/')[1],
        cvv: formData.cvv,
        customerEmail: 'test@test.com',
        customerMobile: '123456789',
        currency: 'KWD'
      };

      console.log('📤 Sending payment to backend...');
      console.log('📤 Payment data:', {
        ...paymentData,
        cardNumber: paymentData.cardNumber.substring(0, 4) + '****' + paymentData.cardNumber.substring(paymentData.cardNumber.length - 4)
      });

      const response = await fetch('http://172.20.10.12:9090/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Payment request failed:', errorText);
        throw new Error(`Payment request failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      console.log('✅ Payment response:', result);
      
      if (response.ok && result.success) {
        console.log('🎉 Payment completed successfully');
        


        // Save card only if user explicitly chose to
        if (saveCard) {
          console.log('💾 User chose to save card, saving to database...');
          try {
            await handleSaveCard();
          } catch (error) {
            console.error('⚠️ Card save failed, but payment was successful:', error);
            // Continue with success flow even if card save fails
          }
        }
        
        // Navigate directly to invoice page with success status
        console.log('🔄 Navigating to invoice page with success status...');
        router.push({
          pathname: '/chats/invoice',
          params: { 
            orderId: orderId,
            paymentSuccess: 'true'
          }
        });
      } else {
        console.log('❌ Payment failed:', result.message);
        throw new Error(result.message || 'Payment failed');
      }

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      console.error('❌ Payment error message:', error?.message);
      console.error('❌ Payment error stack:', error?.stack);
      
      Alert.alert('خطأ في الدفع', error?.message || 'فشل في إتمام عملية الدفع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };



  // Saved Cards Functions
  const handleRefreshCards = async () => {
    try {
      console.log('🔄 Fetching saved cards from local storage...');
      
      // Load saved cards from AsyncStorage
      const savedCardsJson = await AsyncStorage.getItem('savedCards');
      const cards = savedCardsJson ? JSON.parse(savedCardsJson) : [];
      
      setSavedCards(cards);
      console.log(`Loaded ${cards.length} saved cards`);
      
      // TODO: Implement backend API call when ready
      // const user = await getUserData();
      // if (!user?.token) {
      //   console.log('No user token found, skipping saved cards fetch');
      //   return;
      // }
      // const response = await fetch('http://172.20.10.12:9090/api/saved-cards', {
      //   headers: { 'Authorization': `Bearer ${user.token}` }
      // });
      // const data = await response.json();
      // setSavedCards(data.cards || []);
      
    } catch (error) {
      console.error('Error fetching saved cards:', error);
      setSavedCards([]);
    }
  };

  const handleSelectSavedCard = (card: SavedCard) => {
    console.log('💳 Selected saved card:', card);
    // Populate form with saved card data (without CVV for security)
    setFormData({
      cardNumber: `**** **** **** ${card.lastFourDigits}`,
      cardholderName: card.cardholderName,
      expiryDate: card.expiryDate,
      cvv: '', // CVV is not stored for security reasons
    });
  };

  const handleSaveCard = async () => {
    try {
      const user = await getUserData();
      if (!user?.token) {
        console.error('No user token found for saving card');
        return;
      }

      // Create card data (without full card number for security)
      const cardData = {
        id: Date.now().toString(), // Simple ID generation
        cardholderName: formData.cardholderName,
        expiryDate: formData.expiryDate,
        lastFourDigits: formData.cardNumber.replace(/\s/g, '').slice(-4),
        maskedNumber: `**** **** **** ${formData.cardNumber.replace(/\s/g, '').slice(-4)}`
      };

      // Save to AsyncStorage for now (you can replace this with API call later)
      const existingCardsJson = await AsyncStorage.getItem('savedCards');
      const existingCards = existingCardsJson ? JSON.parse(existingCardsJson) : [];
      
      // Check if card already exists (by last 4 digits and expiry)
      const cardExists = existingCards.some((card: SavedCard) => 
        card.lastFourDigits === cardData.lastFourDigits && 
        card.expiryDate === cardData.expiryDate
      );

      if (cardExists) {
        console.log('Card already exists, skipping save');
        return;
      }

      const updatedCards = [...existingCards, cardData];
      await AsyncStorage.setItem('savedCards', JSON.stringify(updatedCards));
      
      // Update local state
      setSavedCards(updatedCards);
      
      console.log('Card saved successfully to local storage');
      
      // TODO: Implement backend API call when ready
      // const response = await fetch('http://172.20.10.12:9090/api/saved-cards', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${user.token}` 
      //   },
      //   body: JSON.stringify(cardData)
      // });
      
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  if (loading && !invoiceData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (!invoiceData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>فشل في تحميل بيانات الفاتورة</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Header */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push({
              pathname: '/chats/invoice',
              params: { 
                orderId: orderId,
                paymentSuccess: 'false'
              }
            })}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>فاتورة الخدمة</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

      {/* Order Summary Section */}
      <PaymentCard style={styles.orderSummaryCard}>
        <Text style={styles.sectionTitle}>ملخص الطلب</Text>
        <View style={styles.orderSummaryContent}>
          <Text style={styles.orderPrice}>{invoiceData.totalAmount} ريال</Text>
          <View style={styles.orderDetails}>
            <Text style={styles.orderDetail}>{invoiceData.serviceType}</Text>
            <Text style={styles.orderDetail}>المزارع: {invoiceData.farmerName}</Text>
          </View>
        </View>
      </PaymentCard>

      {/* Payment Method Section */}
      <PaymentCard style={styles.paymentMethodCard}>
        <Text style={styles.sectionTitle}>طريقة الدفع</Text>
        <View style={styles.paymentMethodContainer}>
          <View style={styles.paymentMethodInfo}>
            <FontAwesome5 name="credit-card" size={20} color="black" solid={false} style={{marginRight: 140}} />
            <View style={styles.paymentMethodText}>
              <Text style={styles.paymentMethodTitle}>بطاقة ائتمان</Text>
              <Text style={styles.paymentMethodSubtitle}>Visa, Mastercard, Mada</Text>
            </View>
          </View>
          <View style={styles.radioButton}>
            <View style={styles.radioButtonInner} />
          </View>
        </View>
        
        {/* Saved Cards Section */}
        <View style={styles.savedCardsSection}>
          <Text style={styles.savedCardsTitle}>البطاقات المحفوظة</Text>
          {savedCards.length > 0 ? (
            <View style={styles.savedCardsList}>
              {savedCards.map((card, index) => (
                <TouchableOpacity 
                  key={card.id} 
                  style={styles.savedCardItem} 
                  onPress={() => handleSelectSavedCard(card)}
                >
                  <FontAwesome5 name="credit-card" size={16} color="#666" />
                  <Text style={styles.savedCardText}>{card.maskedNumber}</Text>
                  <View style={styles.savedCardRadio}>
                    <View style={styles.savedCardRadioInner} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noCardsContainer}>
              <Text style={styles.noCardsText}>لا توجد بطاقات محفوظة</Text>
              <Text style={styles.noCardsSubtext}>يمكنك حفظ بطاقتك بعد إتمام الدفع</Text>
            </View>
          )}
        </View>
      </PaymentCard>

      {/* Credit Card Input Fields */}
      <PaymentCard style={styles.formCard}>
        {/* Card Number */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.cardNumberInput}
            value={formData.cardNumber}
            onChangeText={(text) => setFormData({ ...formData, cardNumber: formatCardNumber(text) })}
            placeholder="رقم البطاقة"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={19}
            textAlign="right"
          />
          {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}
        </View>

        {/* CVV and Expiry Date Row */}
        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <TextInput
              style={styles.smallInput}
              value={formData.cvv}
              onChangeText={(text) => setFormData({ ...formData, cvv: formatCVV(text) })}
              placeholder="CVV"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={4}
              textAlign="right"
            />
            {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <TextInput
              style={styles.smallInput}
              value={formData.expiryDate}
              onChangeText={(text) => setFormData({ ...formData, expiryDate: formatExpiryDate(text) })}
              placeholder="تاريخ الانتهاء"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={5}
              textAlign="right"
            />
            {errors.expiryDate ? <Text style={styles.errorText}>{errors.expiryDate}</Text> : null}
          </View>
        </View>

        {/* Cardholder Name */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.cardNumberInput}
            value={formData.cardholderName}
            onChangeText={(text) => setFormData({ ...formData, cardholderName: text })}
            placeholder="اسم حامل البطاقة"
            placeholderTextColor="#999"
            textAlign="right"
          />
          {errors.cardholderName ? <Text style={styles.errorText}>{errors.cardholderName}</Text> : null}
        </View>
      </PaymentCard>

      {/* Save Card Option */}
      <View style={styles.saveCardContainer}>
        <TouchableOpacity 
          style={styles.saveCardCheckbox}
          onPress={() => setSaveCard(!saveCard)}
        >
          <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
            {saveCard && <FontAwesome5 name="check" size={12} color="#FFF" />}
          </View>
          <Text style={styles.saveCardText}>حفظ البطاقة للدفع في المستقبل</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Button */}
      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.payButtonText}>ادفع الآن</Text>
        )}
      </TouchableOpacity>

      {/* Security Notice Card */}
      <PaymentCard style={styles.securityCard}>
        <View style={styles.securityContent}>
          <FontAwesome5 name="shield-alt" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>معلوماتك محمية ومشفرة</Text>
        </View>
      </PaymentCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 5,
  },
  // Header Styles (matching invoice page)
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
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  // Card Component Styles
  cardContainer: {
    backgroundColor: '#FFF',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  // Order Summary Section
  orderSummaryCard: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'right',
  },
  orderSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  orderDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 5,
  },
  orderPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'left',
  },
  // Payment Method Section
  paymentMethodCard: {
    marginTop: 10,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  paymentMethodText: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  // Saved Cards Section
  savedCardsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  savedCardsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
    marginBottom: 15,
  },
  savedCardsList: {
    gap: 10,
  },
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  savedCardText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    marginLeft: 12,
  },
  savedCardRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedCardRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  noCardsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCardsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  noCardsSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  // Save Card Option
  saveCardContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  saveCardCheckbox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  saveCardText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },
  // Form Card
  formCard: {
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  cardNumberInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
    textAlign: 'right',
    height: 44,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
    textAlign: 'right',
    height: 44,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    height: 44,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    backgroundColor: '#CCC',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityCard: {
    marginBottom: 30,
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
}); 