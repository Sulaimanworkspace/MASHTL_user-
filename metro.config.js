const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure Metro to work with physical devices
config.server = {
  port: 8081, // Use standard port
};

// Add resolver configuration for better compatibility
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'mjs'],
};

module.exports = config;
