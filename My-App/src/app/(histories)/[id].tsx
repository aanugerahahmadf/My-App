import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet } from '@/lib/api-client';
import Animated, { FadeIn } from 'react-native-reanimated';

type OrderItem = {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_price: number;
  booking_date: string;
  package?: { name: string };
  product?: { name: string };
};

type ReviewItem = {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  package?: { name: string };
  product?: { name: string };
};

type VoucherItem = {
  id: number;
  code: string;
  discount_amount: number | string;
  discount_type: 'percentage' | 'fixed';
  pivot?: { claimed_at?: string; used_at?: string | null };
};

type HistoryDetail = {
  kind: 'order' | 'review' | 'wishlist' | 'voucher';
  data: any;
};

const statusColorMap: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', preparing: '#8b5cf6',
  event_day: '#10b981', completed: '#10b981', cancelled: '#ef4444',
};

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const parsedId = parseInt(id, 10);
      const [ordersRes, reviewsRes, vouchersRes]: [any, any, any] = await Promise.all([
        apiGet(API.ORDERS.ALL).catch(() => null),
        apiGet(API.REVIEWS.USER).catch(() => null),
        apiGet(`${API.VOUCHERS.INDEX}/my`).catch(() => null),
      ]);

      const orders: OrderItem[] = ordersRes?.data || ordersRes || [];
      const foundOrder = orders.find((o: OrderItem) => o.id === parsedId);
      if (foundOrder) { setDetail({ kind: 'order', data: foundOrder }); setLoading(false); return; }

      const reviews: ReviewItem[] = reviewsRes?.data || reviewsRes || [];
      const foundReview = reviews.find((r: ReviewItem) => r.id === parsedId);
      if (foundReview) { setDetail({ kind: 'review', data: foundReview }); setLoading(false); return; }

      const vouchers: VoucherItem[] = vouchersRes?.data || vouchersRes || [];
      const foundVoucher = vouchers.find((v: VoucherItem) => v.id === parsedId);
      if (foundVoucher) { setDetail({ kind: 'voucher', data: foundVoucher }); setLoading(false); return; }

      setError('History entry not found');
    } catch (e: any) {
      setError(e.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchDetail(); }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !detail) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Entry not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const iconName = detail.kind === 'order' ? 'receipt' : detail.kind === 'review' ? 'chatbubble-ellipses' : detail.kind === 'voucher' ? 'pricetag' : 'heart';
  const iconColor = detail.kind === 'order' ? '#3b82f6' : detail.kind === 'review' ? '#f59e0b' : detail.kind === 'voucher' ? '#10b981' : '#ef4444';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {detail.kind === 'order' ? 'Order' : detail.kind === 'review' ? 'Review' : detail.kind === 'voucher' ? 'Voucher' : 'Wishlist'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView entering={FadeIn.duration(250)} contentContainerStyle={styles.content}>
        <View style={[styles.iconBanner, { backgroundColor: iconColor + '18' }]}>
          <Ionicons name={iconName} size={40} color={iconColor} />
        </View>

        {detail.kind === 'order' && (() => {
          const o = detail.data as OrderItem;
          const statusColor = statusColorMap[o.status] || '#6b7280';
          return (
            <>
              <Text style={[styles.title, { color: colors.text }]}>
                Order #{o.order_number}
              </Text>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{o.status.replace('_', ' ')}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Payment</Text>
                <Text style={[styles.value, { color: colors.text }]}>{o.payment_status}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Total</Text>
                <Text style={[styles.value, { color: colors.text, fontWeight: '700' }]}>
                  Rp {o.total_price.toLocaleString('id-ID')}
                </Text>
              </View>
              {o.booking_date && (
                <View style={styles.row}>
                  <Text style={styles.label}>Booking</Text>
                  <Text style={[styles.value, { color: colors.textSecondary }]}>
                    {new Date(o.booking_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              )}
            </>
          );
        })()}

        {detail.kind === 'review' && (() => {
          const r = detail.data as ReviewItem;
          return (
            <>
              <Text style={[styles.title, { color: colors.text }]}>
                Review {r.package?.name || r.product?.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name={s <= (r.rating || 0) ? 'star' : 'star-outline'} size={18} color="#f59e0b" />
                ))}
              </View>
              {r.comment && (
                <>
                  <Text style={[styles.label, { marginTop: Spacing.three }]}>Comment</Text>
                  <Text style={[styles.comment, { color: colors.textSecondary }]}>{r.comment}</Text>
                </>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Date</Text>
                <Text style={[styles.value, { color: colors.textSecondary }]}>
                  {new Date(r.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </>
          );
        })()}

        {detail.kind === 'voucher' && (() => {
          const v = detail.data as VoucherItem;
          const isUsed = v.pivot?.used_at != null;
          const discountText = v.discount_type === 'percentage'
            ? `${v.discount_amount}%`
            : `Rp ${Number(v.discount_amount).toLocaleString('id-ID')}`;
          return (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Voucher {v.code}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Discount</Text>
                <Text style={[styles.value, { color: colors.text, fontWeight: '700' }]}>{discountText}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: isUsed ? '#ef444420' : '#10b98120' }]}>
                  <Text style={[styles.statusText, { color: isUsed ? '#ef4444' : '#10b981' }]}>
                    {isUsed ? 'Used' : 'Active'}
                  </Text>
                </View>
              </View>
              {v.pivot?.claimed_at && (
                <View style={styles.row}>
                  <Text style={styles.label}>Claimed</Text>
                  <Text style={[styles.value, { color: colors.textSecondary }]}>
                    {new Date(v.pivot.claimed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              )}
            </>
          );
        })()}

        {detail.kind === 'wishlist' && (() => {
          const w = detail.data as any;
          return (
            <>
              <Text style={[styles.title, { color: colors.text }]}>{w.name || 'Favorite Item'}</Text>
              <Text style={[styles.comment, { color: colors.textSecondary }]}>
                Added to favorites on {new Date(w.created_at || w.date || w.pivot?.created_at || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </>
          );
        })()}
      </Animated.ScrollView>
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
  iconBanner: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: Spacing.three,
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.three },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.two, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  label: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  value: { fontSize: 13 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  comment: { fontSize: 14, lineHeight: 22, marginTop: 4 },
  errorText: { fontSize: 15, textAlign: 'center' },
});
