import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  useColorScheme,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost, apiPut, apiDelete, clearSanctumToken } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

type Gender = 'male' | 'female' | '';

export default function EditProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Personal Info
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [midName, setMidName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gender, setGender] = useState<Gender>('');
  const [address, setAddress] = useState('');

  // Username
  const [username, setUsername] = useState('');

  const initials = (fullName || t("User"))
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [isEditing, setIsEditing] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // Delete Account
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGet(API.PROFILE.SHOW);
        const data = res.data || res;
        if (data) {
          if (data.full_name) setFullName(data.full_name);
          else if (data.name) setFullName(data.name);
          setFirstName(data.first_name || '');
          setMidName(data.mid_name || '');
          setLastName(data.last_name || '');
          setEmail(data.email || '');
          setWhatsapp(data.whatsapp || '');
          setGender(data.gender || '');
          setAddress(data.address || '');
          setAvatar(data.avatar_url || null);
          setUsername(data.username || '');
        }
      } catch (err: any) {
        Alert.alert(t('Error'), t('Failed to load profile data: {message}').replace('{message}', err?.message || err));
      } finally {
        setLoading(false);
      }
    };
    void Promise.resolve().then(load);
  }, [t]);

  const handleFullNameChange = (val: string) => {
    setFullName(val);
    const parts = val.trim().split(/\s+/);
    if (parts.length > 0) {
      const first = parts.shift() || '';
      const last = parts.length > 0 ? parts.pop() || '' : '';
      const mid = parts.length > 0 ? parts.join(' ') : '';
      setFirstName(first);
      setMidName(mid);
      setLastName(last);
    } else {
      setFirstName('');
      setMidName('');
      setLastName('');
    }
  };

  // Avatar
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('Permission Required'), t('We need gallery access to change your profile photo'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('avatar', { uri, name: filename, type } as any);
      const res = await apiPost(API.PROFILE.AVATAR, formData);
      if (res.status === 'success') {
        setAvatar(res.data?.avatar_full_url || res.data?.avatar_url || uri);
        Alert.alert(t('Success'), t('Profile photo updated successfully'));
      } else {
        Alert.alert(t('Failed'), res.message || t('Failed to update profile photo'));
      }
    } catch {
      Alert.alert(t('Error'), t('An error occurred while uploading profile photo'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save Personal Info
  const handleSavePersonalInfo = async () => {
    if (!fullName || !email) {
      Alert.alert(t('Validation'), t('Full Name and Email are required'));
      return;
    }
    setSavingPersonal(true);
    try {
      await apiPut(API.PROFILE.UPDATE, {
        full_name: fullName,
        first_name: firstName,
        mid_name: midName,
        last_name: lastName,
        email,
        whatsapp,
        gender: gender || null,
        address,
      });
      Alert.alert(t('Success'), t('Profile updated successfully!'));
    } catch {
      Alert.alert(t('Error'), t('Failed to update profile'));
    } finally {
      setSavingPersonal(false);
    }
  };

  // Username
  const handleSaveUsername = async () => {
    if (!username) {
      Alert.alert(t('Validation'), t('Username is required'));
      return;
    }
    setSavingUsername(true);
    try {
      await apiPut(API.PROFILE.UPDATE, { username });
      Alert.alert(t('Success'), t('Username updated successfully!'));
    } catch {
      Alert.alert(t('Error'), t('Failed to update username. It may already be taken.'));
    } finally {
      setSavingUsername(false);
    }
  };

  // Password
  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !passwordConfirmation) {
      Alert.alert(t('Validation'), t('Please fill in all password fields'));
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(t('Validation'), t('New password must be at least 8 characters'));
      return;
    }
    if (newPassword !== passwordConfirmation) {
      Alert.alert(t('Validation'), t('Password confirmation does not match'));
      return;
    }
    setSavingPassword(true);
    try {
      const res = await apiPost(API.PROFILE.PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: passwordConfirmation,
      });
      if (res.status === 'success') {
        Alert.alert(t('Success'), t('Password updated successfully!'));
        setCurrentPassword('');
        setNewPassword('');
        setPasswordConfirmation('');
      } else {
        Alert.alert(t('Failed'), res.message || t('Failed to update password'));
      }
    } catch {
      Alert.alert(t('Error'), t('Failed to update password. Make sure your current password is correct.'));
    } finally {
      setSavingPassword(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert(t('Validation'), t('Please enter your password to confirm'));
      return;
    }
    setDeletingAccount(true);
    try {
      const res = await apiDelete(`${API_BASE}/user/account`);
      if (res.status === 'success') {
        Alert.alert(t('Success'), t('Your account has been deleted successfully'));
        setShowDeleteModal(false);
        await clearSanctumToken();
        signOut();
      } else {
        Alert.alert(t('Failed'), res.message || t('Failed to delete account'));
      }
    } catch {
      Alert.alert(t('Error'), t('Failed to delete account'));
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Profile')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ═══════ SECTION 1: Personal Info ═══════ */}
        <SectionCard>
          <SectionHeader
            icon={<Ionicons name="person-circle-outline" size={20} color="#3b82f6" />}
            bgColor="#3b82f620"
            title={t('Profile Information')}
            description={isEditing ? t("Update your account's profile information and email address.") : ''}
            colors={colors}
          />

          {/* Avatar */}
          <View style={styles.avatarRow}>
            <Pressable
              style={[styles.avatarBox, { backgroundColor: avatar ? colors.backgroundSelected : "#3b82f620" }]}
              onPress={isEditing ? handlePickImage : undefined}
              disabled={!isEditing || uploadingAvatar}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarInitialsText, { color: "#3b82f6" }]}>{initials}</Text>
              )}
              {uploadingAvatar && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </Pressable>
            {!isEditing && (
              <Pressable style={styles.editAvatarBtn} onPress={() => setIsEditing(true)}>
                <Text style={styles.editAvatarText}>{t('Tap to change photo')}</Text>
              </Pressable>
            )}
          </View>

          {isEditing ? (
            <>
              <Field label={t('Full Name')} required colors={colors}>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]} value={fullName} onChangeText={handleFullNameChange} placeholder={t('Full Name')} placeholderTextColor={colors.textSecondary} />
              </Field>
              <Field label={t('First Name')} colors={colors}>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]} value={firstName} onChangeText={setFirstName} placeholder={t('First Name')} placeholderTextColor={colors.textSecondary} />
              </Field>
              <Field label={t('Middle Name')} colors={colors}>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]} value={midName} onChangeText={setMidName} placeholder={t('Middle Name')} placeholderTextColor={colors.textSecondary} />
              </Field>
              <Field label={t('Last Name')} colors={colors}>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]} value={lastName} onChangeText={setLastName} placeholder={t('Last Name')} placeholderTextColor={colors.textSecondary} />
              </Field>
              <Field label={t('Email')} required colors={colors}>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder={t('Email')} placeholderTextColor={colors.textSecondary} />
              </Field>
              <Field label={t('WhatsApp Number')} helperText={t('Used for payment notifications via WhatsApp. Leave blank if same as phone number.')} colors={colors}>
                <View style={[styles.inputPrefix, { borderColor: colors.backgroundSelected }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textSecondary} />
                  <TextInput style={[styles.inputFlex, { color: colors.text }]} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder={t('e.g. 08123456789')} placeholderTextColor={colors.textSecondary} />
                </View>
              </Field>
              <Field label={t('Gender')} colors={colors}>
                <View style={styles.genderRow}>
                  {(['male', 'female'] as const).map((g) => {
                    const selected = gender === g;
                    const icon = g === 'male' ? 'male-outline' : 'female-outline';
                    const activeColor = g === 'male' ? '#3b82f6' : '#ec4899';
                    return (
                      <Pressable key={g} style={[styles.genderOption, { borderColor: colors.backgroundSelected }, selected && { backgroundColor: activeColor + '20', borderColor: activeColor }]} onPress={() => setGender(g)}>
                        <Ionicons name={icon} size={16} color={selected ? activeColor : colors.text} />
                        <Text style={[styles.genderText, { color: selected ? activeColor : colors.text }]}>{g === 'male' ? t('Male') : t('Female')}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>
              <Field label={t('Address')} colors={colors}>
                <TextInput style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.backgroundSelected }]} value={address} onChangeText={setAddress} multiline numberOfLines={3} placeholder={t('Full address')} placeholderTextColor={colors.textSecondary} textAlignVertical="top" />
              </Field>

              <View style={styles.editActions}>
                <Pressable style={[styles.cancelBtn, { borderColor: colors.textSecondary }]} onPress={() => setIsEditing(false)}>
                  <Text style={[styles.cancelBtnText, { color: colors.text }]}>{t('Cancel')}</Text>
                </Pressable>
                <SaveButton onPress={handleSavePersonalInfo} loading={savingPersonal} label={t('Save Changes')} style={{ flex: 1 }} />
              </View>
            </>
          ) : (
            <View style={styles.viewInfo}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('Full Name')}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{fullName || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('Email')}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{email || '-'}</Text>
              </View>
              {whatsapp ? (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('WhatsApp')}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{whatsapp}</Text>
                </View>
              ) : null}
              {gender ? (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('Gender')}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{gender === 'male' ? t('Male') : t('Female')}</Text>
                </View>
              ) : null}
              {address ? (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('Address')}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{address}</Text>
                </View>
              ) : null}
              <Pressable style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil-outline" size={16} color="#fff" />
                <Text style={styles.editBtnText}>{t('Edit Profile')}</Text>
              </Pressable>
            </View>
          )}
        </SectionCard>

        {/* ═══════ SECTION 2: Username ═══════ */}
        <SectionCard>
          <SectionHeader
            icon={<Ionicons name="finger-print-outline" size={20} color="#8b5cf6" />}
            bgColor="#8b5cf620"
            title={t('Username')}
            description={t('Update your username')}
            colors={colors}
          />

          <Field label={t('Username')} required colors={colors}>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]} value={username} onChangeText={setUsername} autoCapitalize="none" placeholder={t('Enter your username')} placeholderTextColor={colors.textSecondary} />
          </Field>

          <SaveButton onPress={handleSaveUsername} loading={savingUsername} label={t('Save Changes')} bgColor="#8b5cf6" />
        </SectionCard>

        {/* ═══════ SECTION 3: Update Password ═══════ */}
        <SectionCard>
          <SectionHeader
            icon={<Ionicons name="lock-closed-outline" size={20} color="#eab308" />}
            bgColor="#eab30820"
            title={t('Update Password')}
            description={t('Ensure your account is using a long, random password to stay secure.')}
            colors={colors}
          />

          <Field label={t('Current Password')} required colors={colors}>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" placeholder={t('Current password')} placeholderTextColor={colors.textSecondary} />
          </Field>
          <Field label={t('New Password')} required colors={colors}>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]} value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" placeholder={t('New password')} placeholderTextColor={colors.textSecondary} />
          </Field>
          <Field label={t('Confirm New Password')} required colors={colors}>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]} value={passwordConfirmation} onChangeText={setPasswordConfirmation} secureTextEntry autoCapitalize="none" placeholder={t('Confirm new password')} placeholderTextColor={colors.textSecondary} />
          </Field>

          <SaveButton onPress={handleSavePassword} loading={savingPassword} label={t('Save Changes')} bgColor="#eab308" />
        </SectionCard>

        {/* ═══════ SECTION 4: Browser Sessions ═══════ */}
        <SectionCard>
          <SectionHeader
            icon={<Ionicons name="laptop-outline" size={20} color="#6b7280" />}
            bgColor="#6b728020"
            title={t('Browser Sessions')}
            description={t('Manage and log out your active sessions on other browsers and devices.')}
            colors={colors}
          />

          <Text style={[styles.sectionDesc, { color: colors.textSecondary, marginBottom: Spacing.two }]}>
            {t('If necessary, you may log out of all of your other browser sessions across all of your devices. Some of your recent sessions are listed below; however, this list may not be exhaustive. If you feel your account has been compromised, you should also update your password.')}
          </Text>

          {/* Current Device */}
          <View style={[styles.sessionItem, { backgroundColor: colors.backgroundSelected + '80' }]}>
            <View style={[styles.sessionIcon, { backgroundColor: '#3b82f620' }]}>
              <Ionicons name="phone-portrait-outline" size={18} color="#3b82f6" />
            </View>
            <View style={styles.sessionInfo}>
              <View style={styles.sessionNameRow}>
                <Text style={[styles.sessionDevice, { color: colors.text }]}>{t('Mobile App')}</Text>
                <View style={styles.sessionBadge}>
                  <View style={styles.sessionDot} />
                  <Text style={styles.sessionBadgeText}>{t('Active now')}</Text>
                </View>
              </View>
              <Text style={[styles.sessionMeta, { color: colors.textSecondary }]}>{t('This device')}</Text>
            </View>
          </View>

          <Pressable style={[styles.saveBtn, { backgroundColor: colors.backgroundSelected, marginTop: Spacing.two }]} onPress={() => {
            Alert.alert(t('Confirm'), t('Please enter your password to log out of other browser sessions.'));
          }}>
            <Text style={[styles.saveBtnText, { color: colors.text }]}>{t('Log Out Other Browser Sessions')}</Text>
          </Pressable>
        </SectionCard>

        {/* ═══════ SECTION 6: Delete Account ═══════ */}
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundElement, borderColor: '#ef4444', borderWidth: 1 }]}>
          <SectionHeader
            icon={<Ionicons name="trash-outline" size={20} color="#ef4444" />}
            bgColor="#ef444420"
            title={t('Delete Account')}
            description={t('Permanently delete your account.')}
            colors={colors}
          />

          <Text style={[styles.deleteDesc, { color: colors.textSecondary }]}>
            {t('Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.')}
          </Text>

          <Pressable style={[styles.saveBtn, { backgroundColor: '#ef4444' }]} onPress={() => setShowDeleteModal(true)}>
            <Text style={styles.saveBtnText}>{t('Delete Account')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* DELETE CONFIRM MODAL */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('Delete Account')}</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              {t('Are you sure you want to delete your account? Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.')}
            </Text>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected, marginBottom: Spacing.three }]} value={deletePassword} onChangeText={setDeletePassword} secureTextEntry autoCapitalize="none" placeholder={t('Password')} placeholderTextColor={colors.textSecondary} />
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalCancel, { borderColor: colors.textSecondary }]} onPress={() => { setShowDeleteModal(false); setDeletePassword(''); }}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>{t('Cancel')}</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalDanger]} onPress={handleDeleteAccount} disabled={deletingAccount}>
                {deletingAccount ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalBtnTextWhite}>{t('Yes, delete')}</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Helpers ──

