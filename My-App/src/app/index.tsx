import { useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black">
      <Image
        source={require('@/assets/images/article/article-4.png')}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      <View className="absolute inset-0 bg-black/35 justify-between">
        <View className="px-7" style={{ paddingTop: insets.top + 60 }}>
          <Text className="text-[42px] font-bold text-white leading-[48px] mb-3">
            Dekorasi{'\n'}Bunga{'\n'}Pernikahan
          </Text>
          <Text className="text-[15px] text-white/85 leading-[22px] max-w-[80%]">
            Temukan inspirasi dekorasi bunga pernikahan impian Anda
          </Text>
        </View>

        <View className="px-7 gap-3.5" style={{ paddingBottom: insets.bottom + 40 }}>
          <Pressable className="bg-white rounded-xl py-4 items-center" onPress={() => router.replace('/(auth)/sign-in')}>
            <Text className="text-black text-[16px] font-bold">Masuk</Text>
          </Pressable>
          <Pressable className="bg-white/15 rounded-xl py-4 items-center border border-white/30" onPress={() => router.replace('/(auth)/sign-up')}>
            <Text className="text-white text-[16px] font-bold">Daftar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}