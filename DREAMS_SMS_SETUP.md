# 🚀 Dreams SMS Integration Setup

This guide will help you integrate the **Dreams SMS API** with your signup flow to send OTP messages.

## 📋 Prerequisites

1. **Dreams SMS Account** - Sign up at [https://www.dreams.sa](https://www.dreams.sa)
2. **API Credentials** - Get your username, secret key, and sender name
3. **Account Activation** - Activate your account using the activation code

## ⚙️ Configuration

### Step 1: Update Credentials

Edit `config/dreamsSms.ts` and replace the placeholder values:

```typescript
export const dreamsSmsConfig = {
  username: 'YOUR_ACTUAL_USERNAME',        // Your Dreams SMS username
  secretKey: 'YOUR_ACTUAL_SECRET_KEY',    // Your Dreams SMS secret key
  sender: 'MASHTL',                       // Your sender name (max 11 chars)
};
```

### Step 2: Test the Integration

Run the test file to verify your credentials work:

```bash
node test-dreams-sms.js
```

## 🔧 How It Works

### 1. **OTP Generation**
- When user requests OTP, a 6-digit code is generated
- The code is sent via Dreams SMS API

### 2. **SMS Sending**
- Uses the `/sendsms/` endpoint from Dreams API
- Sends Arabic/English message with OTP code
- Handles all error responses from Dreams API

### 3. **Fallback System**
- If Dreams SMS fails, falls back to your existing API
- Ensures OTP delivery even if Dreams SMS is down

## 📱 Message Templates

### OTP Message (Arabic)
```
رمز التحقق الخاص بك هو: 123456

لا تشارك هذا الرمز مع أي شخص.

مع تحيات فريق مشتال
```

### Welcome Message (Arabic)
```
مرحباً [اسم المستخدم]!

أهلاً وسهلاً بك في تطبيق مشتال.

تم إنشاء حسابك بنجاح.

مع تحيات فريق مشتال
```

## 🚨 Important Notes

### Security
- **NEVER** commit real credentials to git
- Use environment variables in production
- The OTP is currently returned in response (remove for production)

### Rate Limiting
- Dreams SMS has daily sending limits per sender
- Monitor your balance regularly
- Handle rate limit errors gracefully

### Error Handling
- All Dreams SMS error codes are mapped to Arabic messages
- Network errors fall back to your existing API
- Log all SMS operations for debugging

## 🔍 Testing

### Test Account Validity
```typescript
const accountResult = await dreamsSmsService.checkAccount();
```

### Test Balance
```typescript
const balanceResult = await dreamsSmsService.checkBalance();
```

### Test SMS Sending
```typescript
const smsResult = await dreamsSmsService.sendSms('+966501234567', 'Test message');
```

## 📊 Monitoring

### Check Balance Regularly
```typescript
// Add this to your dashboard or admin panel
const balance = await dreamsSmsService.checkBalance();
if (balance.balance < 100) {
  // Send low balance alert
}
```

### Log SMS Operations
```typescript
console.log('SMS sent:', {
  to: phone,
  messageId: smsResult.messageId,
  timestamp: new Date().toISOString(),
  success: smsResult.success
});
```

## 🆘 Troubleshooting

### Common Issues

1. **Invalid Credentials** (-110)
   - Check username and secret key
   - Ensure account is activated

2. **Low Balance** (-113)
   - Recharge your Dreams SMS account
   - Check balance before sending

3. **Sender Not Available** (-115)
   - Verify sender name is approved
   - Check sender status in Dreams dashboard

4. **Network Errors**
   - Check internet connection
   - Verify Dreams SMS API is accessible
   - Check firewall settings

### Support
- **Dreams SMS Support**: [https://www.dreams.sa](https://www.dreams.sa)
- **API Documentation**: [https://www.dreams.sa/apisdocs](https://www.dreams.sa/apisdocs)

## 🎯 Next Steps

1. ✅ Update credentials in `config/dreamsSms.ts`
2. ✅ Test with `node test-dreams-sms.js`
3. ✅ Test OTP sending in your app
4. ✅ Remove OTP from response (security)
5. ✅ Add balance monitoring to dashboard
6. ✅ Set up error alerts for low balance

---

**Happy coding! 🚀**

Your signup flow now sends OTP messages through the reliable Dreams SMS gateway! 📱✨
