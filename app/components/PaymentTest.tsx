import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import PaymentService from '../services/payment';

interface DemoCard {
  type: string;
  number: string;
  expiry: string;
  cvc: string;
  result: string;
}

const demoCards: DemoCard[] = [
  { type: 'Knet', number: '8888880000000001', expiry: '09/25', cvc: '1234', result: 'Captured' },
  { type: 'Visa/Master', number: '4508750015741019', expiry: '12/25', cvc: '123', result: 'Success' },
  { type: 'Visa/Master', number: '5454545454545454', expiry: '12/25', cvc: '123', result: 'Success' },
  { type: 'Visa/Master', number: '5453010000095539', expiry: '12/25', cvc: '300', result: 'Success' },
  { type: 'Visa/Master', number: '5123450000000008', expiry: '12/25', cvc: '123', result: 'Success' },
  { type: 'Visa/Master', number: '5457210001000019', expiry: '12/25', cvc: '212', result: 'Success' },
  { type: 'Visa/Master', number: '4012001037141112', expiry: '12/24', cvc: '207', result: 'Success' },
  { type: 'Benefit', number: '4600410123456789', expiry: '12/25', cvc: '123456', result: 'Captured' },
  { type: 'Benefit', number: '4550120123456789', expiry: '12/25', cvc: '123456', result: 'Expired card' },
  { type: 'Benefit', number: '4845550123456789', expiry: '12/25', cvc: '123456', result: 'Incorrect PIN' },
  { type: 'Benefit', number: '4575550123456789', expiry: '12/25', cvc: '123456', result: 'Refer to Issuer' },
  { type: 'Benefit', number: '4895550123456789', expiry: '12/25', cvc: '123456', result: 'Please contact issuer' },
  { type: 'AMEX', number: '345678901234564', expiry: '05/21', cvc: '1000', result: 'Unspecified Failure' },
  { type: 'AMEX', number: '345678901234564', expiry: '04/37', cvc: '123', result: 'Declined' },
  { type: 'Mada', number: '4464040000000007', expiry: '02/29', cvc: '123', result: 'Capture' },
  { type: 'Mada', number: '5297412542005689', expiry: '05/25', cvc: '350', result: 'Success' },
];

const PaymentTest: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<DemoCard | null>(null);
  const [amount, setAmount] = useState('10.00');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const testPayment = async (card: DemoCard) => {
    setLoading(true);
    setSelectedCard(card);
    
    try {
      console.log(`🧪 Testing payment with ${card.type} card: ${card.number}`);
      
      // Test 1: Initialize payment
      const paymentData = {
        orderId: `test-${Date.now()}`,
        amount: parseFloat(amount),
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+966501234567',
        customerAddress: 'Riyadh, Saudi Arabia',
        serviceTitle: 'Test Service Payment',
        serviceDescription: 'Test payment for MyFatoorah integration'
      };

      console.log('💳 Initializing payment...');
      const initResult = await PaymentService.initializeOrderPayment(paymentData);
      
      const result = `✅ ${card.type} (${card.number}): Payment initialized successfully\n   Expected: ${card.result}\n   Response: ${JSON.stringify(initResult, null, 2)}`;
      
      setTestResults(prev => [...prev, result]);
      Alert.alert('Success', `Payment initialized for ${card.type} card`);
      
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const result = `❌ ${card.type} (${card.number}): ${errorMessage}\n   Expected: ${card.result}`;
      
      setTestResults(prev => [...prev, result]);
      Alert.alert('Error', `Payment failed for ${card.type} card: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testPaymentMethods = async () => {
    setLoading(true);
    try {
      console.log('💳 Testing payment methods...');
      const methods = await PaymentService.getPaymentMethods(parseFloat(amount));
      const result = `✅ Payment methods retrieved: ${methods.length} methods available`;
      setTestResults(prev => [...prev, result]);
      Alert.alert('Success', `Found ${methods.length} payment methods`);
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const result = `❌ Payment methods test failed: ${errorMessage}`;
      setTestResults(prev => [...prev, result]);
      Alert.alert('Error', `Payment methods test failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setSelectedCard(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 MyFatoorah Payment Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Configuration</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount (SAR)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Payment Methods</Text>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testPaymentMethods}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test Payment Methods'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Cards Test</Text>
        <Text style={styles.description}>
          Tap a card to test payment initialization
        </Text>
        
        {demoCards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cardButton,
              selectedCard === card && styles.selectedCard
            ]}
            onPress={() => testPayment(card)}
            disabled={loading}
          >
            <Text style={styles.cardType}>{card.type}</Text>
            <Text style={styles.cardNumber}>{card.number}</Text>
            <Text style={styles.cardDetails}>
              {card.expiry} | CVC: {card.cvc}
            </Text>
            <Text style={styles.expectedResult}>Expected: {card.result}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No test results yet</Text>
        ) : (
          testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          ))
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing payment...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardNumber: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  cardDetails: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  expectedResult: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  resultItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});

export default PaymentTest; 