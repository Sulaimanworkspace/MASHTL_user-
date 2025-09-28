import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MFSDK,
  MFEnvironment,
  MFCountry,
  MFLanguage,
  MFCardPaymentView,
  MFInitiateSessionRequest,
  MFInitiateSessionResponse,
  MFExecutePaymentRequest,
  MFCardViewInput,
  MFCardViewLabel,
  MFCardViewError,
  MFCardViewStyle,
  MFCardViewPlaceHolder,
  MFCardViewText,
  MFBoxShadow,
  MFFontFamily,
  MFFontWeight,
} from 'myfatoorah-reactnative';
import { processColor } from 'react-native';
import { getInvoiceData, getUserData } from '../../services/api';
import api from '../../services/api';

const { width } = Dimensions.get('window');

interface PaymentScreenProps {}

const PaymentScreen: React.FC<PaymentScreenProps> = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  
  // MyFatoorah card payment view reference
  const cardPaymentView = useRef<MFCardPaymentView | null>(null);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionResponse, setSessionResponse] = useState<MFInitiateSessionResponse | null>(null);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardViewReady, setCardViewReady] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);

  // MyFatoorah configuration
  const MYFATOORAH_CONFIG = {
    // Live API Key for Saudi Arabia
    apiKey: '9jY7LLAvUANRpa99yySItWj7v1BMFE_s9fwncYSlqAhiI8tgcUQID6U9humtIMPWwH8IuODoa0FRpfwa05gfJbQs9lYdZyIojDu5MpRhXG9eJI0t0hMfWfqLFBNUh0M8-3dCmaMwnoZzISjnHeYPF5PJAYqhooNayPdHTlsu2aXL7R4oQWFHkj2f4sm_LkWBaFwzOCzHU5Y-XRPyuSEN6U_lMsNZMWWlar-e-5pA9Qs8u7LOSHs2gcOGVzlVvBi57wQkZlDYqpDS4pZlYaoudaQiXhQesEYL7QZ234er1-h671Sx57ehHnYKJIs-eZiuPXC1wZc9tpzJ0AD9PvhXZcj4ml3eyjC6AkpqTOhZbPCEjIU64SEvvDocSdxQC-5tc1Bw9w0ADYh-qJRhHQwnec0O2ogYiLQFaYLrmeflyufrsrqRI_vD9fWjfc7gZG5d48CjZreL8jmteVleQReBi_TYEeJdRC2TvIi7jfHk3j10obhPtdKjKz53lFnvuR-nqVkqBNtRPZcZwFlk_NgnlK3rmjKrjGEUrXQSfIjyfPRRs1IiO8mZWvSzY3gzhXwxHOESiBZ6Y3jQtq0p20utxpBm_l9Xl98BIWYWIDrOnCQ7MxdXEvsI7rj1pns1BQ76dDYQn-zEqV8I73eExZU59mDZKdw7GKGmy-L5yEPDggOKeBUwgybO7dR7HpA1zp1PcD_9kZOkC3f0pFnd0fG088I8ruerD-suIvzA1mtHJTYeiIHG',
    isLive: true,
    country: MFCountry.SAUDIARABIA,
  };

  // Initialize MyFatoorah SDK
  // Reset card view details on every login (component mount)
  useEffect(() => {
    console.log('🔄 Resetting card view details on login');
    setCardViewReady(false);
    setSessionResponse(null);
    setSessionId(null);
    setError(null);
  }, []);

  useEffect(() => {
    const initializeMyFatoorah = async () => {
      try {
        console.log('🔧 Initializing MyFatoorah SDK...');
        await MFSDK.init(
          MYFATOORAH_CONFIG.apiKey,
          MYFATOORAH_CONFIG.country,
          MYFATOORAH_CONFIG.isLive ? MFEnvironment.LIVE : MFEnvironment.TEST
        );
        console.log('✅ MyFatoorah SDK initialized successfully');
        
        // Fetch invoice data
        await fetchInvoiceData();
      } catch (error) {
        console.error('❌ Error initializing MyFatoorah SDK:', error);
        setError('فشل في تهيئة نظام الدفع');
        setLoading(false);
      }
    };

    initializeMyFatoorah();
  }, []);

  // Debug effect to monitor card view ready state
  useEffect(() => {
    console.log('🔄 Card view ready state changed:', cardViewReady);
    console.log('🔍 Card payment view ref:', cardPaymentView.current);
  }, [cardViewReady]);

  // Effect to load card view when it becomes ready
  useEffect(() => {
    const loadCardViewWhenReady = async () => {
      if (cardViewReady && cardPaymentView.current && sessionResponse && !loading) {
        console.log('🎯 Card view became ready, loading now...');
        try {
          await loadCardView(sessionResponse);
        } catch (error) {
          console.error('❌ Error loading card view when ready:', error);
        }
      }
    };

    loadCardViewWhenReady();
  }, [cardViewReady, sessionResponse, loading]);

  // Fetch invoice data
  const fetchInvoiceData = async () => {
    try {
      console.log('📄 Fetching invoice data for order:', orderId);
      const response = await getInvoiceData(orderId);
      
      if (response.success && response.data) {
        setInvoiceData(response.data);
        console.log('✅ Invoice data loaded:', response.data);
        
        // Initialize payment session
        await initiateSession();
      } else {
        throw new Error('Failed to load invoice data');
      }
    } catch (error: any) {
      console.error('❌ Error fetching invoice data:', error);
      setError(error.message || 'فشل في تحميل بيانات الفاتورة');
      setLoading(false);
    }
  };

  // Initialize MyFatoorah session
  const initiateSession = async () => {
    try {
      console.log('🔄 Initiating MyFatoorah session...');
      const user = await getUserData();
      const customerName = user?.name || 'testCustomer';
      
      console.log('👤 Customer name:', customerName);
      console.log('🔑 Using API Key:', MYFATOORAH_CONFIG.apiKey.substring(0, 20) + '...');
      console.log('🌍 Environment:', MYFATOORAH_CONFIG.isLive ? 'LIVE' : 'TEST');
      
      const initiateSessionRequest = new MFInitiateSessionRequest(customerName);
      
      const success: MFInitiateSessionResponse = await MFSDK.initiateSession(initiateSessionRequest);
      console.log('✅ Session initiated successfully:', success);
      
      setSessionId(success.SessionId?.toString() || null);
      setSessionResponse(success);
      setIsWhitelisted(true); // Session success means whitelist is working
      
      // Set loading to false first, then try to load card view
      setLoading(false);
      
      // Try to load card view if it's ready, otherwise it will be loaded when ready
      if (cardViewReady && cardPaymentView.current) {
        console.log('✅ Card view is ready, loading immediately...');
        await loadCardView(success);
      } else {
        console.log('⏳ Card view not ready yet, will load when ready...');
        // The card view will be loaded when the ref callback sets cardViewReady to true
      }
    } catch (error) {
      console.error('❌ Error initiating session:', error);
      console.error('❌ Session error details:', JSON.stringify(error, null, 2));
      
      // Check if it's an authentication error
      const errorMessage = (error as any)?.message || 'خطأ غير معروف';
      if (errorMessage.includes('authorization token') || errorMessage.includes('incorrect or expired')) {
        console.error('🔑 API Key issue detected. Please check:');
        console.error('1. API Key is valid and not expired');
        console.error('2. Environment setting matches API Key type (test/live)');
        console.error('3. Country setting is correct');
        
        setError('خطأ في مفتاح API: يرجى التحقق من إعدادات MyFatoorah أو تجربة مفتاح API جديد');
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        setError('خطأ في الاتصال: يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى');
      } else if (errorMessage.includes('whitelist') || errorMessage.includes('IP')) {
        setIsWhitelisted(false);
        setError('أنت غير مسموح لك بالدفع الإلكتروني حالياً. يرجى التواصل مع الدعم الفني لإضافة عنوان IP الخاص بك إلى القائمة البيضاء.');
      } else {
        setError('فشل في تهيئة جلسة الدفع: ' + errorMessage);
      }
      setLoading(false);
    }
  };

  // Load card view
  const loadCardView = async (initiateSessionResponse: MFInitiateSessionResponse) => {
    try {
      console.log('💳 Loading card view...');
      console.log('🔍 Card payment view ref:', cardPaymentView.current);
      
      // Wait a bit for the ref to be properly set
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!cardPaymentView.current && attempts < maxAttempts) {
        console.log(`⏳ Waiting for card view ref... Attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      if (cardPaymentView.current) {
        console.log('✅ Card payment view ref found, loading...');
        await cardPaymentView.current.load(
          initiateSessionResponse,
          (bin: string) => console.log('💳 BIN detected:', bin)
        );
        console.log('✅ Card view loaded successfully');
        setLoading(false);
      } else {
        console.error('❌ Card payment view ref still not available after waiting');
        throw new Error('Card payment view not initialized - ref not available');
      }
    } catch (error) {
      console.error('❌ Error loading card view:', error);
      setError('فشل في تحميل نموذج البطاقة: ' + (error as any)?.message || 'خطأ غير معروف');
      setLoading(false);
    }
  };

  // Payment card style configuration
  const paymentCardStyle = () => {
    const cardViewInput = new MFCardViewInput(
      processColor('#4CAF50'), // Border color - green theme
      16, // Border width
      MFFontFamily.SansSerif,
      50, // Border radius
      0, // Border style
      processColor('#f5f5f5'), // Background color - light gray
      0, // Shadow radius - no shadow
      0, // Shadow offset - no shadow
      new MFBoxShadow(0, 0, 0, 0, processColor('transparent')), // No shadow
      new MFCardViewPlaceHolder('اسم حامل البطاقة', 'رقم البطاقة', 'MM / YY', 'CVV')
    );

    const cardViewLabel = new MFCardViewLabel(
      true, // Show labels
      processColor('#333333'), // Label color - dark gray
      14, // Font size
      MFFontFamily.SansSerif, // Font family
      MFFontWeight.Bold, // Font weight - make it bold for better visibility
      new MFCardViewText('اسم حامل البطاقة', 'رقم البطاقة', 'تاريخ الانتهاء', 'رمز الأمان')
    );

    const cardViewError = new MFCardViewError(
      processColor('#f44336'), // Error color - red
      12, // Font size
      new MFBoxShadow(0, 0, 0, 0, processColor('transparent')) // No shadow
    );

    const cardViewStyle = new MFCardViewStyle(
      false, // Is RTL - set to false for left-to-right layout
      'initial', // Initial state
      280, // Height - increased for better appearance
      cardViewInput,
      cardViewLabel,
      cardViewError
    );

    return cardViewStyle;
  };

  // Execute payment
  const pay = async () => {
    if (!sessionId) {
      Alert.alert('خطأ', 'جلسة الدفع غير متوفرة');
      return;
    }

    if (!invoiceData) {
      Alert.alert('خطأ', 'بيانات الفاتورة غير متوفرة');
      return;
    }

    // Custom validation - check if card view is ready
    if (!cardPaymentView.current) {
      Alert.alert('خطأ', 'بطاقة الدفع غير متوفرة');
      return;
    }

    // Check if card view is loaded and ready
    if (!cardViewReady) {
      Alert.alert('خطأ', 'بطاقة الدفع غير جاهزة، يرجى الانتظار');
      return;
    }

    try {

      setPaymentLoading(true);
      console.log('💳 Executing payment...');
      console.log('💰 Amount:', invoiceData.totalPrice);
      console.log('🆔 Session ID:', sessionId);

      const executePaymentRequest = new MFExecutePaymentRequest(invoiceData.totalPrice);
      executePaymentRequest.SessionId = sessionId;

      await cardPaymentView.current.pay(
        executePaymentRequest,
        MFLanguage.ARABIC,
        (invoiceId: string) => {
          console.log('✅ Payment successful! Invoice ID:', invoiceId);
          onEventReturn('invoiceId: ' + invoiceId);
        }
      );
      
      // Payment success callback
      onSuccess({
        invoiceId: 'INV-' + Date.now(),
        status: 'Paid',
        amount: invoiceData.totalPrice,
        message: 'تم الدفع بنجاح'
      });
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      
      // Handle specific validation errors - removed alert popup
      if (error.message?.includes('validation') || error.message?.includes('invalid')) {
        console.log('⚠️ Card validation error - resetting card view details');
        // Reset card view details on validation error
        setCardViewReady(false);
        setSessionResponse(null);
        setSessionId(null);
        // Reinitialize the card view
        setTimeout(() => {
          initializeMyFatoorah();
        }, 1000);
      } else {
        onError(error);
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  // Payment success callback
  const onSuccess = async (result: any) => {
    console.log('✅ Payment completed successfully:', result);
    
    try {
      // Manually update payment status since webhook might not reach server
      const response = await fetch(`${api.defaults.baseURL}/payments/${orderId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await getUserData())?.token}`
        },
        body: JSON.stringify({
          paymentStatus: 'Paid',
          paymentDate: new Date().toISOString(),
          invoiceId: result.invoiceId || result
        })
      });
      
      if (response.ok) {
        console.log('✅ Payment status updated manually');
      } else {
        console.log('⚠️ Manual payment status update failed, but payment was successful');
      }
    } catch (error) {
      console.log('⚠️ Manual payment status update error:', error);
    }
    
    Alert.alert(
      'تم الدفع بنجاح',
      'تم إتمام عملية الدفع بنجاح! سيتم التواصل معك قريباً من قبل المزارع.',
      [
        {
          text: 'حسناً',
          onPress: () => {
            // Navigate back to invoice with success status
            router.replace({
              pathname: '/(tabs)/chats/invoice',
              params: { 
                orderId: orderId,
                paymentSuccess: 'true'
              }
            });
          }
        }
      ]
    );
  };

  // Payment error callback
  const onError = (error: any) => {
    console.error('❌ Payment failed:', error);
    Alert.alert(
      'فشل في الدفع',
      error.message || 'حدث خطأ أثناء عملية الدفع. يرجى المحاولة مرة أخرى.',
      [
        {
          text: 'حسناً',
          onPress: () => {
            // Navigate back to invoice with error status
            router.replace({
              pathname: '/(tabs)/chats/invoice',
              params: { 
                orderId: orderId,
                paymentError: 'true'
              }
            });
          }
        }
      ]
    );
  };

  // Payment event return callback
  const onEventReturn = (result: string) => {
    console.log('📱 Payment event return:', result);
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  if (loading) {
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
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>الدفع الإلكتروني</Text>
            </View>
          </View>
        </View>

        {/* Loading Content */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>جاري تحضير نموذج الدفع...</Text>
        </View>
      </View>
    );
  }

  if (error) {
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
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>الدفع الإلكتروني</Text>
            </View>
          </View>
        </View>

        {/* Error Content */}
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              fetchInvoiceData();
            }}
          >
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
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
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>الدفع الإلكتروني</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>المبلغ المطلوب</Text>
          <Text style={styles.amountValue}>
            {invoiceData?.totalPrice || 0} ريال
          </Text>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <MaterialIcons name="security" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            جميع المعاملات محمية ومشفرة. بياناتك آمنة معنا.
          </Text>
        </View>

        {/* Whitelist Status */}
        {isWhitelisted === false && (
          <View style={styles.whitelistNotice}>
            <MaterialIcons name="warning" size={20} color="#ff9800" />
            <Text style={styles.whitelistText}>
              أنت غير مسموح لك بالدفع الإلكتروني حالياً. يرجى التواصل مع الدعم الفني.
            </Text>
          </View>
        )}

        {/* MyFatoorah Card Payment View */}
        <View style={styles.cardViewContainer}>
          <Text style={styles.cardViewTitle}>بيانات البطاقة</Text>
          

          
          <MFCardPaymentView
            ref={(ref) => {
              console.log('🔗 Setting card payment view ref:', ref);
              cardPaymentView.current = ref;
              if (ref) {
                setCardViewReady(true);
                console.log('✅ Card view is ready');
              }
            }}
            paymentStyle={paymentCardStyle()}
            style={styles.cardView}
          />
        </View>


      </ScrollView>

      {/* Payment Button */}
      <View style={styles.paymentButtonContainer}>
        <TouchableOpacity
          style={[styles.paymentButton, (paymentLoading || isWhitelisted === false) && styles.disabledButton]}
          onPress={pay}
          activeOpacity={0.8}
          disabled={paymentLoading || isWhitelisted === false}
        >
          {paymentLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
              <>
                <MaterialIcons name="payment" size={24} color="#FFFFFF" />
                <Text style={styles.paymentButtonText}>
                  {isWhitelisted === false 
                    ? 'غير مسموح بالدفع الإلكتروني' 
                    : `ادفع الآن ${invoiceData?.totalPrice || 0} ريال`
                  }
                </Text>
              </>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 20,
  },
  amountContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'left',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 8,
    textAlign: 'right',
  },
  whitelistNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  whitelistText: {
    flex: 1,
    fontSize: 14,
    color: '#ff9800',
    marginRight: 8,
    textAlign: 'right',
  },
  cardViewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    marginLeft: 20, // Add margin-left to move labels to the right
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginLeft: 10, // Add margin-left to move title to the left
    textAlign: 'right',
  },
  cardView: {
    height: 280,
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'right',
  },
  paymentButtonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  customLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
});

export default PaymentScreen;
