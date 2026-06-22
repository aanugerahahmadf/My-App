import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPut, apiDelete } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';

type ReviewItem = {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  package?: { id: number; name: string; price: number; image_url?: string };
  product?: { id: number; name: string; price: number; image_url?: string };
};

export default function ReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { t } = useLanguage();

  const [item, setItem] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReview = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiGet(API.REVIEWS.USER);
      const reviews: ReviewItem[] = res.data || res || [];
      const found = reviews.find((r) => r.id === parseInt(id!, 10));
      if (found) {
        setItem(found);
        setEditRating(found.rating);
        setEditComment(found.comment || '');
      } else {
        setError(t('Review not found'));
      }
    } catch (e: any) {
      setError(e.message || t('Failed to load review'));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchReview(); }, [id]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const res: any = await apiPut(API.REVIEWS.UPDATE(item.id), {
        rating: editRating,
        comment: editComment,
      });
      setItem(res.data || res);
      setEditing(false);
    } catch (e: any) {
      Alert.alert(t('Error'), e.message || t('Failed to update review'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t('Delete Review'), t('Are you sure?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: async () => {
          if (!item) return;
          try {
            await apiDelete(API.REVIEWS.DELETE(item.id));
            router.back();
          } catch (e: any) {
            Alert.alert(t('Error'), e.message || t('Failed to delete review'));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Review')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>{error || t('Review not found')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const itemObj = item.package || item.product;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Review')}</Text>
        <Pressable onPress={handleDelete} style={{ width: 40, alignItems: 'flex-end' }}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {itemObj && (
          <View style={[styles.itemCard, { backgroundColor: colors.backgroundElement }]}>
            {itemObj.image_url ? (
              <Image source={{ uri: itemObj.image_url }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumbPlaceholder, { backgroundColor: colors.backgroundSelected }]}>
                <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{itemObj.name}</Text>
              <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                Rp {(itemObj as any).price?.toLocaleString('id-ID') || ''}
              </Text>
            </View>
          </View>
        )}

        <Text style={[styles.label, { color: colors.text }]}>{t('Date')}</Text>
        <Text style={[styles.value, { color: colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </Text>

        {editing ? (
          <>
            <Text style={[styles.label, { color: colors.text, marginTop: Spacing.three }]}>{t('Rating')}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setEditRating(star)}>
                  <Ionicons
                    name={star <= editRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#f59e0b"
                  />
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text, marginTop: Spacing.three }]}>{t('Comment')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.backgroundSelected }]}
              value={editComment}
              onChangeText={setEditComment}
              multiline
              placeholder={t('Your review...')}
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.actionRow}>
              <Pressable onPress={() => { setEditing(false); setEditRating(item.rating); setEditComment(item.comment || ''); }}
                style={[styles.actionBtn, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.actionBtnText, { color: colors.text }]}>{t('Cancel')}</Text>
              </Pressable>
              <Pressable onPress={handleSave} disabled={saving}
                style={[styles.actionBtn, { backgroundColor: '#3b82f6', opacity: saving ? 0.6 : 1 }]}>
                <Text style={styles.actionBtnTextPrimary}>{saving ? t('Saving...') : t('Save')}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.label, { color: colors.text, marginTop: Spacing.three }]}>{t('Rating')}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name={star <= item.rating ? 'star' : 'star-outline'} size={22} color="#f59e0b" />
              ))}
            </View>

            {item.comment && (
              <>
                <Text style={[styles.label, { color: colors.text, marginTop: Spacing.three }]}>{t('Comment')}</Text>
                <Text style={[styles.comment, { color: colors.textSecondary }]}>{item.comment}</Text>
              </>
            )}

            <Pressable onPress={() => setEditing(true)}
              style={[styles.editBtn, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="pencil-outline" size={16} color={colors.text} />
              <Text style={[styles.editBtnText, { color: colors.text }]}>{t('Edit Review')}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three, padding: Spacing.five },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  content: { padding: Spacing.three, paddingBottom: Spacing.six },
  itemCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
    borderRadius: 12, padding: Spacing.two, marginBottom: Spacing.three,
  },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  thumbPlaceholder: { width: 56, height: 56, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemPrice: { fontSize: 12, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  value: { fontSize: 14 },
  starsRow: { flexDirection: 'row', gap: 4 },
  comment: { fontSize: 14, lineHeight: 22 },
  input: { borderRadius: 12, borderWidth: 1, padding: Spacing.two, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
  actionRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  actionBtnTextPrimary: { color: '#fff', fontSize: 14, fontWeight: '600' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginTop: Spacing.three },
  editBtnText: { fontSize: 13, fontWeight: '600' },
  errorText: { fontSize: 15, textAlign: 'center' },
});
