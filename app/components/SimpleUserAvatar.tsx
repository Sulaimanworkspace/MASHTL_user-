import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface SimpleUserAvatarProps {
  avatarUrl?: string;
  size?: number;
  style?: any;
}

const SimpleUserAvatar: React.FC<SimpleUserAvatarProps> = ({ 
  avatarUrl, 
  size = 48, 
  style 
}) => {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.avatarContainer, containerStyle, style]}>
      {avatarUrl ? (
        <Image 
          source={{ uri: avatarUrl }}
          style={containerStyle}
        />
      ) : (
        <Image 
          source={require('../../assets/images/icon.png')}
          style={containerStyle}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  fallbackContainer: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SimpleUserAvatar; 