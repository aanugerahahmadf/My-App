import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost } from '@/lib/api-client';

type Order = {
  id: number;
  order_number: string;
  status: string;
  total_price: number;
  quantity: number;
  payment_status: string;
  booking_date: string;
  package?: { id: number; name: string };
  product?: { id: number; name: string };
};

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#8b5cf6',
  event_day: '#10b981',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const statusLabels: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  preparing: 'Disiapkan',
  event_day: 'Hari-H',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const paymentStatusColors: Record<string, string> = {
  unpaid: '#ef4444',
  pending: '#f59e0b',
  paid: '#10b981',
  failed: '#ef4444',
  partial: '#8b5cf6',
  refunded: '#6b7280',
  cancelled: '#6b7280',
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: 'Belum Dibayar',
  pending: 'Menunggu',
  paid: 'Lunas',
  failed: 'Gagal',
  partial: 'DP',
  refunded: 'Dikembalikan',
  cancelled: 'Dibatalkan',
};

export default function OrderScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      const res: any = await apiGet(API.ORDERS.ALL);
      setOrders(res.data || res || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const handlePay = async (orderId: number) => {
    setPayingId(orderId);
    try {
      const res: any = await apiPost(API.ORDERS.PAY(orderId));
      const paymentUrl = res.data?.payment_url || res.payment_url;

      if (paymentUrl) {
        const result = await WebBrowser.openAuthSessionAsync(paymentUrl);
        if (result.type === 'success') {
          fetchOrders();
          Alert.alert('Sukses', 'Pembayaran berhasil diproses');
        }
      } else {
        Alert.alert('Info', 'Pembayaran sedang diproses');
      }
    } catch {
      Alert.alert('Error', 'Gagal memproses pembayaran');
    } finally {
      setPayingId(null);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const needsPayment =
      item.payment_status === 'unpaid' || item.payment_status === 'pending';
    const isPaying = payingId === item.id;

    return (
      <Pressable
        style={[styles.card, { backgroundColor: colors.backgroundElement }]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.orderNo, { color: colors.text }]}>
            #{item.order_number}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: (statusColors[item.status] || '#999') + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColors[item.status] || '#999' },
              ]}
            >
              {statusLabels[item.status] || item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text
            style={[styles.itemName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.package?.name || item.product?.name || ''}
          </Text>
          <Text style={styles.totalPrice}>
            Rp {item.total_price.toLocaleString('id-ID')}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date(item.booking_date).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          <View
            style={[
              styles.paymentBadge,
              {
                backgroundColor:
                  (paymentStatusColors[item.payment_status] || '#999') + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.paymentStatusText,
                { color: paymentStatusColors[item.payment_status] || '#999' },
              ]}
            >
              {paymentStatusLabels[item.payment_status] || item.payment_status}
            </Text>
          </View>
        </View>

        {needsPayment && (
          <Pressable
            style={[styles.payBtn, isPaying && styles.payBtnDisabled]}
            onPress={() => handlePay(item.id)}
            disabled={isPaying}
          >
            {isPaying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payBtnText}>Bayar Sekarang</Text>
            )}
          </Pressable>
        )}
      </Pressable>
    );
  };

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
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrders();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons
              name="receipt-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada pesanan
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.five,
  },
  list: { padding: Spacing.three },
  emptyText: {
    marginTop: Spacing.three,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  card: {
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  orderNo: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  cardBody: {
    marginBottom: Spacing.one,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: Spacing.half,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  date: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  paymentBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  payBtn: {
    marginTop: Spacing.three,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
});
