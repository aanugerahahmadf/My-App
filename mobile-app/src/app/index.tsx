import { useRouter } from 'expo-router';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/article/article-4.png')}
        style={styles.bgImage}
        resizeMode="cover"
      />

      <View style={styles.overlay}>
        <View style={[styles.topSection, { paddingTop: insets.top + 60 }]}>
          <Text style={styles.title}>
            Dekorasi{'\n'}Bunga{'\n'}Pernikahan
          </Text>
          <Text style={styles.subtitle}>
            Temukan inspirasi dekorasi bunga pernikahan impian Anda
          </Text>
        </View>

        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 40 }]}>
          <Pressable style={styles.signInBtn} onPress={() => router.replace('/(auth)/sign-in')}>
            <Text style={styles.signInText}>Masuk</Text>
          </Pressable>
          <Pressable style={styles.signUpBtn} onPress={() => router.replace('/(auth)/sign-up')}>
            <Text style={styles.signUpText}>Daftar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    ...StyleSheet.absoluteFill,
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'space-between',
  },
  topSection: {
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 48,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    maxWidth: '80%',
  },
  bottomSection: {
    paddingHorizontal: 28,
    gap: 14,
  },
  signInBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signInText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  signUpBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
