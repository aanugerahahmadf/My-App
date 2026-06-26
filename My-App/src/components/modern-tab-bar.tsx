import { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, useColorScheme, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '@/constants/theme';
import { PressableScale } from '@/components/pressable-scale';

const TABS = [
  { name: 'index', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'order', label: 'Pesanan', icon: 'receipt-outline', activeIcon: 'receipt' },
  { name: 'messages', label: 'Chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
  { name: 'cart', label: 'Keranjang', icon: 'cart-outline', activeIcon: 'cart' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
] as const;

const TAB_NAMES = ['index', 'order', 'messages', 'cart', 'profile'];
const CENTER_INDEX = 2;

export default function ModernTabBar({ state, navigation }: any) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const tint = '#3b82f6';
  const bgColors = Colors[isDark ? 'dark' : 'light'];

  const currentRoute = state.routes[state.index]?.name;
  if (!TAB_NAMES.includes(currentRoute)) return null;

  const barBg = isDark ? '#1C1C1E' : '#F8F9FE';

  return (
    <View style={styles.wrapperOuter}>
      <View style={[styles.wrapper, { backgroundColor: barBg }]}>
        <Content {...{ state, navigation, isDark, tint, bgColors }} />
      </View>
    </View>
  );
}

function Content({ state, navigation, isDark, tint, bgColors }: any) {
  const tabLayouts = useRef<number[]>([]);
  const indicatorOffset = useSharedValue(0);

  const activeIndex = state.index;

  const updateIndicator = (index: number) => {
    const x = tabLayouts.current[index];
    if (x !== undefined) {
      indicatorOffset.value = withSpring(x, {
        damping: 18,
        stiffness: 180,
        mass: 1,
      });
    }
  };

  useEffect(() => {
    updateIndicator(activeIndex);
  }, [activeIndex]);

  const animatedIndicator = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorOffset.value }],
    width: 44,
  }));

  return (
    <View style={styles.content}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;
        const isFocused = state.index === index;
        const isCenter = index === CENTER_INDEX;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        const onLayout = (e: LayoutChangeEvent) => {
          const x = e.nativeEvent.layout.x;
          tabLayouts.current[index] = x;
          if (index === activeIndex) indicatorOffset.value = x;
        };

          if (isCenter) {
          return (
            <PressableScale key={route.name} onPress={onPress} scaleIn={0.9} style={styles.tabItem}>
              <View onLayout={onLayout} style={[styles.centerIcon, { backgroundColor: tint }]}>
                <Ionicons
                  name={isFocused ? tab.activeIcon : tab.icon}
                  size={28}
                  color="#fff"
                />
              </View>
            </PressableScale>
          );
        }

        return (
          <PressableScale
            key={route.name}
            onPress={onPress}
            scaleIn={0.9}
            style={styles.tabItem}
          >
            <View onLayout={onLayout} style={styles.iconWrap}>
              <Ionicons
                name={isFocused ? tab.activeIcon : tab.icon}
                size={isFocused ? 24 : 22}
                color={isFocused ? tint : bgColors.textSecondary}
              />
            </View>
          </PressableScale>
        );
      })}

      <Animated.View
        style={[styles.indicator, { backgroundColor: tint + '20' }, animatedIndicator]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperOuter: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 12,
    left: 16,
    right: 16,
  },
  wrapper: {
    width: '100%',
    borderRadius: 22,
    ...Shadows.lg,
    overflow: 'visible',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 62,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    zIndex: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    height: 44,
    borderRadius: 14,
    top: 9,
    zIndex: 1,
  },
  centerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
});
