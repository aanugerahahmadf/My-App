import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiDelete } from '@/lib/api-client';

type Review = {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  package?: { id: number; name: string; price: number; image_url?: string };
  product?: { id: number; name: string; price: number; image_url?: string };
  user?: { id: number; full_name: string; avatar_url?: string };
};

export default function ReviewsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res: any = await apiGet(API.REVIEWS.USER);
      setReviews(res.data || res || []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const handleDelete = (id: number) => {
    apiDelete(API.REVIEWS.DELETE(id));
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={14}
        color="#f59e0b"
      />
    ));
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
          {item.package?.name || item.product?.name || ''}
        </Text>
      </View>
      <View style={styles.ratingRow}>{renderStars(item.rating)}</View>
      {item.comment && (
        <Text style={[styles.comment, { color: colors.textSecondary }]}>
          {item.comment}
        </Text>
      )}
      <View style={styles.cardFooter}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString('id-ID')}
        </Text>
        <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="star-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada ulasan
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.five },
  list: { padding: Spacing.three },
  emptyText: { marginTop: Spacing.three, fontSize: 14 },
  card: { borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.three },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.one },
  itemName: { fontSize: 14, fontWeight: '700', flex: 1 },
  ratingRow: { flexDirection: 'row', gap: 2, marginBottom: Spacing.one },
  comment: { fontSize: 13, marginBottom: Spacing.two, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12 },
  deleteBtn: { padding: Spacing.half },
});