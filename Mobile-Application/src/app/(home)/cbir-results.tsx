import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

// Mock data for flowers and packages
const MOCK_DATA = [
  { id: '1', name: 'Paket Mawar Putih', type: 'package', price: 'Rp 5.000.000', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500' },
  { id: '2', name: 'Mawar Merah', type: 'flower', price: 'Rp 50.000', image: 'https://images.unsplash.com/photo-1548800136-2ab2186701d2?w=500' },
  { id: '3', name: 'Paket Rustic Gold', type: 'package', price: 'Rp 7.500.000', image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=500' },
  { id: '4', name: 'Lily Putih', type: 'flower', price: 'Rp 75.000', image: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?w=500' },
  { id: '5', name: 'Paket Garden Party', type: 'package', price: 'Rp 10.000.000', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500' },
  { id: '6', name: 'Tulip Kuning', type: 'flower', price: 'Rp 60.000', image: 'https://images.unsplash.com/photo-1520323232431-0165c717469a?w=500' },
];

export default function CbirResultsScreen() {
  const { imageUri, mode } = useLocalSearchParams();
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof MOCK_DATA[0] }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemType}>{item.type === 'package' ? 'Paket' : 'Bunga'}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hasil Pencarian Gambar</Text>
      </View>

      {imageUri && (
        <View style={styles.queryImageContainer}>
          <Text style={styles.queryText}>Mencari bunga yang mirip dengan:</Text>
          <Image source={{ uri: imageUri as string }} style={styles.queryImage} />
        </View>
      )}

      <FlatList
        data={MOCK_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  queryImageContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    alignItems: 'center',
  },
  queryText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  queryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: ITEM_WIDTH,
  },
  itemInfo: {
    padding: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginTop: 4,
  },
});
