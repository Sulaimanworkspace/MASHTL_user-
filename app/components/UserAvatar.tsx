import React, { useState, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface UserAvatarProps {
  avatarUrl?: string;
  size?: number;
  style?: any;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  avatarUrl, 
  size = 48, 
  style 
}) => {
  const [imageError, setImageError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.avatarContainer, containerStyle, style]}>
      {avatarUrl && !imageError ? (
        <Animated.Image 
          source={{ uri: avatarUrl }}
          style={[
            imageStyle,
            { opacity: fadeAnim }
          ]}
          onLoadStart={() => {
            fadeAnim.setValue(0);
          }}
          onLoad={() => {
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }}
          onError={() => {
            setImageError(true);
          }}
        />
      ) : (
        <Image 
          source={require('../../assets/images/icon.png')}
          style={imageStyle}
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

export default UserAvatar; 