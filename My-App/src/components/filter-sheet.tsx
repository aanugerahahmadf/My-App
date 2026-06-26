import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useColorScheme,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '@/constants/theme';
import { PressableScale } from './pressable-scale';
import { apiGet } from '@/lib/api-client';
import { API } from '@/lib/endpoints';

export type FilterState = {
  sort: 'newest' | 'price_low' | 'price_high';
  categoryId: number | null;
  discount: 'all' | 'discount' | 'no_discount';
};

const SORT_OPTIONS = [
  { key: 'newest', label: 'Terbaru', icon: 'time-outline' },
  { key: 'price_low', label: 'Harga Termurah', icon: 'trending-down-outline' },
  { key: 'price_high', label: 'Harga Termahal', icon: 'trending-up-outline' },
] as const;

const DEFAULT_FILTER: FilterState = {
  sort: 'newest',
  categoryId: null,
  discount: 'all',
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  current?: FilterState;
};

export default function FilterSheet({ visible, onClose, onApply, current }: Props) {
  const scheme = useColorScheme();
  const barBg = scheme === 'dark' ? '#1C1C1E' : '#F8F9FE';
  const [filters, setFilters] = useState<FilterState>(current || DEFAULT_FILTER);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (visible) {
      setFilters(current || DEFAULT_FILTER);
      apiGet(API.CATEGORIES)
        .then((res: any) => setCategories(res.data || []))
        .catch(() => {});
    }
  }, [visible]);

  const active = filters.sort !== 'newest' || filters.categoryId !== null || filters.discount !== 'all';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: barBg }]}>
          <View style={[styles.handle, { backgroundColor: scheme === 'dark' ? '#444' : '#ddd' }]} />
          <Text style={[styles.title, { color: scheme === 'dark' ? '#fff' : '#111' }]}>Filter</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} nestedScrollEnabled>
            {/* Urutkan */}
            <Text style={[styles.sectionTitle, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>Urutkan</Text>
            <View style={styles.row}>
              {SORT_OPTIONS.map((opt) => (
                <PressableScale
                  key={opt.key}
                  onPress={() => setFilters((f) => ({ ...f, sort: opt.key as FilterState['sort'] }))}
                  scaleIn={0.95}
                  style={[
                    styles.chip,
                    { borderColor: scheme === 'dark' ? '#444' : '#ddd' },
                    filters.sort === opt.key && styles.chipActive,
                  ]}
                >
                  <Ionicons name={opt.icon as any} size={16} color={filters.sort === opt.key ? '#3b82f6' : '#888'} />
                  <Text style={[styles.chipLabel, { color: '#888' }, filters.sort === opt.key && styles.chipLabelActive]}>
                    {opt.label}
                  </Text>
                </PressableScale>
              ))}
            </View>

            {/* Kategori */}
            <Text style={[styles.sectionTitle, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <PressableScale
                onPress={() => setFilters((f) => ({ ...f, categoryId: null }))}
                scaleIn={0.95}
                style={[styles.chip, { borderColor: scheme === 'dark' ? '#444' : '#ddd' }, !filters.categoryId && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, { color: '#888' }, !filters.categoryId && styles.chipLabelActive]}>Semua</Text>
              </PressableScale>
              {categories.map((cat) => (
                <PressableScale
                  key={cat.id}
                  onPress={() => setFilters((f) => ({ ...f, categoryId: cat.id }))}
                  scaleIn={0.95}
                  style={[styles.chip, { borderColor: scheme === 'dark' ? '#444' : '#ddd' }, filters.categoryId === cat.id && styles.chipActive]}
                >
                  <Text style={[styles.chipLabel, { color: '#888' }, filters.categoryId === cat.id && styles.chipLabelActive]}>{cat.name}</Text>
                </PressableScale>
              ))}
            </ScrollView>

            {/* Diskon */}
            <Text style={[styles.sectionTitle, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>Diskon</Text>
            <View style={styles.row}>
              {(['discount', 'no_discount'] as const).map((val) => (
                <PressableScale
                  key={val}
                  onPress={() => setFilters((f) => (f.discount === val ? { ...f, discount: 'all' } : { ...f, discount: val }))}
                  scaleIn={0.95}
                  style={[styles.chip, { borderColor: scheme === 'dark' ? '#444' : '#ddd' }, filters.discount === val && styles.chipActive]}
                >
                  <Ionicons name="pricetag-outline" size={16} color={filters.discount === val ? '#3b82f6' : '#888'} />
                  <Text style={[styles.chipLabel, { color: '#888' }, filters.discount === val && styles.chipLabelActive]}>
                    {val === 'discount' ? 'Sedang Diskon' : 'Tanpa Diskon'}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <PressableScale
              onPress={() => { setFilters(DEFAULT_FILTER); onApply(DEFAULT_FILTER); onClose(); }}
              style={[styles.resetBtn, { borderColor: scheme === 'dark' ? '#444' : '#ddd' }]}
              scaleIn={0.97}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: scheme === 'dark' ? '#fff' : '#111' }}>Reset</Text>
            </PressableScale>
            <PressableScale
              onPress={() => { onApply(filters); onClose(); }}
              style={[styles.applyBtn, { backgroundColor: '#3b82f6' }]}
              scaleIn={0.97}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Terapkan Filter</Text>
            </PressableScale>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1,
  },
  chipActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6' + '15',
  },
  chipLabel: { fontSize: 13 },
  chipLabelActive: { color: '#3b82f6', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  resetBtn: {
    flex: 1, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  applyBtn: {
    flex: 2, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
});
