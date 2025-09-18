#!/bin/bash

echo "=== APNs Key Setup Script ==="
echo "This script will help you set up APNs for your MASHTL app"
echo ""

# Check if the key file exists
if [ -f "AuthKey_*.p8" ]; then
    echo "✅ APNs key file found!"
    KEY_FILE=$(ls AuthKey_*.p8)
    echo "Key file: $KEY_FILE"
    
    # Extract Key ID from filename
    KEY_ID=$(echo $KEY_FILE | sed 's/AuthKey_\(.*\)\.p8/\1/')
    echo "Key ID: $KEY_ID"
    
    # Move to ios directory
    if [ -d "ios" ]; then
        echo "Moving key to ios directory..."
        mv "$KEY_FILE" "ios/"
        echo "✅ Key moved to ios/$KEY_FILE"
        
        echo ""
        echo "=== Next Steps ==="
        echo "1. Add the key to your Xcode project:"
        echo "   - Open ios/mshtl.xcworkspace in Xcode"
        echo "   - Drag the $KEY_FILE into your project"
        echo "   - Make sure 'Copy items if needed' is checked"
        echo ""
        echo "2. Update your app configuration with:"
        echo "   - Key ID: $KEY_ID"
        echo "   - Team ID: (get from Apple Developer portal)"
        echo "   - Bundle ID: (your app's bundle identifier)"
        
    else
        echo "❌ ios directory not found"
    fi
else
    echo "❌ No APNs key file found in current directory"
    echo ""
    echo "=== Instructions to create APNs key ==="
    echo "1. Go to the Apple Developer portal (should be open in your browser)"
    echo "2. Click the '+' button to create a new key"
    echo "3. Give it a name like 'MASHTL APNs Key'"
    echo "4. Check 'Apple Push Notifications service (APNs)'"
    echo "5. Click 'Continue' and then 'Register'"
    echo "6. Download the .p8 file (you can only download once!)"
    echo "7. Place the downloaded file in this directory"
    echo "8. Run this script again"
fi

echo ""
echo "=== For Firebase Configuration ==="
echo "If you're using Firebase, you'll need to:"
echo "1. Go to Firebase Console > Project Settings > Cloud Messaging"
echo "2. Upload the APNs key file"
echo "3. Enter your Key ID and Team ID"
echo ""
echo "Team ID can be found at: https://developer.apple.com/account/membership/"
