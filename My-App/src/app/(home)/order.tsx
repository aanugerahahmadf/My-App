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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { Colors, Spacing, BottomTabInset } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost } from '@/lib/api-client';
import { StaggeredEntrance } from '@/components/staggered-entrance';

type Order = {
  id: number;
  order_number: string;
  status: string;
  total_price: number;
  quantity: number;
  payment_status: string;
  booking_date: string;
  user_name?: string;
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

  const handleShareInvoice = (order: Order) => {
    const itemName = order.package?.name || order.product?.name || '';
    const dateStr = order.booking_date
      ? new Date(order.booking_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';
    const msg = `INVOICE #${order.order_number}\nItem: ${itemName}\nTanggal: ${dateStr}\nTotal: Rp ${order.total_price.toLocaleString('id-ID')}\nStatus: ${paymentStatusLabels[order.payment_status] || order.payment_status}`;
    Linking.openURL(`mailto:?subject=Invoice #${order.order_number}&body=${encodeURIComponent(msg)}`).catch(() =>
      Alert.alert('Info', 'Aplikasi email tidak tersedia')
    );
  };

  const handleSharePayment = (order: Order, via: 'whatsapp' | 'gmail' | 'messages') => {
    const itemName = order.package?.name || order.product?.name || '';
    const name = order.user_name || 'Pelanggan';
    const dateStr = order.booking_date
      ? new Date(order.booking_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';
    const totalStr = `Rp ${order.total_price.toLocaleString('id-ID')}`;
    const detail = `No. Pesanan: #${order.order_number}\nItem: ${itemName}\nTanggal: ${dateStr}\nTotal: ${totalStr}`;

    const isPaid = order.payment_status === 'paid' || order.payment_status === 'partial';
    const isCancelled = order.status === 'cancelled' || order.payment_status === 'cancelled';

    let msg: string;
    if (isCancelled) {
      msg = `CANCEL/BATAL:\nHALO, ${name} TELAH DI CANCEL\n${detail}`;
    } else if (isPaid) {
      msg = `SUDAH DIBAYAR/SUKSES BAYAR/ SUDAH CONFIRM PEMBAYRAN :\nHALO, ${name} ....:\n${detail}`;
    } else {
      msg = `BELUM DI BAYAR:\nHALO, ${name} HARUS MELAKUKAN PEMBAYARAN UNTUK:\n${detail}`;
    }

    switch (via) {
      case 'whatsapp': {
        const waUrl = `whatsapp://send?text=${encodeURIComponent(msg)}`;
        Linking.openURL(waUrl).catch(() => Alert.alert('Info', 'WhatsApp tidak terinstall'));
        break;
      }
      case 'gmail': {
        const subject = encodeURIComponent(`Pembayaran #${order.order_number} - Dekorasi Bunga Pernikahan`);
        const gmailUrl = `mailto:?subject=${subject}&body=${encodeURIComponent(msg)}`;
        Linking.openURL(gmailUrl).catch(() => Alert.alert('Info', 'Aplikasi email tidak tersedia'));
        break;
      }
      case 'messages': {
        const smsUrl = `sms:?body=${encodeURIComponent(msg)}`;
        Linking.openURL(smsUrl).catch(() => Alert.alert('Info', 'Aplikasi SMS tidak tersedia'));
        break;
      }
    }
  };

  const renderOrder = ({ item, index }: { item: Order; index: number }) => {
    const needsPayment =
      item.payment_status === 'unpaid' || item.payment_status === 'pending';
    const isPaying = payingId === item.id;

    return (
      <StaggeredEntrance index={index}>
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

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.backgroundSelected }]}
            onPress={() => handleShareInvoice(item)}
          >
            <Ionicons name="document-text-outline" size={16} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Bagikan</Text>
          </Pressable>

          <Pressable
            style={styles.shareIcon}
            onPress={() => handleSharePayment(item, 'whatsapp')}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </Pressable>

          <Pressable
            style={styles.shareIcon}
            onPress={() => handleSharePayment(item, 'gmail')}
          >
            <Ionicons name="mail-outline" size={20} color="#EA4335" />
          </Pressable>

          <Pressable
            style={styles.shareIcon}
            onPress={() => handleSharePayment(item, 'messages')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </Pressable>
      </StaggeredEntrance>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
    </SafeAreaView>
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
  list: { padding: Spacing.three, paddingBottom: BottomTabInset },
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  shareIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
