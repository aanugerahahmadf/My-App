import { useEffect, useState, useRef, useCallback } from 'react';
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
  useWindowDimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';

import { Colors, Spacing, Shadows } from '@/constants/theme';
import { PressableScale } from '@/components/pressable-scale';
import { StaggeredEntrance } from '@/components/staggered-entrance';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';

type CatalogItem = {
  id: number;
  type: 'package' | 'product';
  name: string;
  image: string;
  price: number;
  original_price?: number;
};

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
};

const menuItems: MenuItem[] = [
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
  const { user } = useUser();
  const [homeData, setHomeData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const scaleNotif = useRef(new Animated.Value(1)).current;

  const handleNotification = () => {
    Animated.sequence([
      Animated.timing(scaleNotif, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleNotif, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    router.push('/(home)/notifications');
  };

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
      const [homeRes, catRes, profileRes, prodRes, pkgRes, wishRes] = await Promise.all([
        apiGet(API.HOME),
        apiGet(API.CATEGORIES).catch(() => null),
        apiGet(API.PROFILE.SHOW).catch(() => null),
        apiGet(API.PRODUCTS.ALL).catch(() => ({ data: [] })),
        apiGet(API.PACKAGES.ALL).catch(() => ({ data: [] })),
        apiGet(API.WISHLIST.INDEX).catch(() => ({ data: [] })),
      ]);
      setHomeData(homeRes.data || homeRes);
      if (catRes?.data) setCategories(catRes.data);
      if (profileRes?.data) setProfile(profileRes.data);

      const products: any[] = (prodRes?.data || prodRes || []).slice(0, 6).map((p: any) => ({
        id: p.id, type: 'product' as const, name: p.name,
        image: p.image_url || '', price: Number(p.discount_price || p.price || 0),
        original_price: p.discount_price ? Number(p.price) : undefined,
      }));
      const packages: any[] = (pkgRes?.data || pkgRes || []).slice(0, 6).map((p: any) => ({
        id: p.id, type: 'package' as const, name: p.name,
        image: p.image_url || '', price: Number(p.discount_price || p.price || 0),
        original_price: p.discount_price ? Number(p.price) : undefined,
      }));
      const merged = [...products, ...packages].sort(() => Math.random() - 0.5).slice(0, 8);
      setCatalog(merged);

      const wl: any[] = wishRes?.data || wishRes || [];
      const ids = new Set<string>(wl.map((w: any) => `${w.resource_type || w.type || 'product'}-${w.product_id || w.package_id || w.id}`));
      setWishlistIds(ids);
    } catch {
      // silent
    } finally {
      setRefreshing(false);
    }
  };

  const toggleWishlist = useCallback(async (item: CatalogItem) => {
    const key = `${item.type}-${item.id}`;
    const isWished = wishlistIds.has(key);
    try {
      const body: any = {};
      if (item.type === 'product') body.product_id = item.id;
      else body.package_id = item.id;
      await apiPost(API.WISHLIST.TOGGLE, body);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isWished) next.delete(key);
        else next.add(key);
        return next;
      });
    } catch {}
  }, [wishlistIds]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHome();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHome();
  };

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CARD_SIZE = Math.min(Math.floor((SCREEN_WIDTH - Spacing.three * 2 - Spacing.three * 3) / 4), 80);

  const featured = homeData?.featured_packages || homeData?.featured || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.welcomeSection}>
        <Pressable
          style={[styles.avatarContainer, { backgroundColor: colors.backgroundElement }, Shadows.md]}
          onPress={() => router.push('/(home)/edit-profile')}
        >
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
            </View>
          )}
        </Pressable>
        <View style={styles.welcomeTextContainer}>
          <Text style={[styles.greetingLabel, { color: colors.textSecondary }]}>
            {t('Welcome back')}
          </Text>
          <Text style={[styles.greetingName, { color: colors.text }]}>
            {profile
              ? [profile.first_name, profile.mid_name].filter(Boolean).join(', ') || t('User')
              : user?.fullName || t('User')}
          </Text>
          {profile?.last_name ? (
            <Text style={[styles.greetingSurname, { color: colors.textSecondary }]} numberOfLines={1}>
              {profile.last_name}
            </Text>
          ) : null}
        </View>
        <Animated.View style={{ transform: [{ scale: scaleNotif }] }}>
          <PressableScale
            onPress={handleNotification}
            style={[styles.notifBtn, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </PressableScale>
        </Animated.View>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <StaggeredEntrance key={item.id} index={index}>
            <PressableScale
              onPress={() => router.push(item.route as any)}
              style={[
                styles.menuCard,
                {
                  width: CARD_SIZE,
                  height: CARD_SIZE,
                  backgroundColor: item.color + '15',
                  borderColor: item.color + '25',
                },
              ]}
            >
              <Ionicons name={item.icon} size={26} color={item.color} />
            </PressableScale>
          </StaggeredEntrance>
        ))}
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('Categories')}
            </Text>
            <Pressable onPress={() => router.push('/(home)/packages')}>
              <Text style={[styles.seeAll, { color: colors.textSecondary }]}>{t('See all')}</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoriesRow, { paddingRight: Spacing.three }]}>
            {categories.map((cat: any, index: number) => {
              const meta = CATEGORY_ICONS[cat.name] || { icon: 'grid-outline', color: '#3b82f6' };
              return (
                <StaggeredEntrance key={cat.id} index={index}>
                  <PressableScale onPress={() => router.push('/(home)/packages')}>
                    <View style={[styles.categoryChip, { backgroundColor: meta.color + '15', borderColor: meta.color + '30' }]}>
                      <Ionicons name={meta.icon as any} size={16} color={meta.color} />
                      <Text style={[styles.categoryChipText, { color: meta.color }]}>{cat.name}</Text>
                    </View>
                  </PressableScale>
                </StaggeredEntrance>
              );
            })}
          </ScrollView>
        </View>
      )}

      {catalog.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('Rekomendasi')}
            </Text>
            <Pressable onPress={() => router.push('/(home)/products')}>
              <Text style={[styles.seeAll, { color: colors.textSecondary }]}>{t('See all')}</Text>
            </Pressable>
          </View>
          <View style={styles.catalogGrid}>
            {catalog.map((item, index) => {
              const key = `${item.type}-${item.id}`;
              const isWished = wishlistIds.has(key);
              const detailRoute = item.type === 'package' ? `/(packages)/${item.id}` : `/(products)/${item.id}`;
              return (
                <StaggeredEntrance key={key} index={index} offset={30}>
                  <PressableScale
                    onPress={() => router.push(detailRoute as any)}
                    style={[styles.catalogCard, { backgroundColor: colors.backgroundElement }]}
                  >
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.catalogImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.catalogImagePlaceholder, { backgroundColor: colors.backgroundSelected }]}>
                        <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                      </View>
                    )}
                    <Pressable
                      style={styles.wishlistBtn}
                      onPress={(e) => { e.stopPropagation?.(); toggleWishlist(item); }}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={isWished ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isWished ? '#ef4444' : colors.textSecondary}
                      />
                    </Pressable>
                    <View style={styles.catalogInfo}>
                      {item.original_price ? (
                        <View style={styles.catalogBadgeRow}>
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeText}>
                              -{Math.round((1 - item.price / item.original_price) * 100)}%
                            </Text>
                          </View>
                        </View>
                      ) : null}
                      <Text style={[styles.catalogName, { color: colors.text }]} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.catalogPrice}>
                        Rp {item.price.toLocaleString('id-ID')}
                      </Text>
                      {item.original_price ? (
                        <Text style={[styles.catalogOriginalPrice, { color: colors.textSecondary }]}>
                          Rp {item.original_price.toLocaleString('id-ID')}
                        </Text>
                      ) : null}
                    </View>
                  </PressableScale>
                </StaggeredEntrance>
              );
            })}
          </View>
        </View>
      )}

      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('Featured Packages')}
            </Text>
            <Pressable onPress={() => router.push('/(home)/packages')}>
              <Text style={[styles.seeAll, { color: colors.textSecondary }]}>{t('See all')}</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: Spacing.three }}>
            {featured.map((item: any, i: number) => (
              <StaggeredEntrance key={i} index={i} offset={80}>
                <PressableScale
                  style={[
                    styles.featuredCard,
                    { backgroundColor: colors.backgroundElement },
                    Shadows.sm,
                    i === 0 && { marginLeft: 0 },
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
                </PressableScale>
              </StaggeredEntrance>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: Spacing.six },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.five,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(128,128,128,0.15)',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
    marginLeft: Spacing.three,
  },
  greetingLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '700',
  },
  greetingSurname: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 1,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.two,
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  menuCard: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  categoriesRow: { gap: Spacing.two, paddingBottom: Spacing.two },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    ...Shadows.sm,
  },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  section: { marginTop: Spacing.two, paddingHorizontal: Spacing.three },
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
    width: 170,
    borderRadius: 16,
    padding: Spacing.two,
    marginRight: Spacing.three,
    ...Shadows.md,
  },
  featuredImage: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    backgroundColor: 'rgba(128,128,128,0.08)',
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
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  catalogCard: {
    width: '48.5%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  catalogImage: {
    width: '100%',
    height: 130,
  },
  catalogImagePlaceholder: {
    width: '100%',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalogInfo: {
    padding: Spacing.two,
  },
  catalogBadgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  discountBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  catalogName: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 2,
  },
  catalogPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  catalogOriginalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
});
