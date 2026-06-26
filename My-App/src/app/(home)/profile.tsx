import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  useColorScheme,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/expo';
import { useState, useEffect } from 'react';

import { Colors, Spacing, Shadows } from '@/constants/theme';
import { PressableScale } from '@/components/pressable-scale';
import { useLanguage } from '@/lib/language-context';
import { clearSanctumToken } from '@/lib/api-client';
import { getSavedAccounts, removeAccount, SavedAccount } from '@/lib/accounts-storage';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();

  const [showSwitch, setShowSwitch] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  useEffect(() => {
    if (showSwitch) getSavedAccounts().then(setSavedAccounts);
  }, [showSwitch]);

  const switchTo = async (targetAccount?: SavedAccount) => {
    setShowSwitch(false);
    try { await clearSanctumToken(); } catch {}
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  const handleRemoveAccount = async (clerkId: string) => {
    await removeAccount(clerkId);
    setSavedAccounts((prev) => prev.filter((a) => a.clerkId !== clerkId));
  };

  const handleLogout = () => {
    Alert.alert(t('Sign Out'), t('Are you sure you want to sign out?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Sign Out'),
        style: 'destructive',
        onPress: async () => {
          try { await clearSanctumToken(); } catch {}
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <Pressable style={styles.profileHeader} onPress={() => router.push('/(home)/edit-profile')}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundElement }]}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={36} color={colors.textSecondary} />
          )}
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.fullName || t('User')}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.emailAddresses?.[0]?.emailAddress || ''}
        </Text>
        <View style={[styles.editBadge, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="create-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.editBadgeText, { color: colors.textSecondary }]}>{t('Edit Profile')}</Text>
        </View>
      </Pressable>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('Account')}</Text>

        <PressableScale
          style={[styles.menuItem, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
          onPress={() => router.push('/(home)/edit-profile')}
        >
          <Ionicons name="person-circle-outline" size={22} color="#3b82f6" />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('Edit Profile')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </PressableScale>

        <PressableScale
          style={[styles.menuItem, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
          onPress={() => router.push('/(home)/vouchers')}
        >
          <Ionicons name="pricetag-outline" size={22} color="#ec4899" />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('Vouchers')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </PressableScale>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('Settings')}</Text>

        <PressableScale
          style={[styles.menuItem, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
          onPress={() => router.push('/(home)/histories')}
        >
          <Ionicons name="time-outline" size={22} color="#8b5cf6" />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('History')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </PressableScale>

        <PressableScale
          style={[styles.menuItem, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
          onPress={() => router.push('/(home)/languages')}
        >
          <Ionicons name="language-outline" size={22} color="#3b82f6" />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('Language')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </PressableScale>

        <PressableScale
          style={[styles.menuItem, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
          onPress={() => router.push('/(home)/settings-notification')}
        >
          <Ionicons name="notifications-outline" size={22} color="#ec4899" />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('Notifications')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </PressableScale>

        <PressableScale
          style={[styles.menuItem, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
          onPress={() => router.push('/(home)/privacy')}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color="#10b981" />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('Privacy & Security')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </PressableScale>

        <PressableScale
          style={[styles.menuItem, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
          onPress={() => router.push('/(home)/help')}
        >
          <Ionicons name="help-circle-outline" size={22} color="#f59e0b" />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('Help')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </PressableScale>

        <PressableScale
          style={[styles.menuItem, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
          onPress={() => router.push('/(home)/about')}
        >
          <Ionicons name="information-circle-outline" size={22} color="#6b7280" />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('About')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </PressableScale>
      </View>

      <PressableScale
        style={[styles.menuItem, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
        onPress={() => setShowSwitch(true)}
      >
        <Ionicons name="swap-horizontal-outline" size={22} color="#f59e0b" />
        <Text style={[styles.menuLabel, { color: colors.text }]}>{t('Switch Account')}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </PressableScale>

      <PressableScale style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>{t('Sign Out')}</Text>
      </PressableScale>
    </ScrollView>

    {/* Switch Account Modal */}
    <Modal visible={showSwitch} transparent animationType="slide" onRequestClose={() => setShowSwitch(false)}>
      <Pressable style={styles.modalOverlay} onPress={() => setShowSwitch(false)}>
        <Pressable onPress={() => {}} style={[styles.modalSheet, { backgroundColor: colors.background }]}>
          <View style={styles.modalHandle} />

          <Text style={[styles.modalTitle, { color: colors.text }]}>Ganti Akun</Text>

          {savedAccounts.map((acc) => {
            const isCurrent = acc.clerkId === user?.id;
            return (
              <PressableScale key={acc.clerkId} onPress={() => !isCurrent && switchTo(acc)} scaleIn={0.97} style={styles.accountItem}>
                <View style={styles.accountLeft}>
                  {acc.avatarUrl ? (
                    <Image source={{ uri: acc.avatarUrl }} style={styles.accountAvatar} />
                  ) : (
                    <View style={[styles.accountAvatar, { backgroundColor: colors.backgroundElement, justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="person" size={18} color={colors.textSecondary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.accountName, { color: colors.text }]}>{acc.name}</Text>
                    <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>{acc.email}</Text>
                  </View>
                </View>
                {isCurrent ? (
                  <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />
                ) : (
                  <Pressable onPress={() => handleRemoveAccount(acc.clerkId)} hitSlop={10}>
                    <Ionicons name="close-circle-outline" size={22} color={colors.textSecondary} />
                  </Pressable>
                )}
              </PressableScale>
            );
          })}

          <PressableScale
            onPress={() => switchTo()}
            scaleIn={0.97}
            style={[styles.addAccountBtn, { borderColor: colors.textSecondary + '30' }]}
          >
            <Ionicons name="add-circle-outline" size={22} color="#3b82f6" />
            <Text style={[styles.addAccountText, { color: '#3b82f6' }]}>Tambah Akun Baru</Text>
          </PressableScale>
        </Pressable>
      </Pressable>
    </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: Spacing.six },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.one,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.one,
  },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  name: { fontSize: 18, fontWeight: '700' },
  email: { fontSize: 13 },
  editBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8,
    marginTop: Spacing.one,
  },
  editBadgeText: { fontSize: 12, fontWeight: '600' },
  section: { marginBottom: Spacing.four },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.three },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    padding: Spacing.three, marginBottom: Spacing.two, gap: Spacing.two,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.one, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#ef4444', marginTop: Spacing.two,
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center',
  },
  accountItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
  },
  accountLeft: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  accountAvatar: { width: 44, height: 44, borderRadius: 22 },
  accountName: { fontSize: 15, fontWeight: '600' },
  accountEmail: { fontSize: 12 },
  addAccountBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, marginTop: 12,
  },
  addAccountText: { fontSize: 15, fontWeight: '600' },
});
