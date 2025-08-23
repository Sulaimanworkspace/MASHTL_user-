# 🔥 Firebase Phone Authentication Setup Guide
## MASHTL User App - Production Ready

### 📱 Quick Start Commands

#### 1. Development Server (LAN Mode)
```bash
# Start development server for LAN debugging
npx expo start --dev-client --lan --clear

# Alternative if you need to clear cache
npx expo start --dev-client --lan
```

#### 2. Native Build (Required for Firebase)
```bash
# Build and run on iOS device
npx expo run:ios --device

# Build and run on Android device
npx expo run:android --device
```

#### 3. Pod Management (iOS Only)
```bash
# If you get pod errors, run these commands:
cd ios
pod deintegrate
pod install
cd ..
```

---

### 🔧 Firebase Configuration

#### Required Files
1. **GoogleService-Info.plist** - Must be in `ios/mshtl/GoogleService-Info.plist`
2. **Bundle ID** - Must match: `com.mashtlapp.user`

#### Firebase Setup Steps
1. ✅ Firebase project configured
2. ✅ Phone Authentication enabled
3. ✅ GoogleService-Info.plist placed correctly
4. ✅ Bundle ID matches in app.json
5. ✅ Native modules installed and linked

---

### 🚨 Common Issues & Solutions

#### Issue: "Native module RNFBAppModule not found"
**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios --device
```

#### Issue: "FirebaseAuth Swift header not found"
**Solution:**
- Use static frameworks in Podfile
- Ensure all Firebase dependencies have modular headers

#### Issue: "Development server not showing up"
**Solution:**
```bash
npx expo start --dev-client --lan --clear
```

#### Issue: "Unmatched routing" for Firebase Login
**Solution:**
- File must be named: `firebaselogin.tsx`
- Route must be: `/(tabs)/settings/firebaselogin`
- Component must be named: `Firebaselogin`

---

### 📋 Required Dependencies

#### Package.json Dependencies
```json
{
  "@react-native-firebase/app": "latest",
  "@react-native-firebase/auth": "latest", 
  "@react-native-firebase/messaging": "latest",
  "@react-native-async-storage/async-storage": "latest"
}
```

#### iOS Podfile Configuration
```ruby
# Add modular headers for Firebase
pod 'FirebaseAuth', :modular_headers => true
pod 'FirebaseCoreInternal', :modular_headers => true
pod 'FirebaseAuthInterop', :modular_headers => true
pod 'FirebaseAppCheckInterop', :modular_headers => true
pod 'FirebaseCore', :modular_headers => true
pod 'FirebaseCoreExtension', :modular_headers => true
pod 'GoogleUtilities', :modular_headers => true
pod 'RecaptchaInterop', :modular_headers => true

# Use static frameworks
use_frameworks! :linkage => :static
```

---

### 🎯 Production Features

#### ✅ What's Working
- Real SMS messages to Saudi numbers (+966)
- Native Firebase Phone Authentication
- Production Firebase configuration
- No mock implementations
- Proper error handling

#### 📱 Testing
1. Open app on device
2. Go to Settings → Firebase Auth
3. Enter Saudi phone number (+966XXXXXXXXX)
4. Receive real SMS verification code
5. Enter code to authenticate

---

### 🔄 Build Process Summary

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Build & Run**
   ```bash
   npx expo run:ios --device
   ```

4. **Development**
   ```bash
   npx expo start --dev-client --lan --clear
   ```

---

### 📞 Support

**Remember:** Always use `--dev-client --lan` for development and `npx expo run:ios --device` for native builds with Firebase.

**Key Files:**
- `app/(tabs)/settings/firebaselogin.tsx` - Firebase Auth UI
- `app/services/firebasePhoneAuth.ts` - Firebase Auth Logic
- `ios/mshtl/GoogleService-Info.plist` - Firebase Config
- `ios/Podfile` - iOS Dependencies

**Production Status:** ✅ READY FOR PRODUCTION 