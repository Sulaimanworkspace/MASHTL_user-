// Temporarily disabled for Expo Go compatibility
// import { MFSDK, MFEnvironment, MFCountry, MFLanguage } from 'myfatoorah-reactnative';

            // MyFatoorah configuration
            const MYFATOORAH_CONFIG = {
              // Production environment
              apiKey: '9jY7LLAvUANRpa99yySItWj7v1BMFE_s9fwncYSlqAhiI8tgcUQID6U9humtIMPWwH8IuODoa0FRpfwa05gfJbQs9lYdZyIojDu5MpRhXG9eJI0t0hMfWfqLFBNUh0M8-3dCmaMwnoZzISjnHeYPF5PJAYqhooNayPdHTlsu2aXL7R4oQWFHkj2f4sm_LkWBaFwzOCzHU5Y-XRPyuSEN6U_lMsNZMWWlar-e-5pA9Qs8u7LOSHs2gcOGVzlVvBi57wQkZlDYqpDS4pZlYaoudaQiXhQesEYL7QZ234er1-h671Sx57ehHnYKJIs-eZiuPXC1wZc9tpzJ0AD9PvhXZcj4ml3eyjC6AkpqTOhZbPCEjIU64SEvvDocSdxQC-5tc1Bw9w0ADYh-qJRhHQwnec0O2ogYiLQFaYLrmeflyufrsrqRI_vD9fWjfc7gZG5d48CjZreL8jmteVleQReBi_TYEeJdRC2TvIi7jfHk3j10obhPtdKjKz53lFnvuR-nqVkqBNtRPZcZwFlk_NgnlK3rmjKrjGEUrXQSfIjyfPRRs1IiO8mZWvSzY3gzhXwxHOESiBZ6Y3jQtq0p20utxpBm_l9Xl98BIWYWIDrOnCQ7MxdXEvsI7rj1pns1BQ76dDYQn-zEqV8I73eExZU59mDZKdw7GKGmy-L5yEPDggOKeBUwgybO7dR7HpA1zp1PcD_9kZOkC3f0pFnd0fG088I8ruerD-suIvzA1mtHJTYeiIHG',
              isLive: true, // Production environment
              country: 'SA', // Saudi Arabia
              currency: 'SAR'
            };

class PaymentService {
  constructor() {
    // Temporarily disabled for Expo Go compatibility
    // Initialize MyFatoorah SDK
    // MFSDK.init(
    //   MYFATOORAH_CONFIG.apiKey,
    //   MFCountry.SAUDIARABIA,
    //   MYFATOORAH_CONFIG.isLive ? MFEnvironment.LIVE : MFEnvironment.TEST
    // );
  }

