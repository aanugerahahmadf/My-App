import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, ActivityIndicator, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPackageDetail } from '@/services/api';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getPackageDetail(id as string);
      if (res.status === 'success') {
        setData(res.data);
      } else {
        setData(res);
      }
    } catch (error) {
      console.error('Error fetching package detail:', error);
      Alert.alert('Error', 'Gagal memuat detail paket.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  if (!data) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Data tidak ditemukan</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: data.image_url }} style={styles.image} />

        <ThemedView style={styles.content}>
          <ThemedView style={styles.headerInfo}>
            <ThemedText type="subtitle" style={styles.name}>{data.name}</ThemedText>
            <ThemedText style={styles.price}>
              Rp {Number(data.discount_price || data.price).toLocaleString('id-ID')}
            </ThemedText>
            {data.discount_price > 0 && (
              <ThemedText themeColor="textSecondary" style={styles.oldPrice}>
                Rp {Number(data.price).toLocaleString('id-ID')}
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.divider} />

          <ThemedView style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Deskripsi</ThemedText>
            <ThemedText style={styles.description}>
              {data.description || 'Tidak ada deskripsi tersedia untuk paket ini.'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.divider} />

          <ThemedView style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Organizer</ThemedText>
            <ThemedView style={styles.organizerCard}>
              <Ionicons name="business-outline" size={24} color={theme.icon} />
              <View style={styles.organizerInfo}>
                <ThemedText type="defaultSemiBold">{data.organizer?.name || 'Wedding Organizer'}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">{data.organizer?.address || 'Alamat tidak tersedia'}</ThemedText>
              </View>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <ThemedView style={styles.footer}>
        <TouchableOpacity style={styles.chatBtn}>
          <Ionicons name="chatbubble-outline" size={24} color={theme.tint} />
          <ThemedText style={{ color: theme.tint }}>Chat</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buyBtn, { backgroundColor: theme.tint }]}>
          <ThemedText style={styles.buyBtnText}>Tambah ke Keranjang</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: width,
  },
  content: {
    padding: 20,
  },
  headerInfo: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 24,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ee4d2d',
  },
  oldPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 15,
  },
  section: {
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  description: {
    lineHeight: 22,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  organizerInfo: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  chatBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  buyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
