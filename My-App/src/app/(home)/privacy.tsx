import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
 Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';

/**
 * Data shape dari GET /api/legal/privacy
 * Model: PrivacyPolicy (table: privacy_policies)
 * Fields: title (string), content (json array of {heading, body})
 * Dikelola lewat Filament PrivacyPolicyResource
 */
type PrivacySection = {
  heading: string;
  body: string;
};

type PrivacyData = {
  id: number;
  title: string;
  content: PrivacySection[];
  updated_at: string;
};

export default function PrivacyScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const { t } = useLanguage();
  const [data, setData] = useState<PrivacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      // GET /api/legal/privacy — LegalController@getPrivacy
      // Model: App\Models\PrivacyPolicy (table: privacy_policies)
      const res: any = await apiGet(API.LEGAL.PRIVACY);
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
          {data?.title || t('Privacy & Security')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('Loading policy...')}
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
          {/* Header Banner */}
          <View
            style={[
              styles.heroBanner,
              { backgroundColor: colors.backgroundSelected },
            ]}
          >
            <Ionicons name="shield-checkmark" size={48} color="#8b5cf6" />
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              {t('Privacy Policy')}
            </Text>
            {data?.updated_at && (
              <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
                {t('Last Updated:')}{' '}
                {new Date(data.updated_at).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            )}
          </View>

          {data?.content && data.content.length > 0 ? (
            data.content.map((section, index) => (
              <View
                key={index}
                style={[
                  styles.sectionCard,
                  { backgroundColor: colors.backgroundElement },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {index + 1}. {section.heading}
                </Text>
                <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                  {section.body}
                </Text>
              </View>
            ))
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('No Content')}</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {t('Privacy policy content has not been added yet.')}
              </Text>
            </View>
          )}
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
  content: { padding: Spacing.three, gap: Spacing.two },
  heroBanner: {
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  heroSub: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  sectionCard: {
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sectionNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  sectionBody: {
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
    backgroundColor: '#3b82f6',
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
});
