# Two-Factor Authentication Testing Guide

## Overview
This guide explains how to test the two-factor authentication (2FA) functionality in the Mashtl user app.

## What's Implemented

### 1. Firebase Configuration
- Firebase SDK installed and configured
- iOS configuration file (`GoogleService-Info.plist`) set up with your app details
- Simplified 2FA functions for testing (not production-ready yet)

### 2. Firebase Login Screen
- **Location**: `app/(tabs)/settings/firebase-login.tsx`
- **Features**:
  - Enable/disable 2FA
  - Phone number input with Saudi format (+966)
  - Verification code input (6 digits)
  - Resend code functionality with 60-second cooldown
  - Status display and security tips

### 3. Test Component
- **Location**: `app/components/TwoFactorTest.tsx`
- Simple test interface for quick functionality verification

## How to Test

### Method 1: Through Settings Menu
1. Open the app
2. Go to Settings (الإعدادات)
3. Tap on "Firebase Login" (🔥 icon)
4. Test the functionality

### Method 2: Direct Navigation
Navigate directly to: `/(tabs)/settings/firebase-login`

## Testing Flow

### 1. Enable 2FA
1. Enter a Saudi phone number (e.g., +966501234567)
2. Tap "Enable Two-Factor Authentication"
3. Check the console for the test verification code
4. Enter the 6-digit code in the verification modal
5. Confirm the setup

### 2. Verify 2FA Status
- The screen will show "Enabled" status
- Your phone number will be displayed
- You can disable 2FA using the red button

### 3. Test Verification
- When 2FA is enabled, you can test the verification process
- Use the "Resend Code" button to get a new test code
- The resend button has a 60-second cooldown

### 4. Disable 2FA
- Tap the red "Disable 2FA" button
- Confirm the action
- The status will change back to "Disabled"

## Console Logs
Check the console for these messages:
- `🔐 Enabling 2FA for: +966XXXXXXXXX`
- `📱 Test verification code: 123456`
- `✅ 2FA code verified successfully`
- `❌ 2FA disabled successfully`

## Current Implementation Status

### ✅ Working Features
- UI/UX complete with Arabic text
- Phone number validation (Saudi format)
- Verification code input and validation
- Enable/disable functionality
- Status persistence using AsyncStorage
- Resend code with cooldown
- Error handling and user feedback
- **Real FCM integration with your Sender ID: 67540842840**
- Push notification support for 2FA codes
- Backend API ready for production deployment

### 🔄 Test Implementation
- FCM messages sent via backend API (localhost:3001)
- Fallback to simulated codes if backend unavailable
- Codes are generated randomly and logged to console
- Real push notifications when backend is running

### 🚧 Next Steps for Production
1. **Get Firebase API Key** from Firebase Console
2. **Download Service Account Key** from Firebase Console
3. **Deploy Backend API** to your server
4. **Update Backend URL** in `fcmService.ts`
5. **Configure VAPID Key** for web push notifications
6. **Add backup codes/recovery** options
7. **Implement proper error handling** for network issues

## Firebase Configuration
The app is configured with:
- **App ID**: 1:67540842840:ios:c2d268a128b96bcc1d8d2d
- **Bundle ID**: mashtl
- **Sender ID**: 67540842840
- **FCM API**: V1 (Enabled)
- **Backend API**: Ready for deployment

## Backend Setup

### 1. Install Dependencies
```bash
cd MASHTL_user-
npm install -g firebase-admin express cors
```

### 2. Download Service Account Key
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save as `service-account-key.json` in your project

### 3. Start Backend Server
```bash
node fcm-backend-example.js
```

### 4. Test Backend
```bash
curl http://localhost:3001/api/health
```

## Troubleshooting

### If 2FA screen doesn't load:
1. Check if you're logged in (2FA requires authentication)
2. Verify the navigation path is correct
3. Check console for any errors

### If verification fails:
1. Check console for the test code
2. Make sure you're entering exactly 6 digits
3. Try resending the code if needed

### If buttons don't respond:
1. Check if loading states are working
2. Verify the component is properly mounted
3. Check for any JavaScript errors in console

## Notes
- This is a test implementation for development purposes
- Real SMS sending will be implemented when moving to production
- The current implementation stores data locally for testing
- All text is in Arabic to match the app's language 