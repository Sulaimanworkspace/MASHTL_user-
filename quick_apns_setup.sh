#!/bin/bash

echo "🚀 Quick APNs Setup for MASHTL"
echo "================================"
echo ""

# Function to open web interface and wait for download
setup_apns_key() {
    echo "📱 Opening Apple Developer Portal..."
    open "https://developer.apple.com/account/resources/authkeys/add"
    
    echo ""
    echo "🔑 Follow these steps:"
    echo "1. Click 'Create an API Key'"
    echo "2. Name: 'MASHTL APNs Key'"
    echo "3. ✅ Check 'Apple Push Notifications service (APNs)'"
    echo "4. Click 'Continue' then 'Register'"
    echo "5. ⚠️  Download the .p8 file (you can only download once!)"
    echo "6. Place the downloaded file in this directory"
    echo ""
    
    echo "⏳ Waiting for you to download the key..."
    echo "Press Enter when you have the AuthKey_*.p8 file in this directory"
    read -p "> "
    
    # Check for downloaded key
    if ls AuthKey_*.p8 1> /dev/null 2>&1; then
        KEY_FILE=$(ls AuthKey_*.p8 | head -1)
        echo "✅ Found: $KEY_FILE"
        
        # Extract Key ID
        KEY_ID=$(echo $KEY_FILE | sed 's/AuthKey_\(.*\)\.p8/\1/')
        echo "🔑 Key ID: $KEY_ID"
        
        # Move to ios directory
        if [ -d "ios" ]; then
            mv "$KEY_FILE" "ios/"
            echo "📁 Moved to: ios/$KEY_FILE"
        fi
        
        return 0
    else
        echo "❌ No AuthKey_*.p8 file found"
        return 1
    fi
}

# Function to get Team ID
get_team_id() {
    echo ""
    echo "🏢 Getting Team ID..."
    open "https://developer.apple.com/account/membership/"
    
    echo "📋 Find your Team ID on the membership page"
    echo "It's usually a 10-character string like 'ABC123DEF4'"
    echo ""
    read -p "Enter your Team ID: " TEAM_ID
    
    if [[ $TEAM_ID =~ ^[A-Z0-9]{10}$ ]]; then
        echo "✅ Team ID: $TEAM_ID"
        return 0
    else
        echo "❌ Invalid Team ID format (should be 10 characters)"
        return 1
    fi
}

# Function to configure Firebase
setup_firebase() {
    echo ""
    echo "🔥 Firebase Configuration"
    echo "========================"
    
    if [ -f "ios/AuthKey_*.p8" ]; then
        KEY_FILE=$(ls ios/AuthKey_*.p8 | head -1)
        echo "✅ APNs Key: $KEY_FILE"
        echo "🔑 Key ID: $KEY_ID"
        echo "🏢 Team ID: $TEAM_ID"
        echo ""
        
        echo "📋 Firebase Setup Steps:"
        echo "1. Go to: https://console.firebase.google.com/"
        echo "2. Select your MASHTL project"
        echo "3. Go to Project Settings > Cloud Messaging"
        echo "4. Under 'APNs Authentication Key':"
        echo "   - Click 'Upload'"
        echo "   - Select: ios/$KEY_FILE"
        echo "   - Key ID: $KEY_ID"
        echo "   - Team ID: $TEAM_ID"
        echo "   - Bundle ID: com.anonymous.mashtl"
        echo ""
        
        # Open Firebase console
        echo "🚀 Opening Firebase Console..."
        open "https://console.firebase.google.com/"
        
    else
        echo "❌ APNs key not found"
    fi
}

# Function to update app configuration
update_app_config() {
    echo ""
    echo "⚙️  App Configuration"
    echo "===================="
    
    # Check if we have the necessary files
    if [ -f "ios/AuthKey_*.p8" ] && [ ! -z "$KEY_ID" ] && [ ! -z "$TEAM_ID" ]; then
        echo "✅ All required information available:"
        echo "   - APNs Key: $(ls ios/AuthKey_*.p8)"
        echo "   - Key ID: $KEY_ID"
        echo "   - Team ID: $TEAM_ID"
        echo ""
        
        echo "📝 Next steps for your app:"
        echo "1. Open ios/mshtl.xcworkspace in Xcode"
        echo "2. Add the APNs key to your project"
        echo "3. Update your app's push notification settings"
        echo "4. Test push notifications"
        
        # Create a config file with the details
        cat > apns_config.txt << EOF
APNs Configuration for MASHTL
============================
Key File: $(ls ios/AuthKey_*.p8)
Key ID: $KEY_ID
Team ID: $TEAM_ID
Bundle ID: com.anonymous.mashtl

Firebase Setup:
1. Go to Firebase Console > Project Settings > Cloud Messaging
2. Upload the APNs key file
3. Enter Key ID: $KEY_ID
4. Enter Team ID: $TEAM_ID
5. Enter Bundle ID: com.anonymous.mashtl
EOF
        
        echo "📄 Configuration saved to: apns_config.txt"
        
    else
        echo "❌ Missing required information"
    fi
}

# Main execution
main() {
    echo "🎯 Starting APNs setup..."
    
    # Step 1: Create APNs key
    if setup_apns_key; then
        echo "✅ APNs key created successfully!"
    else
        echo "❌ Failed to create APNs key"
        exit 1
    fi
    
    # Step 2: Get Team ID
    if get_team_id; then
        echo "✅ Team ID obtained!"
    else
        echo "❌ Failed to get Team ID"
        exit 1
    fi
    
    # Step 3: Setup Firebase
    setup_firebase
    
    # Step 4: Update app config
    update_app_config
    
    echo ""
    echo "🎉 APNs setup completed!"
    echo "📄 Check apns_config.txt for all the details"
}

# Run main function
main