  // Initialize payment for service order
  async initializeOrderPayment(orderData: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    serviceTitle: string;
    serviceDescription: string;
  }) {
    try {
      console.log('💳 Initializing MyFatoorah order payment:', orderData.orderId);
      
      // Create payment request object
      const paymentRequest = {
        InvoiceAmount: orderData.amount,
        CurrencyIso: 'SAR',
        CustomerName: orderData.customerName,
        CustomerEmail: orderData.customerEmail,
        CustomerPhone: orderData.customerPhone,
        CustomerAddress: {
          Block: 'Block 1',
          Street: 'Main Street',
          HouseBuildingNo: '123',
          Address: orderData.customerAddress,
          AddressInstructions: 'Riyadh'
        },
        InvoiceItems: [{
          ItemName: orderData.serviceTitle,
          Quantity: 1,
          UnitPrice: orderData.amount
        }],
        CallBackUrl: 'https://your-app.com/user/order/payment/callback',
        ErrorUrl: 'https://your-app.com/user/order/payment/error',
        Language: 'ar',
        DisplayCurrencyIso: 'SAR',
        CustomerReference: orderData.orderId,
        SourceInfo: 'Mashtl User App'
      };

      // Temporarily disabled for Expo Go compatibility
      // const result = await MFSDK.initiatePayment(paymentRequest as any, MFLanguage.ARABIC);
      // console.log('✅ Order payment initialized successfully:', result);
      // return result;
      
      // Mock response for development
      console.log('✅ Order payment initialized successfully (mock):', paymentRequest);
      return { success: true, paymentId: 'mock-payment-id', message: 'Payment initialized (mock)' };
    } catch (error) {
      console.error('❌ Error initializing order payment:', error);
      throw error;
    }
  }

  // Execute payment
  async executePayment(executeData: {
    paymentId: string;
    paymentMethodId: number;
    sessionId: string;
    customerName: string;
    invoiceValue: number;
  }) {
    try {
      console.log('💳 Executing payment:', executeData.paymentId);
      
      const executeRequest = {
        PaymentId: executeData.paymentId,
        PaymentMethodId: executeData.paymentMethodId,
        SessionId: executeData.sessionId,
        CustomerName: executeData.customerName,
        InvoiceValue: executeData.invoiceValue,
        DisplayCurrencyIso: 'SAR',
        Language: 'ar',
        CallBackUrl: 'https://your-app.com/user/payment/callback',
        ErrorUrl: 'https://your-app.com/user/payment/error'
      };
      
      // Temporarily disabled for Expo Go compatibility
      // const result = await MFSDK.executePayment(executeRequest as any, MFLanguage.ARABIC, (invoiceId: string) => {
      //   console.log('Invoice created:', invoiceId);
      // });
      
      // console.log('✅ Payment executed successfully:', result);
      // return result;
      
      // Mock response for development
      console.log('✅ Payment executed successfully (mock):', executeRequest);
      return { success: true, invoiceId: 'mock-invoice-id', message: 'Payment executed (mock)' };
    } catch (error) {
      console.error('❌ Error executing payment:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(invoiceId: string) {
    try {
      console.log('🔍 Getting payment status for invoice:', invoiceId);
      
      const statusRequest = {
        Key: invoiceId,
        KeyType: '1' // InvoiceId
      };
      
      // Temporarily disabled for Expo Go compatibility
      // const result = await MFSDK.getPaymentStatus(statusRequest as any, MFLanguage.ARABIC);
      // console.log('✅ Payment status retrieved:', result);
      // return result;
      
      // Mock response for development
      console.log('✅ Payment status retrieved (mock):', statusRequest);
      return { success: true, status: 'Paid', message: 'Payment status retrieved (mock)' };
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      throw error;
    }
  }

  // Initialize payment for wallet top-up
  async initializeWalletTopUp(topUpData: {
    topUpId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  }) {
    try {
      console.log('💳 Initializing MyFatoorah wallet top-up:', topUpData.topUpId);
      
      const paymentRequest = {
        InvoiceAmount: topUpData.amount,
        CurrencyIso: 'SAR',
        CustomerName: topUpData.customerName,
        CustomerEmail: topUpData.customerEmail,
        CustomerPhone: topUpData.customerPhone,
        CustomerAddress: {
          Block: 'Block 1',
          Street: 'Main Street',
          HouseBuildingNo: '123',
          Address: 'Saudi Arabia',
          AddressInstructions: 'Riyadh'
        },
        InvoiceItems: [{
          ItemName: 'شحن المحفظة',
          Quantity: 1,
          UnitPrice: topUpData.amount
        }],
        CallBackUrl: 'https://your-app.com/user/wallet/topup/callback',
        ErrorUrl: 'https://your-app.com/user/wallet/topup/error',
        Language: 'ar',
        DisplayCurrencyIso: 'SAR',
        CustomerReference: topUpData.topUpId,
        SourceInfo: 'Mashtl User App - Wallet Top-up'
      };

      // Temporarily disabled for Expo Go compatibility
      // const result = await MFSDK.initiatePayment(paymentRequest as any, MFLanguage.ARABIC);
      // console.log('✅ Wallet top-up payment initialized successfully:', result);
      // return result;
      
      // Mock response for development
      console.log('✅ Wallet top-up payment initialized successfully (mock):', paymentRequest);
      return { success: true, paymentId: 'mock-topup-id', message: 'Wallet top-up initialized (mock)' };
    } catch (error) {
      console.error('❌ Error initializing wallet top-up payment:', error);
      throw error;
    }
  }

  // Get available payment methods
  async getPaymentMethods(amount: number) {
    try {
      console.log('💳 Getting available payment methods for amount:', amount);
      
      // This would typically call the MyFatoorah API to get payment methods
      // For now, return a mock response
      const mockPaymentMethods = [
        { id: 1, name: 'بطاقة ائتمان', icon: 'credit-card' },
        { id: 2, name: 'بطاقة مدى', icon: 'mada' },
        { id: 3, name: 'Apple Pay', icon: 'apple-pay' },
        { id: 4, name: 'STC Pay', icon: 'stc-pay' },
        { id: 5, name: 'Google Pay', icon: 'google-pay' }
      ];
      
      console.log('✅ Payment methods retrieved:', mockPaymentMethods);
      return mockPaymentMethods;
    } catch (error) {
      console.error('❌ Error getting payment methods:', error);
      throw error;
    }
  }

  // Process subscription payment
  async processSubscriptionPayment(subscriptionData: {
    subscriptionId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    planName: string;
    duration: string;
  }) {
    try {
      console.log('💳 Processing subscription payment:', subscriptionData.subscriptionId);
      
      const paymentRequest = {
        InvoiceAmount: subscriptionData.amount,
        CurrencyIso: 'SAR',
        CustomerName: subscriptionData.customerName,
        CustomerEmail: subscriptionData.customerEmail,
        CustomerPhone: subscriptionData.customerPhone,
        CustomerAddress: {
          Block: 'Block 1',
          Street: 'Main Street',
          HouseBuildingNo: '123',
          Address: 'Saudi Arabia',
          AddressInstructions: 'Riyadh'
        },
        InvoiceItems: [{
          ItemName: `اشتراك ${subscriptionData.planName} - ${subscriptionData.duration}`,
          Quantity: 1,
          UnitPrice: subscriptionData.amount
        }],
        CallBackUrl: 'https://your-app.com/user/subscription/payment/callback',
        ErrorUrl: 'https://your-app.com/user/subscription/payment/error',
        Language: 'ar',
        DisplayCurrencyIso: 'SAR',
        CustomerReference: subscriptionData.subscriptionId,
        SourceInfo: 'Mashtl User App - Subscription Payment'
      };

      // Temporarily disabled for Expo Go compatibility
      // const result = await MFSDK.initiatePayment(paymentRequest as any, MFLanguage.ARABIC);
      // console.log('✅ Subscription payment processed successfully:', result);
      // return result;
      
      // Mock response for development
      console.log('✅ Subscription payment processed successfully (mock):', paymentRequest);
      return { success: true, paymentId: 'mock-subscription-id', message: 'Subscription payment processed (mock)' };
    } catch (error) {
      console.error('❌ Error processing subscription payment:', error);
      throw error;
    }
  }
}

export default new PaymentService(); 