#!/bin/bash

echo "=== APNs Key Creation and Download Script ==="
echo "This script will help you create and download APNs keys for MASHTL"
echo ""

# Function to check if we have authentication
check_auth() {
    echo "Checking authentication methods..."
    
    # Check if we have stored credentials
    if security find-generic-password -s "Apple Developer" 2>/dev/null; then
        echo "✅ Found stored Apple Developer credentials"
        return 0
    fi
    
    # Check if we have API key
    if [ -d "~/.appstoreconnect/private_keys" ] || [ -d "./private_keys" ]; then
        echo "✅ Found API key directory"
        return 0
    fi
    
    echo "❌ No authentication found"
    return 1
}

# Function to authenticate with Apple ID
authenticate() {
    echo ""
    echo "=== Authentication Options ==="
    echo "1. Use Apple ID and password"
    echo "2. Use App Store Connect API key"
    echo "3. Store credentials in keychain"
    echo ""
    
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            read -p "Enter your Apple ID: " apple_id
            read -s -p "Enter your password: " password
            echo ""
            
            # Test authentication
            xcrun altool --list-providers -u "$apple_id" -p "$password" >/dev/null 2>&1
            if [ $? -eq 0 ]; then
                echo "✅ Authentication successful!"
                AUTH_METHOD="apple_id"
                APPLE_ID="$apple_id"
                PASSWORD="$password"
            else
                echo "❌ Authentication failed"
                return 1
            fi
            ;;
        2)
            echo "For API key authentication, you need to:"
            echo "1. Go to https://developer.apple.com/account/resources/authkeys/list"
            echo "2. Create a new key with 'App Manager' role"
            echo "3. Download the .p8 file"
            echo "4. Place it in ~/.appstoreconnect/private_keys/"
            echo ""
            read -p "Press Enter when you have the API key ready..."
            
            if [ -f "~/.appstoreconnect/private_keys/AuthKey_*.p8" ]; then
                echo "✅ API key found!"
                AUTH_METHOD="api_key"
            else
                echo "❌ API key not found"
                return 1
            fi
            ;;
        3)
            read -p "Enter your Apple ID: " apple_id
            read -s -p "Enter your password: " password
            echo ""
            
            # Store in keychain
            security add-generic-password -s "Apple Developer" -a "$apple_id" -w "$password"
            if [ $? -eq 0 ]; then
                echo "✅ Credentials stored in keychain!"
                AUTH_METHOD="keychain"
                APPLE_ID="$apple_id"
            else
                echo "❌ Failed to store credentials"
                return 1
            fi
            ;;
        *)
            echo "Invalid choice"
            return 1
            ;;
    esac
}

# Function to create APNs key via web interface
create_apns_key_web() {
    echo ""
    echo "=== Creating APNs Key via Web Interface ==="
    echo "Since terminal creation is limited, we'll use the web interface:"
    echo ""
    
    # Open the key creation page
    open "https://developer.apple.com/account/resources/authkeys/add"
    
    echo "📋 Instructions:"
    echo "1. The key creation page should now be open in your browser"
    echo "2. Click 'Create an API Key'"
    echo "3. Name: 'MASHTL APNs Key'"
    echo "4. Check 'Apple Push Notifications service (APNs)'"
    echo "5. Click 'Continue' and 'Register'"
    echo "6. Download the .p8 file"
    echo "7. Place it in this directory"
    echo ""
    
    read -p "Press Enter when you have downloaded the key file..."
    
    # Check if key file was downloaded
    if ls AuthKey_*.p8 1> /dev/null 2>&1; then
        KEY_FILE=$(ls AuthKey_*.p8 | head -1)
        echo "✅ Found key file: $KEY_FILE"
        
        # Extract Key ID
        KEY_ID=$(echo $KEY_FILE | sed 's/AuthKey_\(.*\)\.p8/\1/')
        echo "Key ID: $KEY_ID"
        
        # Move to ios directory
        if [ -d "ios" ]; then
            mv "$KEY_FILE" "ios/"
            echo "✅ Key moved to ios/$KEY_FILE"
        fi
        
        return 0
    else
        echo "❌ No key file found in current directory"
        return 1
    fi
}

# Function to download existing keys
download_existing_keys() {
    echo ""
    echo "=== Downloading Existing Keys ==="
    
    if [ "$AUTH_METHOD" = "apple_id" ]; then
        echo "Listing existing keys..."
        xcrun altool --list-providers -u "$APPLE_ID" -p "$PASSWORD" --output-format json
    elif [ "$AUTH_METHOD" = "keychain" ]; then
        echo "Listing existing keys..."
        xcrun altool --list-providers -u "$APPLE_ID" -p "@keychain:Apple Developer" --output-format json
    else
        echo "API key method doesn't support listing existing keys via terminal"
    fi
}

# Function to configure Firebase
configure_firebase() {
    echo ""
    echo "=== Firebase Configuration ==="
    
    if [ -f "ios/AuthKey_*.p8" ]; then
        KEY_FILE=$(ls ios/AuthKey_*.p8 | head -1)
        KEY_ID=$(echo $KEY_FILE | sed 's/ios\/AuthKey_\(.*\)\.p8/\1/')
        
        echo "✅ APNs key ready for Firebase:"
        echo "   Key file: $KEY_FILE"
        echo "   Key ID: $KEY_ID"
        echo ""
        echo "📋 Firebase Setup Steps:"
        echo "1. Go to Firebase Console > Project Settings > Cloud Messaging"
        echo "2. Click 'Upload' under APNs Authentication Key"
        echo "3. Select the file: $KEY_FILE"
        echo "4. Enter Key ID: $KEY_ID"
        echo "5. Enter your Team ID (found at https://developer.apple.com/account/membership/)"
        echo "6. Enter your Bundle ID (e.g., com.anonymous.mashtl)"
    else
        echo "❌ No APNs key found for Firebase configuration"
    fi
}

# Main execution
main() {
    if check_auth; then
        echo "✅ Authentication ready"
    else
        if authenticate; then
            echo "✅ Authentication successful"
        else
            echo "❌ Authentication failed"
            exit 1
        fi
    fi
    
    # Try to create/download key
    if create_apns_key_web; then
        echo "✅ APNs key created successfully!"
        configure_firebase
    else
        echo "❌ Failed to create APNs key"
        exit 1
    fi
}

# Run main function
main
