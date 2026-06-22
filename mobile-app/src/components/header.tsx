import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ActionSheetIOS,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useColorScheme } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export default function Header() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    if (!searchText.trim()) return;
    router.push(`/(home)/cbir?q=${encodeURIComponent(searchText.trim())}`);
  };

  const handleCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin Kamera', 'Kamera tidak diizinkan');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: false,
      });
      if (!result.canceled && result.assets[0]) {
        router.push(
          `/(home)/cbir?image=${encodeURIComponent(result.assets[0].uri)}`
        );
      }
    } catch {
      Alert.alert('Error', 'Gagal membuka kamera');
    }
  };

  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin Galeri', 'Galeri tidak diizinkan');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        base64: false,
      });
      if (!result.canceled && result.assets[0]) {
        router.push(
          `/(home)/cbir?image=${encodeURIComponent(result.assets[0].uri)}`
        );
      }
    } catch {
      Alert.alert('Error', 'Gagal membuka galeri');
    }
  };

  const pickFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        router.push(
          `/(home)/cbir?image=${encodeURIComponent(result.assets[0].uri)}`
        );
      }
    } catch {
      Alert.alert('Error', 'Gagal mengambil file');
    }
  };

  const handleFilePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Batal', 'Galeri', 'File', 'Google Drive', 'iCloud'],
          cancelButtonIndex: 0,
        },
        (index) => {
          switch (index) {
            case 1:
              pickFromGallery();
              break;
            case 2:
              pickFromFiles();
              break;
            case 3:
              pickFromFiles();
              break;
            case 4:
              pickFromFiles();
              break;
          }
        }
      );
    } else {
      Alert.alert('Pilih Sumber', 'Pilih sumber gambar', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Galeri', onPress: pickFromGallery },
        {
          text: 'File / Google Drive',
          onPress: pickFromFiles,
        },
      ]);
    }
  };

  const handleNotification = () => {
    router.push('/(home)/messages');
  };

  const isDark = scheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchRow}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
              borderColor: isDark
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(0,0,0,0.1)',
              shadowColor: isDark ? '#fff' : '#000',
            },
          ]}
        >
          <Ionicons
            name="search"
            size={18}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Cari paket bunga atau bunga..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />

          <View
            style={[
              styles.cbirSection,
              {
                borderLeftColor: isDark
                  ? 'rgba(255,255,255,0.25)'
                  : 'rgba(0,0,0,0.15)',
              },
            ]}
          >
            <Pressable
              onPress={handleCamera}
              style={({ pressed }) => [
                styles.cbirBtn,
                pressed && styles.cbirBtnPressed,
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>

            <Pressable
              onPress={handleFilePicker}
              style={({ pressed }) => [
                styles.cbirBtn,
                pressed && styles.cbirBtnPressed,
              ]}
            >
              <Ionicons
                name="images-outline"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleNotification}
          style={({ pressed }) => [
            styles.notifBtn,
            pressed && styles.notifBtnPressed,
          ]}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    paddingTop: Platform.OS === 'ios' ? 50 : Spacing.three,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: Spacing.two,
    height: 44,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
    height: 44,
    paddingVertical: 0,
  },
  cbirSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderLeftWidth: 1,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.one,
    alignSelf: 'stretch',
  },
  cbirBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cbirBtnPressed: {
    opacity: 0.6,
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBtnPressed: {
    opacity: 0.6,
  },
});
