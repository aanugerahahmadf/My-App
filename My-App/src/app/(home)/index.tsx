import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  RefreshControl,
  Image,
  Platform,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
};

const menuItems: MenuItem[] = [
  {
    id: 'history',
    label: 'History',
    icon: 'time-outline',
    color: '#8b5cf6',
    route: '/(home)/order',
  },
  {
    id: 'packages',
    label: 'Flower Package Catalog',
    icon: 'flower-outline',
    color: '#ec4899',
    route: '/(home)/packages',
  },
  {
    id: 'products',
    label: 'Flower Catalog',
    icon: 'rose-outline',
    color: '#f43f5e',
    route: '/(home)/products',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: 'star-outline',
    color: '#f59e0b',
    route: '/(home)/reviews',
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: 'heart-outline',
    color: '#ef4444',
    route: '/(home)/favorites',
  },
];

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { t } = useLanguage();
  const [homeData, setHomeData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
    Traditional: { icon: 'leaf-outline', color: '#22c55e' },
    Modern: { icon: 'sparkles-outline', color: '#3b82f6' },
    Rustic: { icon: 'earth-outline', color: '#d97706' },
    Minimalist: { icon: 'square-outline', color: '#6b7280' },
    Garden: { icon: 'flower-outline', color: '#ec4899' },
    Royal: { icon: 'diamond-outline', color: '#eab308' },
  };

  const fetchHome = async () => {
    try {
      const [homeRes, catRes] = await Promise.all([
        apiGet(API.HOME),
        apiGet(API.CATEGORIES).catch(() => null),
      ]);
      setHomeData(homeRes.data || homeRes);
      if (catRes?.data) {
        setCategories(catRes.data);
      }
    } catch {
      // silent
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHome();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHome();
  };

  const featured = homeData?.featured_packages || homeData?.featured || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuRow}>
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.menuCard,
              { backgroundColor: colors.backgroundElement },
            ]}
            onPress={() => router.push(item.route as any)}
          >
            <View
              style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}
            >
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('Categories')}
            </Text>
            <Pressable onPress={() => router.push('/(home)/packages')}>
              <Text style={[styles.seeAll, { color: colors.textSecondary }]}>See All</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {categories.map((cat: any) => {
              const meta = CATEGORY_ICONS[cat.name] || { icon: 'grid-outline', color: '#3b82f6' };
              return (
                <Pressable
                  key={cat.id}
                  style={[styles.categoryChip, { backgroundColor: meta.color + '15', borderColor: meta.color + '30' }]}
                  onPress={() => router.push('/(home)/packages')}
                >
                  <Ionicons name={meta.icon as any} size={16} color={meta.color} />
                  <Text style={[styles.categoryChipText, { color: meta.color }]}>{cat.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Paket Unggulan
            </Text>
            <Pressable onPress={() => router.push('/(home)/packages')}>
              <Text style={[styles.seeAll, { color: colors.textSecondary }]}>See All</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featured.map((item: any, i: number) => (
              <Pressable
                key={i}
                style={[
                  styles.featuredCard,
                  { backgroundColor: colors.backgroundElement },
                ]}
              >
                {item.image_url || item.image ? (
                  <Image
                    source={{ uri: item.image_url || item.image }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.featuredImagePlaceholder}>
                    <Ionicons
                      name="image-outline"
                      size={32}
                      color={colors.textSecondary}
                    />
                  </View>
                )}
                <Text
                  style={[styles.featuredName, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text style={styles.featuredPrice}>
                  Rp{' '}
                  {(item.discount_price || item.price || 0).toLocaleString(
                    'id-ID'
                  )}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: Spacing.six },
  menuRow: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  menuCard: {
    width: 100,
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  categoriesRow: { gap: Spacing.two, paddingBottom: Spacing.two },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  section: { marginTop: Spacing.two },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  featuredCard: {
    width: 160,
    borderRadius: 12,
    padding: Spacing.two,
    marginRight: Spacing.two,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: Spacing.two,
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  featuredName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.half,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
});
