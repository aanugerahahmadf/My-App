import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useAuth, useUser } from '@clerk/expo';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiPost, clearSanctumToken } from '@/lib/api-client';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { signOut } = useAuth();
  const { user } = useUser();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSave = async () => {
    try {
      await apiPost(API.PROFILE.UPDATE, { name, phone, address });
      Alert.alert('Sukses', 'Profil berhasil diperbarui');
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Gagal memperbarui profil');
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await clearSanctumToken();
          signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.profileHeader}>
        <View
          style={[styles.avatar, { backgroundColor: colors.backgroundElement }]}
        >
          <Ionicons name="person" size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.emailAddresses?.[0]?.emailAddress || ''}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Edit Profile
        </Text>
        <View
          style={[styles.field, { backgroundColor: colors.backgroundElement }]}
        >
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Nama
          </Text>
          <TextInput
            style={[styles.fieldInput, { color: colors.text }]}
            value={name}
            onChangeText={setName}
            editable={editing}
          />
        </View>
        <View
          style={[styles.field, { backgroundColor: colors.backgroundElement }]}
        >
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Telepon
          </Text>
          <TextInput
            style={[styles.fieldInput, { color: colors.text }]}
            value={phone}
            onChangeText={setPhone}
            editable={editing}
            keyboardType="phone-pad"
          />
        </View>
        <View
          style={[styles.field, { backgroundColor: colors.backgroundElement }]}
        >
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Alamat
          </Text>
          <TextInput
            style={[styles.fieldInput, { color: colors.text }]}
            value={address}
            onChangeText={setAddress}
            editable={editing}
            multiline
          />
        </View>
        {editing ? (
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Simpan</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.editBtn, { borderColor: colors.textSecondary }]}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="create-outline" size={18} color={colors.text} />
            <Text style={[styles.editBtnText, { color: colors.text }]}>
              Edit Profil
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Pengaturan Aplikasi
        </Text>

        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.text}
          />
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            Notifikasi
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Ionicons name="wallet-outline" size={22} color={colors.text} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            Metode Pembayaran
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color={colors.text}
          />
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            Privasi & Keamanan
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Ionicons
            name="help-circle-outline"
            size={22}
            color={colors.text}
          />
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            Bantuan
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={colors.text}
          />
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            Tentang Aplikasi
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Keluar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: Spacing.six },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  email: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.three,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  field: {
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: Spacing.half,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  fieldInput: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
    padding: 0,
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    marginTop: Spacing.two,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: Spacing.two,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
});
