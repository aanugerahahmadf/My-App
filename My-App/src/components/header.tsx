import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ActionSheetIOS,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { Colors, Spacing, Shadows } from '@/constants/theme';
import { PressableScale } from '@/components/pressable-scale';
import { useLanguage } from '@/lib/language-context';

export default function Header() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (!searchText.trim()) return;
    router.push(`/(home)/cbir?q=${encodeURIComponent(searchText.trim())}`);
  };

  const handleCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('Camera Permission'), t('Camera not allowed'));
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
      Alert.alert(t('Error'), t('Failed to open camera'));
    }
  };

  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('Gallery Permission'), t('Gallery not allowed'));
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
      Alert.alert(t('Error'), t('Failed to open gallery'));
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
      Alert.alert(t('Error'), t('Failed to pick file'));
    }
  };

  const handleFilePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('Cancel'), t('Gallery'), t('File'), 'Google Drive', 'iCloud'],
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
      Alert.alert(t('Select Source'), t('Select image source'), [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Gallery'), onPress: pickFromGallery },
        {
          text: t('File / Google Drive'),
          onPress: pickFromFiles,
        },
      ]);
    }
  };

  const isDark = scheme === 'dark';
  const tint = isDark ? '#6C9FFF' : '#4A7CF7';
  const bgElement = isDark
    ? 'rgba(255,255,255,0.07)'
    : 'rgba(0,0,0,0.04)';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.searchRow}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: isFocused
                ? isDark
                  ? 'rgba(108,159,255,0.08)'
                  : 'rgba(74,124,247,0.06)'
                : isDark
                ? 'rgba(255,255,255,0.06)'
                : '#F5F6FA',
              borderColor: isFocused
                ? tint
                : isDark
                ? 'rgba(255,255,255,0.15)'
                : 'rgba(0,0,0,0.08)',
              ...Shadows.sm,
              shadowOpacity: isFocused ? 0.25 : 0.08,
              shadowRadius: isFocused ? 16 : 8,
              shadowColor: isFocused ? tint : isDark ? '#fff' : '#000',
            },
          ]}
        >
          <Ionicons
            name="search"
            size={18}
            color={isFocused ? tint : colors.textSecondary}
            style={styles.searchIcon}
          />

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder=""
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        <PressableScale
          onPress={handleCamera}
          style={[styles.iconBtn, { backgroundColor: bgElement }]}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={colors.textSecondary}
          />
        </PressableScale>

        <PressableScale
          onPress={handleFilePicker}
          style={[styles.iconBtn, { backgroundColor: bgElement }]}
        >
          <Ionicons
            name="images-outline"
            size={20}
            color={colors.textSecondary}
          />
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
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
    borderRadius: 14,
    borderWidth: 1.2,
    paddingLeft: Spacing.two,
    height: 46,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
    height: 46,
    paddingVertical: 0,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
});
