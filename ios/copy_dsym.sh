#!/bin/bash

# Script to copy dSYM files for third-party frameworks
echo "🔍 Searching for dSYM files..."

# Set the build directory
BUILD_DIR="${CONFIGURATION_BUILD_DIR}"
DSYM_DIR="${DWARF_DSYM_FOLDER_PATH}"

echo "📁 Build directory: $BUILD_DIR"
echo "📁 dSYM directory: $DSYM_DIR"

# Create dSYM directory if it doesn't exist
mkdir -p "$DSYM_DIR"

# Function to copy dSYM if it exists
copy_dsym() {
    local framework_name="$1"
    local dsym_name="${framework_name}.framework.dSYM"
    
    echo "🔍 Looking for $dsym_name..."
    
    # Search in Pods directory
    find "${PODS_ROOT}" -name "$dsym_name" -type d | while read dsym_path; do
        if [ -d "$dsym_path" ]; then
            echo "✅ Found $dsym_name at: $dsym_path"
            cp -R "$dsym_path" "$DSYM_DIR/"
            echo "✅ Copied $dsym_name to $DSYM_DIR"
        fi
    done
    
    # Also search in build products
    find "$BUILD_DIR" -name "$dsym_name" -type d | while read dsym_path; do
        if [ -d "$dsym_path" ]; then
            echo "✅ Found $dsym_name in build at: $dsym_path"
            cp -R "$dsym_path" "$DSYM_DIR/"
            echo "✅ Copied $dsym_name to $DSYM_DIR"
        fi
    done
}

# Copy specific frameworks that are causing issues
copy_dsym "MFSDK"
copy_dsym "hermes"

# Copy all framework dSYM files
echo "🔍 Copying all framework dSYM files..."
find "${PODS_ROOT}" -name "*.framework.dSYM" -type d | while read dsym_path; do
    framework_name=$(basename "$dsym_path" .dSYM)
    echo "📦 Copying $framework_name dSYM..."
    cp -R "$dsym_path" "$DSYM_DIR/"
done

# Also copy from build directory
find "$BUILD_DIR" -name "*.framework.dSYM" -type d | while read dsym_path; do
    framework_name=$(basename "$dsym_path" .dSYM)
    echo "📦 Copying $framework_name dSYM from build..."
    cp -R "$dsym_path" "$DSYM_DIR/"
done

echo "✅ dSYM copy completed"
echo "📁 Final dSYM directory contents:"
ls -la "$DSYM_DIR" || echo "Directory not found"
