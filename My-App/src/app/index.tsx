import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { Image, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(home)');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (isSignedIn) return null;

  return (
    <View className="flex-1 bg-black">
      <Image
        source={require('../../assets/images/article/article-4.png')}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="flex-1 justify-between">
          <View className="px-7" style={{ paddingTop: insets.top + 80 }}>
            <Animated.View entering={FadeIn.duration(600)}>
              <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center mb-6">
                <Text className="text-2xl">💐</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
              <Text className="text-[40px] font-bold text-white leading-[44px] mb-2">
                Dekorasi{'\n'}Bunga{'\n'}Pernikahan
              </Text>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(400).delay(250)}>
              <Text className="text-[15px] text-white/80 leading-[22px] max-w-[85%]">
                Temukan inspirasi dekorasi bunga pernikahan impian Anda
              </Text>
            </Animated.View>
          </View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(400)}
            className="px-7 gap-3.5"
            style={{ paddingBottom: insets.bottom + 40 }}
          >
            <Pressable
              className="bg-white rounded-xl py-4 items-center active:opacity-90"
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text className="text-black text-[16px] font-bold">Masuk</Text>
            </Pressable>

            <Pressable
              className="bg-white/15 rounded-xl py-4 items-center border border-white/30 active:opacity-70"
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <Text className="text-white text-[16px] font-bold">Daftar</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
