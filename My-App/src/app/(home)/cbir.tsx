import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    performSearch();
  }, [performSearch]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title || 'Content Based Image Retrieval'}
        </Text>
      </View>
      <CbirGrid items={items} loading={loading} error={error} />
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
