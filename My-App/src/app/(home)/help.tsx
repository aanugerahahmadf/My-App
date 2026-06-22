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
  Linking,
 Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';

/**
 * Data shape dari GET /api/legal/help
 * Model: Help (table: helps)
 * Fields: title, subtitle, faqs (json), contact_options (json)
 * Dikelola lewat Filament HelpResource
 */
type Faq = {
  question: string;
  answer: string;
};

type ContactOption = {
  label: string;
  value: string;
  url?: string;
  icon?: string;
};

type HelpData = {
  title: string;
  subtitle: string;
  faqs: Faq[];
  contact_options: ContactOption[] | null;
};

// Icon mapping untuk contact options dari Filament
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  whatsapp: 'logo-whatsapp',
  email: 'mail-outline',
  instagram: 'logo-instagram',
  phone: 'call-outline',
  facebook: 'logo-facebook',
  twitter: 'logo-twitter',
  website: 'globe-outline',
  default: 'link-outline',
};

const COLOR_MAP: Record<string, string> = {
  whatsapp: '#25D366',
  email: '#3b82f6',
  instagram: '#E1306C',
  phone: '#10b981',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  website: '#8b5cf6',
  default: '#6b7280',
};

export default function HelpScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const { t } = useLanguage();
  const [data, setData] = useState<HelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      // GET /api/legal/help — LegalController@getHelp
      // Model: App\Models\Help (table: helps)
      const res: any = await apiGet(API.LEGAL.HELP);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        // Jika success true tapi data kosong, tampilkan kosong
        setData(res.data || null);
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

  const getIconKey = (option: ContactOption): string => {
    const label = (option.label || '').toLowerCase();
    return Object.keys(ICON_MAP).find((k) => label.includes(k)) || 'default';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {data?.title || t('Help')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('Loading help center...')}
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
          {/* Hero Banner */}
          {data?.subtitle ? (
            <View style={[styles.heroBanner, { backgroundColor: '#f59e0b15' }]}>
              <Ionicons name="help-circle" size={44} color="#f59e0b" />
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                {data?.title || t('Help Center')}
              </Text>
              <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
                {data.subtitle}
              </Text>
            </View>
          ) : null}

          {/* Contact Options dari Filament HelpResource (contact_options JSON) */}
          {data?.contact_options && data.contact_options.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('Contact Us')}</Text>
              {data.contact_options.map((c, i) => {
                const iconKey = getIconKey(c);
                const icon = ICON_MAP[iconKey];
                const color = COLOR_MAP[iconKey];
                return (
                  <Pressable
                    key={i}
                    style={[styles.contactRow, { backgroundColor: colors.backgroundElement }]}
                    onPress={() => c.url && Linking.openURL(c.url)}
                  >
                    <View style={[styles.contactIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons name={icon} size={22} color={color} />
                    </View>
                    <View style={styles.contactText}>
                      <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                        {c.label}
                      </Text>
                      <Text style={[styles.contactValue, { color: colors.text }]}>
                        {c.value}
                      </Text>
                    </View>
                    {c.url ? (
                      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </>
          ) : null}

          {/* FAQ dari Filament HelpResource (faqs JSON Repeater) */}
          {data?.faqs && data.faqs.length > 0 ? (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text, marginTop: data?.contact_options ? Spacing.two : 0 },
                ]}
              >
                {t('Frequently Asked Questions (FAQ)')}
              </Text>
              {data.faqs.map((item, index) => {
                const isOpen = expandedIndex === index;
                return (
                  <Pressable
                    key={index}
                    style={[styles.faqItem, { backgroundColor: colors.backgroundElement }]}
                    onPress={() => setExpandedIndex(isOpen ? null : index)}
                  >
                    <View style={styles.faqHeader}>
                      <Text
                        style={[styles.faqQ, { color: colors.text }]}
                        numberOfLines={isOpen ? undefined : 2}
                      >
                        {item.question}
                      </Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </View>
                    {isOpen ? (
                      <Text style={[styles.faqA, { color: colors.textSecondary }]}>
                        {item.answer}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </>
          ) : (
            !data?.contact_options && (
              <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="help-circle-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('No Content')}
                </Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  {t('FAQ and contact options have not been added yet.')}
                </Text>
              </View>
            )
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
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: { flex: 1 },
  contactLabel: {
    fontSize: 11,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  faqItem: {
    borderRadius: 14,
    padding: Spacing.three,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  faqQ: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  faqA: {
    fontSize: 13,
    lineHeight: 21,
    marginTop: Spacing.two,
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
