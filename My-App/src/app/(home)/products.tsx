import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet } from '@/lib/api-client';
import CbirGrid, { CbirItem } from '@/components/cbir-grid';
import { PressableScale } from '@/components/pressable-scale';
import FilterSheet, { FilterState } from '@/components/filter-sheet';
import { Ionicons } from '@expo/vector-icons';

type ProductItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  image_url?: string;
  category?: { id: number; name: string };
  on_sale?: boolean;
  created_at?: string;
};

const DEFAULT_FILTER: FilterState = {
  sort: 'newest',
  categoryId: null,
  discount: 'all',
};

export default function ProductsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const [items, setItems] = useState<CbirItem[]>([]);
  const [rawItems, setRawItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res: any = await apiGet(API.PRODUCTS.ALL);
      const list = res.data || res || [];
      setRawItems(list);
      setItems(list.map((p: ProductItem) => ({
        id: p.id,
        type: 'product' as const,
        name: p.name,
        image: p.image_url || '',
        price: Number(p.discount_price || p.price || 0),
      })));
    } catch (e: any) {
      setError(e.message || 'Gagal memuat katalog bunga');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handlePress = (item: CbirItem) => {
    router.push(`/(home)/cbir?filter=product&detail=${item.id}` as any);
  };

  const handleApplyFilter = (f: FilterState) => {
    setFilters(f);
    let filtered = [...rawItems];

    // Filter by category
    if (f.categoryId) {
      filtered = filtered.filter((p) => p.category?.id === f.categoryId);
    }

    // Filter by discount
    if (f.discount === 'discount') {
      filtered = filtered.filter((p) => p.discount_price && Number(p.discount_price) < Number(p.price));
    } else if (f.discount === 'no_discount') {
      filtered = filtered.filter((p) => !p.discount_price);
    }

    // Sort
    switch (f.sort) {
      case 'price_low':
        filtered.sort((a, b) => Number(a.discount_price || a.price || 0) - Number(b.discount_price || b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => Number(b.discount_price || b.price || 0) - Number(a.discount_price || a.price || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
    }

    setItems(filtered.map((p) => ({
      id: p.id,
      type: 'product' as const,
      name: p.name,
      image: p.image_url || '',
      price: Number(p.discount_price || p.price || 0),
    })));
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sort !== 'newest') count++;
    if (filters.categoryId) count++;
    if (filters.discount !== 'all') count++;
    return count;
  }, [filters]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Katalog Bunga</Text>
        <PressableScale onPress={() => setShowFilter(true)} scaleIn={0.9} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? '#3b82f6' : colors.textSecondary} />
          {activeFilterCount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{activeFilterCount}</Text></View>
          )}
        </PressableScale>
      </View>
      <CbirGrid
        items={items}
        loading={loading}
        error={error}
        onPress={handlePress}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)} onApply={handleApplyFilter} current={filters} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.three, paddingBottom: Spacing.two,
    borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  title: { fontSize: 18, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter' },
  filterBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
