import { useCallback, type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type Props = PressableProps & {
  children: ReactNode;
  scaleIn?: number;
};

const springConfig = { damping: 16, stiffness: 300, mass: 0.6 };

export function PressableScale({ children, scaleIn = 0.95, style, ...props }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleIn, springConfig);
  }, [scaleIn]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, springConfig);
  }, []);

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} {...props}>
      <Animated.View style={[animatedStyle, style as ViewStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
