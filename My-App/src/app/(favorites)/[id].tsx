import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';
import Animated, { FadeIn } from 'react-native-reanimated';

type FavoriteItem = {
  id: number;
  type: 'package' | 'product';
  package_id?: number;
  product_id?: number;
  name: string;
  image: string;
  price: number;
};

export default function FavoriteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { t } = useLanguage();

  const [item, setItem] = useState<FavoriteItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiGet(API.WISHLIST.INDEX);
      const list: any[] = res.data || res || [];
      const mapped: FavoriteItem[] = list.map((p: any) => ({
        id: p.id,
        type: p.resource_type as 'package' | 'product',
        package_id: p.package_id,
        product_id: p.product_id,
        name: p.name || '',
        image: p.image_url || p.image || '',
        price: Number(p.discount_price || p.price || 0),
      }));
      const found = mapped.find((f) => f.id === parseInt(id!, 10));
      if (found) setItem(found);
      else setError(t('Favorite not found'));
    } catch (e: any) {
      setError(e.message || t('Failed to load favorite'));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchItem(); }, [id]);

  const handleRemove = () => {
    Alert.alert(t('Remove Favorite'), t('Remove this item from your favorites?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Remove'),
        style: 'destructive',
        onPress: async () => {
          if (!item) return;
          try {
            await apiPost(API.WISHLIST.TOGGLE, {
              ...(item.package_id ? { package_id: item.package_id } : {}),
              ...(item.product_id ? { product_id: item.product_id } : {}),
            });
            router.back();
          } catch {}
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Favorite')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>{error || t('Favorite not found')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const viewOriginalRoute = item.type === 'package' ? `/(packages)/${item.package_id}` : `/(products)/${item.product_id}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Favorite')}</Text>
        <Pressable onPress={handleRemove} style={{ width: 40, alignItems: 'flex-end' }}>
          <Ionicons name="heart-dislike-outline" size={22} color="#ef4444" />
        </Pressable>
      </View>

      <Animated.ScrollView entering={FadeIn.duration(250)} contentContainerStyle={styles.content}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
          </View>
        )}

        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={styles.price}>Rp {item.price.toLocaleString('id-ID')}</Text>

        <Pressable
          style={[styles.viewOriginalBtn, { backgroundColor: colors.backgroundElement }]}
          onPress={() => router.push(viewOriginalRoute as any)}
        >
          <Ionicons name="open-outline" size={16} color={colors.text} />
          <Text style={[styles.viewOriginalText, { color: colors.text }]}>{t('View Original Item')}</Text>
        </Pressable>

        <Pressable onPress={handleRemove} style={styles.removeBtn}>
          <Ionicons name="heart-dislike" size={16} color="#fff" />
          <Text style={styles.removeText}>{t('Remove from Favorites')}</Text>
        </Pressable>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three, padding: Spacing.five },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  content: { padding: Spacing.three, paddingBottom: Spacing.six },
  image: { width: '100%', height: 240, borderRadius: 16, marginBottom: Spacing.three },
  imagePlaceholder: { width: '100%', height: 240, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.three },
  name: { fontSize: 20, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter', marginBottom: Spacing.two },
  price: { fontSize: 22, fontWeight: '800', color: '#ef4444', marginBottom: Spacing.three },
  viewOriginalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8, marginBottom: Spacing.three,
  },
  viewOriginalText: { fontSize: 13, fontWeight: '600' },
  removeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ef4444', borderRadius: 10,
    paddingVertical: 12, justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 15, textAlign: 'center' },
});
