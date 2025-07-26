import axios from 'axios';

// MyFatoorah API Configuration
const MYFATOORAH_CONFIG = {
  apiKey: '9jY7LLAvUANRpa99yySItWj7v1BMFE_s9fwncYSlqAhiI8tgcUQID6U9humtIMPWwH8IuODoa0FRpfwa05gfJbQs9lYdZyIojDu5MpRhXG9eJI0t0hMfWfqLFBNUh0M8-3dCmaMwnoZzISjnHeYPF5PJAYqhooNayPdHTlsu2aXL7R4oQWFHkj2f4sm_LkWBaFwzOCzHU5Y-XRPyuSEN6U_lMsNZMWWlar-e-5pA9Qs8u7LOSHs2gcOGVzlVvBi57wQkZlDYqpDS4pZlYaoudaQiXhQesEYL7QZ234er1-h671Sx57ehHnYKJIs-eZiuPXC1wZc9tpzJ0AD9PvhXZcj4ml3eyjC6AkpqTOhZbPCEjIU64SEvvDocSdxQC-5tc1Bw9w0ADYh-qJRhHQwnec0O2ogYiLQFaYLrmeflyufrsrqRI_vD9fWjfc7gZG5d48CjZreL8jmteVleQReBi_TYEeJdRC2TvIi7jfHk3j10obhPtdKjKz53lFnvuR-nqVkqBNtRPZcZwFlk_NgnlK3rmjKrjGEUrXQSfIjyfPRRs1IiO8mZWvSzY3gzhXwxHOESiBZ6Y3jQtq0p20utxpBm_l9Xl98BIWYWIDrOnCQ7MxdXEvsI7rj1pns1BQ76dDYQn-zEqV8I73eExZU59mDZKdw7GKGmy-L5yEPDggOKeBUwgybO7dR7HpA1zp1PcD_9kZOkC3f0pFnd0fG088I8ruerD-suIvzA1mtHJTYeiIHG',
  baseURL: 'https://api.myfatoorah.com',
  isLive: true
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

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  response?: any;
  error?: string;
  duration: number;
}

class MyFatoorahAPITest {
  private results: TestResult[] = [];

  // Helper method to make API calls
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT', data?: any): Promise<TestResult> {
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
      
      const result: TestResult = {
        endpoint,
        method,
        success: true,
        response: response?.data,
        duration
      };

      console.log(`✅ ${method} ${endpoint} - Success (${duration}ms)`);
      return result;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
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
  async testGetBanks(): Promise<TestResult> {
    return await this.makeRequest('/v2/GetBanks', 'GET');
  }

  async testGetCurrenciesExchangeList(): Promise<TestResult> {
    return await this.makeRequest('/v2/GetCurrenciesExchangeList', 'GET');
  }

  // Payment Operations
  async testInitiatePayment(): Promise<TestResult> {
    const paymentData = {
      InvoiceAmount: 10.00,
      CurrencyIso: 'SAR',
      CustomerName: 'Test Customer',
      CustomerEmail: 'test@example.com',
      CustomerPhone: '+966501234567',
      CustomerAddress: {
        Block: 'Block 1',
        Street: 'Main Street',
        HouseBuildingNo: '123',
        Address: 'Riyadh, Saudi Arabia',
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
      DisplayCurrencyIso: 'SAR',
      CustomerReference: `test-${Date.now()}`,
      SourceInfo: 'Mashtl Test'
    };

    return await this.makeRequest('/v2/InitiatePayment', 'POST', paymentData);
  }

  async testInitiateSession(): Promise<TestResult> {
    const sessionData = {
      SessionId: `session-${Date.now()}`,
      InvoiceAmount: 10.00,
      CurrencyIso: 'SAR',
      CustomerName: 'Test Customer',
      CustomerEmail: 'test@example.com',
      CustomerPhone: '+966501234567'
    };

    return await this.makeRequest('/v2/InitiateSession', 'POST', sessionData);
  }

  async testGetPaymentStatus(): Promise<TestResult> {
    const statusData = {
      Key: 'test-invoice-key',
      KeyType: '1' // InvoiceId
    };

    return await this.makeRequest('/v2/GetPaymentStatus', 'POST', statusData);
  }

  // Shipping Operations
  async testGetCountries(): Promise<TestResult> {
    return await this.makeRequest('/v2/GetCountries', 'GET');
  }

  async testGetCities(): Promise<TestResult> {
    return await this.makeRequest('/v2/GetCities', 'GET');
  }

  async testCalculateShippingCharge(): Promise<TestResult> {
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
  async testGetSuppliers(): Promise<TestResult> {
    return await this.makeRequest('/v2/GetSuppliers', 'GET');
  }

  async testCreateSupplier(): Promise<TestResult> {
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
  async testGetDepositedInvoices(): Promise<TestResult> {
    const reportData = {
      FromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      ToDate: new Date().toISOString().split('T')[0], // Today
      PageSize: 10,
      PageNumber: 1
    };

    return await this.makeRequest('/v2/GetDepositedInvoices', 'POST', reportData);
  }

  // Webhook Operations
  async testGetWebhooks(): Promise<TestResult> {
    return await this.makeRequest('/v2/GetWebhooks', 'POST');
  }

  // Sessions Operations
  async testCreateSession(): Promise<TestResult> {
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
  async testMakeRefund(): Promise<TestResult> {
    const refundData = {
      InvoiceId: 'test-invoice-id',
      Amount: 5.00,
      Reason: 'Test refund'
    };

    return await this.makeRequest('/v2/MakeRefund', 'POST', refundData);
  }

  // Run all tests
  async runAllTests(): Promise<TestResult[]> {
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
  printSummary(): void {
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
  }

  // Get test results
  getResults(): TestResult[] {
    return this.results;
  }

  // Clear results
  clearResults(): void {
    this.results = [];
  }
}

export default MyFatoorahAPITest; 