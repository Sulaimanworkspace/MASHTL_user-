#!/bin/bash

echo "🔄 APNs Key Recovery Script"
echo "=========================="
echo ""

echo "❌ Current situation:"
echo "   - Key ID: K3496JJ9YZ"
echo "   - Name: firebase apn"
echo "   - Status: Cannot download from portal"
echo ""

echo "🔧 Solutions to try:"
echo "1. Try Safari browser (works better with Apple)"
echo "2. Clear browser cache and cookies"
echo "3. Use private/incognito mode"
echo "4. Try on iPhone/iPad"
echo "5. Contact Apple Developer Support"
echo ""

echo "🚨 If you can't download the current key:"
echo "   - You'll need to create a NEW key"
echo "   - The current key (K3496JJ9YZ) will be lost"
echo ""

read -p "Do you want to try creating a new key? (y/n): " choice

if [[ $choice == "y" || $choice == "Y" ]]; then
    echo ""
    echo "🆕 Creating new APNs key..."
    open "https://developer.apple.com/account/resources/authkeys/add"
    
    echo ""
    echo "📋 Steps for new key:"
    echo "1. Click 'Create an API Key'"
    echo "2. Name: 'MASHTL APNs Key v2'"
    echo "3. ✅ Check 'Apple Push Notifications service (APNs)'"
    echo "4. Click 'Continue' then 'Register'"
    echo "5. Download the new .p8 file"
    echo "6. Place it in this directory"
    echo ""
    
    echo "⏳ Press Enter when you have the new key file..."
    read -p "> "
    
    if ls AuthKey_*.p8 1> /dev/null 2>&1; then
        NEW_KEY_FILE=$(ls AuthKey_*.p8 | head -1)
        NEW_KEY_ID=$(echo $NEW_KEY_FILE | sed 's/AuthKey_\(.*\)\.p8/\1/')
        
        echo "✅ New key created:"
        echo "   File: $NEW_KEY_FILE"
        echo "   Key ID: $NEW_KEY_ID"
        
        # Move to ios directory
        if [ -d "ios" ]; then
            mv "$NEW_KEY_FILE" "ios/"
            echo "📁 Moved to: ios/$NEW_KEY_FILE"
        fi
        
        echo ""
        echo "🔥 Update Firebase with new key:"
        echo "   - Key ID: $NEW_KEY_ID"
        echo "   - File: ios/$NEW_KEY_FILE"
        
    else
        echo "❌ No new key file found"
    fi
else
    echo ""
    echo "💡 Try these download methods first:"
    echo "   - Safari browser"
    echo "   - Clear browser cache"
    echo "   - Private/incognito mode"
    echo "   - Different device"
fi

