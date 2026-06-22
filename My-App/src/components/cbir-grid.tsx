import {
  View,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Text,
  FlatList,
  Dimensions,
  type RefreshControlProps,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_GAP = Spacing.two;
const ITEM_WIDTH = (SCREEN_WIDTH - Spacing.three * 2 - ITEM_GAP) / COLUMN_COUNT;

export type CbirItem = {
  id: number;
  type: 'package' | 'product';
  name: string;
  image: string;
  price: number;
  similarity?: number;
};

type CbirGridProps = {
  items: CbirItem[];
  loading: boolean;
  error?: string;
  onPress?: (item: CbirItem) => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

export default function CbirGrid({ items, loading, error, onPress, refreshControl }: CbirGridProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const renderItem = ({ item }: { item: CbirItem }) => (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          width: ITEM_WIDTH,
        },
      ]}
      onPress={() => onPress?.(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        {item.similarity !== undefined && (
          <View style={styles.similarityBadge}>
            <Text style={styles.similarityText}>
              {Math.round(item.similarity * 100)}%
            </Text>
          </View>
        )}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            {item.type === 'package' ? 'Paket' : 'Bunga'}
          </Text>
        </View>
        <Text
          style={[styles.itemName, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          Rp {item.price.toLocaleString('id-ID')}
        </Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Mencari...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Hasil pencarian akan muncul di sini
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      numColumns={COLUMN_COUNT}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.five,
  },
  loadingText: {
    marginTop: Spacing.three,
    fontSize: 14,
  },
  errorText: {
    marginTop: Spacing.three,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: Spacing.three,
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: Spacing.three,
  },
  row: {
    gap: ITEM_GAP,
    marginBottom: ITEM_GAP,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: ITEM_WIDTH * 1.2,
  },
  cardContent: {
    padding: Spacing.two,
  },
  similarityBadge: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  similarityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: Spacing.one,
  },
  typeText: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '600',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.half,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
});
