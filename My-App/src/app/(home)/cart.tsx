import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';

type CartItem = {
  id: number;
  product?: { id: number; name: string; price: number; image?: string };
  package?: { id: number; name: string; price: number; image?: string };
  quantity: number;
  meta?: any;
};

export default function CartScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res: any = await apiGet(API.CART.INDEX);
      setItems(res.data || res || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await apiDelete(API.CART.DELETE(id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      Alert.alert('Error', 'Gagal menghapus item');
    }
  };

  const updateQuantity = async (id: number, qty: number) => {
    if (qty < 1) return;
    try {
      await apiPost(API.CART.UPDATE(id), { quantity: qty });
      fetchCart();
    } catch {
      // silent
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, []);

  const total = items.reduce(
    (sum, i) =>
      sum + (i.product?.price || i.package?.price || 0) * i.quantity,
    0
  );

  const renderItem = ({ item }: { item: CartItem }) => {
    const name = item.product?.name || item.package?.name || '';
    const price = item.product?.price || item.package?.price || 0;
    return (
      <View
        style={[styles.card, { backgroundColor: colors.backgroundElement }]}
      >
        <View style={styles.cardContent}>
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="image-outline"
              size={24}
              color={colors.textSecondary}
            />
          </View>
          <View style={styles.details}>
            <Text
              style={[styles.itemName, { color: colors.text }]}
              numberOfLines={2}
            >
              {name}
            </Text>
            <Text style={styles.itemPrice}>
              Rp {price.toLocaleString('id-ID')}
            </Text>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                style={[styles.qtyBtn, { borderColor: colors.textSecondary }]}
              >
                <Ionicons name="remove" size={16} color={colors.text} />
              </Pressable>
              <Text style={[styles.qtyText, { color: colors.text }]}>
                {item.quantity}
              </Text>
              <Pressable
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                style={[styles.qtyBtn, { borderColor: colors.textSecondary }]}
              >
                <Ionicons name="add" size={16} color={colors.text} />
              </Pressable>
            </View>
          </View>
          <Pressable
            onPress={() => removeItem(item.id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>
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
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons
              name="cart-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              Keranjang kosong
            </Text>
          </View>
        }
      />
      {items.length > 0 && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.backgroundSelected,
            },
          ]}
        >
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total
            </Text>
            <Text style={styles.totalValue}>
              Rp {total.toLocaleString('id-ID')}
            </Text>
          </View>
          <Pressable
            style={styles.checkoutBtn}
            onPress={async () => {
              try {
                await apiPost(API.ORDERS.CREATE, {});
                Alert.alert('Sukses', 'Pesanan berhasil dibuat');
                fetchCart();
              } catch {
                Alert.alert('Error', 'Gagal membuat pesanan');
              }
            }}
          >
            <Text style={styles.checkoutText}>Buat Pesanan</Text>
          </Pressable>
        </View>
      )}
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
  list: { padding: Spacing.three, paddingBottom: 120 },
  emptyText: {
    marginTop: Spacing.three,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  card: {
    borderRadius: 12,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
    marginRight: Spacing.two,
  },
  details: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.half,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: Spacing.one,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  deleteBtn: {
    padding: Spacing.two,
  },
  footer: {
    padding: Spacing.three,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.three,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  checkoutBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
});
