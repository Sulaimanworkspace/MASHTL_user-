import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface SecurityIconProps {
  size?: number;
  color?: string;
  type: 'shield' | 'lock' | 'fingerprint' | 'qr-code' | 'security' | 'key' | 'eye' | 'eye-slash';
}

const SecurityIcon: React.FC<SecurityIconProps> = ({ 
  size = 24, 
  color = '#2E8B57',
  type 
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'shield':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M9 12L11 14L15 10"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'lock':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              ry="2"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        );

      case 'fingerprint':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M12 6C10.34 6 9 7.34 9 9C9 10.66 10.34 12 12 12C13.66 12 15 10.66 15 9C15 7.34 13.66 6 12 6Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        );

      case 'qr-code':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect
              x="3"
              y="3"
              width="5"
              height="5"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="16"
              y="3"
              width="5"
              height="5"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="3"
              y="16"
              width="5"
              height="5"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M21 16H19V18H21V16Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M19 21H21V19H19V21Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M16 19H18V21H16V19Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M8 8H10V10H8V8Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M10 10H12V12H10V10Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M8 12H10V14H8V12Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M12 8H14V10H12V8Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M14 10H16V12H14V10Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M12 12H14V14H12V12Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        );

      case 'security':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M9 12L11 14L15 10"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="12"
              r="3"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        );

      case 'key':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15.75 5.25C16.1642 5.25 16.5 4.91421 16.5 4.5C16.5 4.08579 16.1642 3.75 15.75 3.75C15.3358 3.75 15 4.08579 15 4.5C15 4.91421 15.3358 5.25 15.75 5.25Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M6.75 6.75L3 10.5V12H4.5L6.75 9.75L9 12H10.5L6.75 8.25L3 12V10.5L6.75 6.75Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M12 12L15 15L18 12L21 15V18H18L15 15L12 18L9 15L6 18V15L9 12L12 15L15 12L18 15L21 12V9L18 12L15 9L12 12Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        );

      case 'eye':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Circle
              cx="12"
              cy="12"
              r="3"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        );

      case 'eye-slash':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M2 2L22 22"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M6.71 6.71C4.08 8.58 2 12 2 12S6 20 12 20C14.42 20 16.58 19.08 18.29 17.29"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SecurityIcon; 