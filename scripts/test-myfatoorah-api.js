const axios = require('axios');

// MyFatoorah API Configuration
const MYFATOORAH_CONFIG = {
  apiKey: 'rLtt6JWvbUHDDhsZnfpAhpYk4dxYDQkbcPTyGaKp2TYqQgG7FGZ5Th_WD53Oq8Ebz6A53njUoo1w3pjU1D4vs_ZMqFiz_j0urb_BH9Oq9VZoKFoJEDAbRZepGcQanImyYrry7Kt6MnMdgfG5jn4HngWoRdKduNNyP4kzcp3mRv7x00ahkm9LAK7ZRieg7k1PDAnBIOG3EyVSJ5kK4WLMvYr7sCwHbHcu4A5WwelxYK0GMJy37bNAarSJDFQsJ2ZvJjvMDmfWwDVFEVe_5tOomfVNt6bOg9mexbGjMrnHBnKnZR1vQbBtQieDlQepzTZMuQrSuKn-t5XZM7V6fCW7oP-uXGX-sMOajeX65JOf6XVpk29DP6ro8WTAflCDANC193yof8-f5_EYY-3hXhJj7RBXmizDpneEQDSaSz5sFk0sV5qPcARJ9zGG73vuGFyenjPPmtDtXtpx35A-BVcOSBYVIWe9kndG3nclfefjKEuZ3m4jL9Gg1h2JBvmXSMYiZtp9MR5I6pvbvylU_PP5xJFSjVTIz7IQSjcVGO41npnwIxRXNRxFOdIUHn0tjQ-7LwvEcTXyPsHXcMD8WtgBh-wxR8aKX7WPSsT1O8d8reb2aR7K3rkV3K82K_0OgawImEpwSvp9MNKynEAJQS6ZHe_J_l77652xwPNxMRTMASk1ZsJL',
  baseURL: 'https://apitest.myfatoorah.com',
  isLive: false
};

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: MYFATOORAH_CONFIG.baseURL,
  headers: {
    'Authorization': `Bearer ${MYFATOORAH_CONFIG.apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

class MyFatoorahAPITest {
  constructor() {
    this.results = [];
  }

  // Helper method to make API calls
  async makeRequest(endpoint, method, data = null) {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing ${method} ${endpoint}`);
      
      let response;
      if (method === 'GET') {
        response = await apiClient.get(endpoint);
      } else if (method === 'POST') {
        response = await apiClient.post(endpoint, data);
      } else if (method === 'PUT') {
        response = await apiClient.put(endpoint, data);
      }

      const duration = Date.now() - startTime;
      
      const result = {
        endpoint,
        method,
        success: true,
        response: response?.data,
        duration
      };

      console.log(`✅ ${method} ${endpoint} - Success (${duration}ms)`);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result = {
        endpoint,
        method,
        success: false,
        error: error.response?.data?.Message || error.message || 'Unknown error',
        duration
      };

      console.log(`❌ ${method} ${endpoint} - Failed (${duration}ms): ${result.error}`);
      return result;
    }
  }

  // API List Operations
  async testGetBanks() {
    return await this.makeRequest('/v2/GetBanks', 'GET');
  }

  async testGetCurrenciesExchangeList() {
    return await this.makeRequest('/v2/GetCurrenciesExchangeList', 'GET');
  }

  // Payment Operations
  async testInitiatePayment() {
    const paymentData = {
      InvoiceAmount: 10.00,
      CurrencyIso: 'KWD',
      CustomerName: 'Test Customer',
      CustomerEmail: 'test@example.com',
      CustomerPhone: '+966501234567',
      CustomerAddress: {
        Block: 'Block 1',
        Street: 'Main Street',
        HouseBuildingNo: '123',
        Address: 'Kuwait',
        AddressInstructions: 'Test Address'
      },
      InvoiceItems: [{
        ItemName: 'Test Service',
        Quantity: 1,
        UnitPrice: 10.00
      }],
      CallBackUrl: 'https://your-app.com/callback',
      ErrorUrl: 'https://your-app.com/error',
      Language: 'ar',
      DisplayCurrencyIso: 'KWD',
      CustomerReference: `test-${Date.now()}`,
      SourceInfo: 'Mashtl Test'
    };

    return await this.makeRequest('/v2/InitiatePayment', 'POST', paymentData);
  }

  async testInitiateSession() {
    const sessionData = {
      SessionId: `session-${Date.now()}`,
      InvoiceAmount: 10.00,
      CurrencyIso: 'KWD',
      CustomerName: 'Test Customer',
      CustomerEmail: 'test@example.com',
      CustomerPhone: '+966501234567'
    };

    return await this.makeRequest('/v2/InitiateSession', 'POST', sessionData);
  }

  async testGetPaymentStatus() {
    const statusData = {
      Key: 'test-invoice-key',
      KeyType: '1' // InvoiceId
    };

    return await this.makeRequest('/v2/GetPaymentStatus', 'POST', statusData);
  }

  // Shipping Operations
  async testGetCountries() {
    return await this.makeRequest('/v2/GetCountries', 'GET');
  }

  async testGetCities() {
    return await this.makeRequest('/v2/GetCities', 'GET');
  }

  async testCalculateShippingCharge() {
    const shippingData = {
      CountryCode: 'SA',
      CityName: 'Riyadh',
      Weight: 1.5,
      Length: 20,
      Width: 15,
      Height: 10
    };

    return await this.makeRequest('/v2/CalculateShippingCharge', 'POST', shippingData);
  }

  // Supplier Operations
  async testGetSuppliers() {
    return await this.makeRequest('/v2/GetSuppliers', 'GET');
  }

  async testCreateSupplier() {
    const supplierData = {
      Name: 'Test Supplier',
      Email: 'supplier@test.com',
      Phone: '+966501234567',
      Address: 'Riyadh, Saudi Arabia',
      BankAccount: 'SA1234567890123456789012',
      BankName: 'Test Bank'
    };

    return await this.makeRequest('/v2/CreateSupplier', 'POST', supplierData);
  }

  // Reports Operations
  async testGetDepositedInvoices() {
    const reportData = {
      FromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      ToDate: new Date().toISOString().split('T')[0], // Today
      PageSize: 10,
      PageNumber: 1
    };

    return await this.makeRequest('/v2/GetDepositedInvoices', 'POST', reportData);
  }

  // Webhook Operations
  async testGetWebhooks() {
    return await this.makeRequest('/v2/GetWebhooks', 'POST');
  }

  // Sessions Operations
  async testCreateSession() {
    const sessionData = {
      SessionId: `session-${Date.now()}`,
      InvoiceAmount: 10.00,
      CurrencyIso: 'SAR',
      CustomerName: 'Test Customer',
      CustomerEmail: 'test@example.com',
      CustomerPhone: '+966501234567'
    };

    return await this.makeRequest('/v2/sessions', 'POST', sessionData);
  }

  // Refund Operations
  async testMakeRefund() {
    const refundData = {
      InvoiceId: 'test-invoice-id',
      Amount: 5.00,
      Reason: 'Test refund'
    };

    return await this.makeRequest('/v2/MakeRefund', 'POST', refundData);
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting MyFatoorah API v2 Tests...\n');

    const tests = [
      // API List Operations
      () => this.testGetBanks(),
      () => this.testGetCurrenciesExchangeList(),
      
      // Payment Operations
      () => this.testInitiatePayment(),
      () => this.testInitiateSession(),
      () => this.testGetPaymentStatus(),
      
      // Shipping Operations
      () => this.testGetCountries(),
      () => this.testGetCities(),
      () => this.testCalculateShippingCharge(),
      
      // Supplier Operations
      () => this.testGetSuppliers(),
      () => this.testCreateSupplier(),
      
      // Reports Operations
      () => this.testGetDepositedInvoices(),
      
      // Webhook Operations
      () => this.testGetWebhooks(),
      
      // Sessions Operations
      () => this.testCreateSession(),
      
      // Refund Operations
      () => this.testMakeRefund(),
    ];

    for (const test of tests) {
      try {
        const result = await test();
        this.results.push(result);
        
        // Add delay between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Test failed:', error);
      }
    }

    this.printSummary();
    return this.results;
  }

  // Print test summary
  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📈 Success Rate: ${((successful.length / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      failed.forEach(result => {
        console.log(`  - ${result.method} ${result.endpoint}: ${result.error}`);
      });
    }
    
    console.log('\n✅ Successful Tests:');
    successful.forEach(result => {
      console.log(`  - ${result.method} ${result.endpoint} (${result.duration}ms)`);
    });

    console.log('\n📋 Detailed Results:');
    this.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.method} ${result.endpoint}`);
      console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
      console.log(`   Duration: ${result.duration}ms`);
      if (result.success) {
        console.log(`   Response: ${JSON.stringify(result.response, null, 2)}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
    });
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const apiTest = new MyFatoorahAPITest();
  apiTest.runAllTests().catch(console.error);
}

module.exports = MyFatoorahAPITest; 