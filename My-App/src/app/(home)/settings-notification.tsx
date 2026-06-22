import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  useColorScheme,
  Switch,
 Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useLanguage } from '@/lib/language-context';

const NOTIFICATION_SETTINGS = [
  {
    id: 'order_update',
    label: 'Order Updates',
    description: 'Notifications when your order status changes',
    icon: 'receipt-outline' as const,
    color: '#3b82f6',
  },
  {
    id: 'promotion',
    label: 'Promos & Offers',
    description: 'Latest discounts and promotional offers',
    icon: 'pricetag-outline' as const,
    color: '#ec4899',
  },
  {
    id: 'message',
    label: 'New Messages',
    description: 'Notifications when admin sends a message',
    icon: 'chatbubble-outline' as const,
    color: '#8b5cf6',
  },
  {
    id: 'reminder',
    label: 'Event Reminders',
    description: 'Reminders 1 and 7 days before your event',
    icon: 'calendar-outline' as const,
    color: '#f59e0b',
  },
  {
    id: 'payment',
    label: 'Payment',
    description: 'Payment confirmation notifications',
    icon: 'card-outline' as const,
    color: '#10b981',
  },
];

export default function SettingsNotificationScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_SETTINGS.map((s) => [s.id, true]))
  );

  const toggle = (id: string) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Notifications')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={NOTIFICATION_SETTINGS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            {t('Manage your notification preferences')}
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.row, { backgroundColor: colors.backgroundElement }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t(item.label)}</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                {t(item.description)}
              </Text>
            </View>
            <Switch
              value={settings[item.id]}
              onValueChange={() => toggle(item.id)}
              trackColor={{ false: colors.backgroundSelected, true: '#3b82f6' }}
              thumbColor="#fff"
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  },
  sectionLabel: {
    fontSize: 13,
    marginBottom: Spacing.three,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  list: { padding: Spacing.three },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  rowDesc: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
});
