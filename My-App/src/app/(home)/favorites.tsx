import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  RefreshControl,
  useColorScheme,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost } from '@/lib/api-client';
import CbirGrid, { CbirItem } from '@/components/cbir-grid';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const [items, setItems] = useState<CbirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res: any = await apiGet(API.WISHLIST.INDEX);
      const list = res.data || res || [];
      const mapped = list.map((p: any) => ({
        id: p.id,
        type: (p.type || p.product?.type || 'product') as 'package' | 'product',
        name:
          p.name ||
          p.product?.name ||
          p.package?.name ||
          '',
        image:
          p.image_url ||
          p.image ||
          p.product?.image_url ||
          p.product?.image ||
          p.package?.image_url ||
          p.package?.image ||
          '',
        price: Number(
          p.discount_price ||
            p.price ||
            p.product?.discount_price ||
            p.product?.price ||
            p.package?.discount_price ||
            p.package?.price ||
            0
        ),
      }));
      setItems(mapped);
      const ids = new Set<string>(list.map((w: any) => `${w.resource_type || w.type || 'product'}-${w.product_id || w.package_id || w.id}`));
      setWishlistIds(ids);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat favorite');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFavorites();
  }, [fetchFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handlePress = (item: CbirItem) => {
    router.push(`/(home)/cbir?filter=${item.type}&detail=${item.id}` as any);
  };

  const toggleWishlist = useCallback(async (item: CbirItem) => {
    const key = `${item.type}-${item.id}`;
    try {
      const body: any = {};
      if (item.type === 'product') body.product_id = item.id;
      else body.package_id = item.id;
      await apiPost(API.WISHLIST.TOGGLE, body);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setItems((prev) => prev.filter((i) => `${i.type}-${i.id}` !== key));
    } catch {}
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          Favorite
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <CbirGrid
        items={items}
        loading={loading}
        error={error}
        onPress={handlePress}
        onToggleWishlist={toggleWishlist}
        wishlistIds={wishlistIds}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  title: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
});