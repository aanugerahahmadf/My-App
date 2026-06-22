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

type PackageItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  image_url?: string;
  category?: { id: number; name: string };
};

export default function PackagesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const [items, setItems] = useState<CbirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res: any = await apiGet(API.PACKAGES.ALL);
      const list = res.data || res || [];
      const mapped = list.map((p: PackageItem) => ({
        id: p.id,
        type: 'package' as const,
        name: p.name,
        image: p.image_url || '',
        price: Number(p.discount_price || p.price || 0),
      }));
      setItems(mapped);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat paket bunga');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPackages();
  }, [fetchPackages]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPackages();
  };

  const handlePress = (item: CbirItem) => {
    router.push(`/(home)/cbir?filter=package&detail=${item.id}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Katalog Paket Bunga
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