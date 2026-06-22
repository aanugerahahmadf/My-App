import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, useColorScheme, ActivityIndicator, RefreshControl, Linking , Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';

/**
 * Data shape dari GET /api/legal/about
 * Model: LegalPage (where slug = 'about')
 * Fields: title, content (json: { text, mission }), owner
 * Dikelola lewat Filament LegalPageResource
 */
type AboutData = {
  title: string;
  content: string;
  mission?: string;
  owner?: string;
};

export default function AboutScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const { t } = useLanguage();
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      // GET /api/legal/about — LegalController@getAbout
      // Model: App\Models\LegalPage where slug = 'about'
      const res: any = await apiGet(API.LEGAL.ABOUT);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || t('Data not available'));
      }
    } catch {
      setError(t('Failed to load data from server'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {data?.title || t('About the App')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('Loading app information...')}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorTitle, { color: colors.text }]}>{t('Failed to Load')}</Text>
          <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryText}>{t('Try Again')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* App Hero dari LegalPage@about → owner field */}
          <View style={[styles.appCard, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.appLogo}>
              <Ionicons name="flower" size={48} color="#ec4899" />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>
              {data?.owner || data?.title || t('Wedding Flowers Decorasi')}
            </Text>
            <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
              {data?.title || ''}
            </Text>
          </View>

          {/* About Content dari LegalPage content.text */}
          {data?.content ? (
            <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle-outline" size={22} color="#3b82f6" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('About Us')}</Text>
              </View>
              <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                {data.content}
              </Text>
            </View>
          ) : null}

          {/* Mission dari LegalPage content.mission */}
          {data?.mission ? (
            <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="rocket-outline" size={22} color="#8b5cf6" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('Our Mission')}</Text>
              </View>
              <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                {data.mission}
              </Text>
            </View>
          ) : null}

          {/* Empty state jika konten kosong */}
          {!data?.content && !data?.mission ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="information-circle-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('No Content')}</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {t('App information has not been filled in yet.')}
              </Text>
            </View>
          ) : null}

          {/* Legal Links */}
          <View style={styles.legalRow}>
            <Pressable
              onPress={() =>
                router.push('/(home)/privacy' as any)
              }
            >
              <Text style={styles.legalLink}>{t('Privacy Policy')}</Text>
            </Pressable>
            <Text style={[styles.legalDot, { color: colors.textSecondary }]}>·</Text>
            <Pressable onPress={() => Linking.openURL('https://weddingflowersdecorasi.com/terms')}>
              <Text style={styles.legalLink}>{t('Terms & Conditions')}</Text>
            </Pressable>
          </View>

          <Text style={[styles.copyright, { color: colors.textSecondary }]}>
            © {new Date().getFullYear()} {data?.owner || t('Wedding Flowers Decorasi')}. {t('All rights reserved.')}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
    flex: 1,
    textAlign: 'center',
  },
  content: { padding: Spacing.three, gap: Spacing.three },
  appCard: {
    borderRadius: 20,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#ec489920',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
    textAlign: 'center',
  },
  appTagline: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  emptyBox: {
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  retryBtn: {
    backgroundColor: '#ec4899',
    borderRadius: 10,
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    marginTop: Spacing.one,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legalLink: {
    fontSize: 13,
    color: '#3b82f6',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  legalDot: {
    fontSize: 13,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
});
