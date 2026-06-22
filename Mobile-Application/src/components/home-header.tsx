import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export function HomeHeader() {
  const router = useRouter();

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Navigate to CBIR results page with the image URI
      router.push({
        pathname: '/(home)/cbir-results',
        params: { imageUri: result.assets[0].uri, mode: 'camera' }
      });
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Navigate to CBIR results page with the image URI
      router.push({
        pathname: '/(home)/cbir-results',
        params: { imageUri: result.assets[0].uri, mode: 'gallery' }
      });
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Cari..."
          placeholderTextColor="#9ca3af"
        />
        <View style={styles.verticalDivider} />
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={openCamera} style={styles.actionButton}>
            <Ionicons name="camera-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openGallery} style={styles.actionButton}>
            <Ionicons name="image-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    gap: 12,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(156,163,175,0.4)',
    paddingHorizontal: 10,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#000',
    fontSize: 16,
  },
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(156,163,175,0.4)',
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  notificationButton: {
    padding: 4,
  },
});
