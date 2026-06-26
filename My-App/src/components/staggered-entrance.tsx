import type { PropsWithChildren } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

type Props = PropsWithChildren<{
  index: number;
  offset?: number;
}>;

export function StaggeredEntrance({ children, index, offset = 40 }: Props) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * offset)
        .duration(250)
        .springify()
        .damping(18)}
    >
      {children}
    </Animated.View>
  );
}
