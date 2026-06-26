import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost } from '@/lib/api-client';
import CbirGrid, { CbirItem } from '@/components/cbir-grid';

export default function CbirScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { q, image, filter } = useLocalSearchParams<{
    q?: string;
    image?: string;
    filter?: string;
  }>();
  const [items, setItems] = useState<CbirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [title, setTitle] = useState('');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handlePress = useCallback((item: CbirItem) => {
    const route = item.type === 'package' ? `/(packages)/${item.id}` : `/(products)/${item.id}`;
    router.push(route as any);
  }, [router]);

  const mapItem = (p: any): CbirItem => {
    const src = p.data || p;
    return {
      id: src.id || p.id,
      type: p.type || src.type || 'product',
      name: src.name || '',
      image: src.image_url || src.image || p.image_url || p.image || '',
      price: Number(src.discount_price || src.price || p.discount_price || p.price || 0),
      similarity: p.similarity ?? p.score ?? src.similarity ?? src.score,
    };
  };

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const wishRes: any = await apiGet(API.WISHLIST.INDEX).catch(() => ({ data: [] }));
      const wl: any[] = wishRes?.data || wishRes || [];
      const wlIds = new Set<string>(wl.map((w: any) => `${w.resource_type || w.type || 'product'}-${w.product_id || w.package_id || w.id}`));
      setWishlistIds(wlIds);

      if (filter === 'package') {
        const res: any = await apiGet(API.PACKAGES.ALL);
        const list = res.data || res || [];
        setItems(list.map((p: any) => ({ ...p, type: 'package' })).map(mapItem));
        setTitle('Katalog Paket Bunga');
      } else if (filter === 'product') {
        const res: any = await apiGet(API.PRODUCTS.ALL);
        const list = res.data || res || [];
        setItems(list.map((p: any) => ({ ...p, type: 'product' })).map(mapItem));
        setTitle('Katalog Bunga');
      } else if (!q && !image) {
        const [pkgRes, prodRes] = await Promise.all([
          apiGet(API.PACKAGES.ALL),
          apiGet(API.PRODUCTS.ALL),
        ]);
        const packages = ((pkgRes as any).data || pkgRes || []).map((p: any) => ({ ...p, type: 'package' }));
        const products = ((prodRes as any).data || prodRes || []).map((p: any) => ({ ...p, type: 'product' }));
        const combined = [...packages.map(mapItem), ...products.map(mapItem)];
        combined.sort((a, b) => b.price - a.price);
        setItems(combined);
        setTitle('Semua Katalog');
      } else if (filter === 'favorites') {
        const res: any = await apiGet(API.WISHLIST.INDEX);
        const list = res.data || res || [];
        setItems(
          list.map((p: any) => ({
            id: p.id,
            type: p.type || 'product',
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
            similarity: p.similarity ?? p.score,
          }))
        );
        setTitle('Favorite');
      } else if (image) {
        const formData = new FormData();
        const filename = image.split('/').pop() || 'photo.jpg';
        const ext = filename.split('.').pop() || 'jpg';
        formData.append('image', {
          uri: image,
          type: `image/${ext}`,
          name: filename,
        } as any);

        const res: any = await apiPost(API.CBIR.SEARCH, formData);
        const results = res.results || res.data || [];
        setItems(results.map(mapItem));
        setTitle('Hasil Pencarian Gambar');
      } else if (q) {
        const res: any = await apiGet(
          `${API.SEARCH.TEXT}?q=${encodeURIComponent(q)}`
        );
        const body = res.data || res;
        const packages = (body.packages || []).map((p: any) => ({ ...p, type: 'package' }));
        const products = (body.products || []).map((p: any) => ({ ...p, type: 'product' }));
        const combined = [...packages, ...products];
        combined.sort((a, b) => b.price - a.price);
        setItems(combined.map(mapItem));
        setTitle(`Hasil: "${q}"`);
      }
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [q, image, filter]);

  const toggleWishlist = useCallback(async (item: CbirItem) => {
    const key = `${item.type}-${item.id}`;
    try {
      const body: any = {};
      if (item.type === 'product') body.product_id = item.id;
      else body.package_id = item.id;
      await apiPost(API.WISHLIST.TOGGLE, body);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    } catch {}
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    performSearch();
  }, [performSearch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          {title || 'Content Based Image Retrieval'}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <CbirGrid items={items} loading={loading} error={error} onPress={handlePress} onToggleWishlist={toggleWishlist} wishlistIds={wishlistIds} />
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