function SectionCard({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const bg = Colors[scheme === 'dark' ? 'dark' : 'light'].backgroundElement;
  return <View style={[styles.sectionCard, { backgroundColor: bg }]}>{children}</View>;
}

function SectionHeader({ icon, bgColor, title, description, colors }: { icon: React.ReactNode; bgColor: string; title: string; description: string; colors: any }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>{icon}</View>
      <View style={styles.sectionHeaderText}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );
}

function Field({ label, required, helperText, colors, children }: { label: string; required?: boolean; helperText?: string; colors: any; children: React.ReactNode }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {label}{required ? ' *' : ''}
      </Text>
      {children}
      {helperText ? <Text style={[styles.fieldHelper, { color: colors.textSecondary }]}>{helperText}</Text> : null}
    </View>
  );
}

function SaveButton({ onPress, loading, label, bgColor, style }: { onPress: () => void; loading: boolean; label: string; bgColor?: string; style?: any }) {
  return (
    <Pressable style={[styles.saveBtn, bgColor ? { backgroundColor: bgColor } : undefined, style]} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.four },

  sectionCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  sectionHeaderText: { flex: 1, gap: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionDesc: { fontSize: 12, lineHeight: 16 },

  avatarRow: { alignItems: 'center', marginVertical: Spacing.two },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarInitialsText: { fontSize: 28, fontWeight: "800" },
  avatarOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
  },

  fieldGroup: { gap: 6, marginBottom: Spacing.one },
  fieldLabel: { fontSize: 12, fontWeight: '600' },
  fieldHelper: { fontSize: 11, lineHeight: 14 },
  input: {
    height: 48, borderRadius: 10, borderWidth: 1,
    paddingHorizontal: Spacing.three, fontSize: 14,
  },
  inputFlex: {
    flex: 1, height: 48, fontSize: 14, paddingLeft: 0,
  },
  textArea: { height: 80, paddingVertical: 10 },
  inputPrefix: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 48, borderRadius: 10, borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },

  genderRow: { flexDirection: 'row', gap: Spacing.two },
  genderOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.one, height: 44, borderRadius: 10, borderWidth: 1,
  },
  genderText: { fontSize: 13, fontWeight: '600' },

  saveBtn: {
    backgroundColor: '#3b82f6', height: 48, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginTop: Spacing.two,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // View mode info
  viewInfo: { gap: Spacing.two },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.two, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  infoLabel: { fontSize: 12, fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', flex: 2, textAlign: 'right' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.one,
    backgroundColor: '#3b82f6', height: 44, borderRadius: 10, marginTop: Spacing.three,
  },
  editBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  editAvatarBtn: { marginTop: Spacing.one },
  editAvatarText: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },
  // Edit mode actions
  editActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  cancelBtn: {
    flex: 1, height: 48, borderRadius: 10, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },

  deleteDesc: { fontSize: 13, lineHeight: 18 },

  // Sessions
  sessionItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.two, padding: Spacing.three,
    borderRadius: 12,
  },
  sessionIcon: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  sessionInfo: { flex: 1, gap: 2 },
  sessionNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  sessionDevice: { fontSize: 14, fontWeight: '600' },
  sessionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  sessionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  sessionBadgeText: { fontSize: 11, fontWeight: '600', color: '#22c55e' },
  sessionMeta: { fontSize: 12 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', padding: Spacing.three,
  },
  modalCard: { borderRadius: 16, padding: Spacing.four, gap: Spacing.three },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalDesc: { fontSize: 13, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: Spacing.two },
  modalBtn: { flex: 1, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalCancel: { borderWidth: 1 },
  modalDanger: { backgroundColor: '#ef4444' },
  modalBtnText: { fontSize: 14, fontWeight: '600' },
  modalBtnTextWhite: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
