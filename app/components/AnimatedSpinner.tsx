import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedSpinnerProps {
  size?: number;
  color?: string;
  duration?: number;
  visible?: boolean;
}

const AnimatedSpinner: React.FC<AnimatedSpinnerProps> = ({
  size = 24,
  color = '#4CAF50',
  duration = 1000,
  visible = true,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Start rotation animation
      rotation.value = withRepeat(
        withTiming(360, { duration }),
        -1,
        false
      );
      
      // Add subtle scale animation for more visual appeal
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: duration / 2 }),
          withTiming(1, { duration: duration / 2 })
        ),
        -1,
        true
      );
    } else {
      rotation.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [visible, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const circleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(rotation.value, [0, 90, 180, 270, 360], [1, 0.3, 1, 0.3, 1]);
    return {
      opacity,
    };
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.spinner, { width: size, height: size }]}>
        <Animated.View
          style={[
            styles.circle,
            {
              width: size * 0.8,
              height: size * 0.8,
              borderColor: color,
              borderWidth: size * 0.1,
            },
            circleStyle,
          ]}
        />
        <View
          style={[
            styles.innerCircle,
            {
              width: size * 0.4,
              height: size * 0.4,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 50,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  innerCircle: {
    borderRadius: 50,
    opacity: 0.6,
  },
});

export default AnimatedSpinner;
