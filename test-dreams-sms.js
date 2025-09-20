// Test Dreams SMS Integration
// Run this with: node test-dreams-sms.js

// Since we're in a Node.js environment, we'll create a simple test
// that simulates the Dreams SMS API calls

const https = require('https');

// Test configuration - your actual Dreams SMS credentials
  const testConfig = {
    username: 'Nwahtech',
    secretKey: 'd9877b42793f4a0adc2104000f38e0216f08e1f6cc342a3e381fd0f5509d8e37',
    sender: 'nwahtech'
  };

// Simple Dreams SMS API test functions
function makeRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams(data).toString();
    
    const options = {
      hostname: 'www.dreams.sa',
      port: 443,
      path: `/index.php/api/sendsms`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testDreamsSms() {
  console.log('🧪 Testing Dreams SMS Integration...\n');

  try {
    // Test 1: Check account validity
    console.log('1️⃣ Testing account validity...');
    const accountResult = await makeRequest('chk_user', {
      user: testConfig.username,
      secret_key: testConfig.secretKey
    });
    console.log('Account check result:', accountResult);
    console.log('');

    // Test 2: Check balance
    console.log('2️⃣ Testing balance check...');
    const balanceResult = await makeRequest('chk_balance', {
      user: testConfig.username,
      secret_key: testConfig.secretKey
    });
    console.log('Balance check result:', balanceResult);
    console.log('');

    // Test 3: Send test SMS
    console.log('3️⃣ Testing SMS sending...');
    const testPhone = '0500600945'; // Your phone number
    const testMessage = 'رمز التحقق الخاص بك هو: 123456\n\nلا تشارك هذا الرمز مع أي شخص.\n\nمع تحيات فريق مشتال';
    const smsResult = await makeRequest('sendsms', {
      user: testConfig.username,
      secret_key: testConfig.secretKey,
      to: testPhone,
      message: testMessage,
      sender: testConfig.sender
    });
    console.log('SMS result:', smsResult);
    console.log('');

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testDreamsSms();
