import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet } from '@/lib/api-client';

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
    label: 'Riwayat',
    icon: 'time-outline',
    color: '#8b5cf6',
    route: '/(home)/order',
  },
  {
    id: 'packages',
    label: 'Katalog Paket Bunga',
    icon: 'flower-outline',
    color: '#ec4899',
    route: '/(home)/cbir?filter=package',
  },
  {
    id: 'products',
    label: 'Katalog Bunga',
    icon: 'rose-outline',
    color: '#f43f5e',
    route: '/(home)/cbir?filter=product',
  },
  {
    id: 'reviews',
    label: 'Ulasan',
    icon: 'star-outline',
    color: '#f59e0b',
    route: '/(home)/profile',
  },
  {
    id: 'favorites',
    label: 'Favorite',
    icon: 'heart-outline',
    color: '#ef4444',
    route: '/(home)/cbir?filter=favorites',
  },
];

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHome = async () => {
    try {
      const data = await apiGet(API.HOME);
      setHomeData(data.data || data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
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
      <View style={styles.menuGrid}>
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
      </View>

      {featured.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Paket Unggulan
          </Text>
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
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  menuCard: {
    width: '47%',
    borderRadius: 16,
    padding: Spacing.four,
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
  section: { marginTop: Spacing.two },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.three,
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
