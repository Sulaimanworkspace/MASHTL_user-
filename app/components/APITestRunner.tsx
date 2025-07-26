import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MyFatoorahAPITest from '../utils/MyFatoorahAPITest';

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  response?: any;
  error?: string;
  duration: number;
}

const APITestRunner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      const apiTest = new MyFatoorahAPITest();
      const testResults = await apiTest.runAllTests();
      setResults(testResults);
      
      const successful = testResults.filter(r => r.success);
      const failed = testResults.filter(r => !r.success);
      
      Alert.alert(
        'Test Complete',
        `✅ Successful: ${successful.length}\n❌ Failed: ${failed.length}\n📈 Success Rate: ${((successful.length / testResults.length) * 100).toFixed(1)}%`
      );
      
    } catch (error: any) {
      Alert.alert('Error', `Test failed: ${error.message}`);
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  const runSpecificTest = async (testName: string, testFunction: () => Promise<TestResult>) => {
    setLoading(true);
    setCurrentTest(testName);
    
    try {
      const apiTest = new MyFatoorahAPITest();
      const result = await testFunction.call(apiTest);
      setResults([result]);
      
      if (result.success) {
        Alert.alert('Success', `${testName} completed successfully in ${result.duration}ms`);
      } else {
        Alert.alert('Failed', `${testName} failed: ${result.error}`);
      }
      
    } catch (error: any) {
      Alert.alert('Error', `${testName} failed: ${error.message}`);
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (success: boolean) => {
    return success ? '#28a745' : '#dc3545';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 MyFatoorah API v2 Test Runner</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Controls</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runAllTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading && currentTest === 'All Tests' ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Individual Tests</Text>
        
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => runSpecificTest('Get Banks', () => new MyFatoorahAPITest().testGetBanks())}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>GET /v2/GetBanks</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => runSpecificTest('Get Currencies', () => new MyFatoorahAPITest().testGetCurrenciesExchangeList())}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>GET /v2/GetCurrenciesExchangeList</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => runSpecificTest('Initiate Payment', () => new MyFatoorahAPITest().testInitiatePayment())}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>POST /v2/InitiatePayment</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => runSpecificTest('Get Countries', () => new MyFatoorahAPITest().testGetCountries())}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>GET /v2/GetCountries</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => runSpecificTest('Get Cities', () => new MyFatoorahAPITest().testGetCities())}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>GET /v2/GetCities</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => runSpecificTest('Get Suppliers', () => new MyFatoorahAPITest().testGetSuppliers())}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>GET /v2/GetSuppliers</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <Text style={styles.resultCount}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {results.length === 0 ? (
          <Text style={styles.noResults}>No test results yet</Text>
        ) : (
          results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultStatus}>
                  {getStatusIcon(result.success)} {result.method} {result.endpoint}
                </Text>
                <Text style={[styles.resultDuration, { color: getStatusColor(result.success) }]}>
                  {result.duration}ms
                </Text>
              </View>
              
              {result.success ? (
                <Text style={styles.resultResponse}>
                  Response: {JSON.stringify(result.response, null, 2)}
                </Text>
              ) : (
                <Text style={styles.resultError}>
                  Error: {result.error}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {currentTest ? `Running ${currentTest}...` : 'Running tests...'}
          </Text>
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
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 12,
    color: '#6c757d',
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
    borderLeftWidth: 4,
    borderLeftColor: '#dee2e6',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultResponse: {
    fontSize: 12,
    color: '#28a745',
    fontFamily: 'monospace',
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 4,
  },
  resultError: {
    fontSize: 12,
    color: '#dc3545',
    fontFamily: 'monospace',
    backgroundColor: '#f8d7da',
    padding: 8,
    borderRadius: 4,
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

export default APITestRunner; 