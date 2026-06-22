import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet } from '@/lib/api-client';
import CbirGrid, { CbirItem } from '@/components/cbir-grid';

export default function FavoritesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const [items, setItems] = useState<CbirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Favorite
        </Text>
      </View>
      <CbirGrid
        items={items}
        loading={loading}
        error={error}
        onPress={handlePress}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
});