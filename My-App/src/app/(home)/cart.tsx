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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Shadows } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';
import { PressableScale } from '@/components/pressable-scale';
import { StaggeredEntrance } from '@/components/staggered-entrance';

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
  const router = useRouter();
  const { t } = useLanguage();
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

  const renderItem = ({ item, index }: { item: CartItem; index: number }) => {
    const name = item.product?.name || item.package?.name || '';
    const price = item.product?.price || item.package?.price || 0;
    return (
      <StaggeredEntrance index={index}>
      <View
        style={[styles.card, { backgroundColor: colors.backgroundElement }, Shadows.sm]}
      >
        <View style={styles.cardContent}>
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.background }]}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundSelected, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons
                name="image-outline"
                size={20}
                color={colors.textSecondary}
              />
            </View>
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
            Shadows.sm,
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
          <View style={styles.iconBar}>
            <PressableScale
              onPress={async () => {
                try {
                  const res: any = await apiPost(API.CHAT.START);
                  const inboxId = res.data?.id || res.id;
                  if (!inboxId) {
                    Alert.alert(t('Error'), t('Could not start conversation.'));
                    return;
                  }
                  await apiPost(API.CHAT.SEND, {
                    inbox_id: inboxId,
                    message: t('Hi admin, I have a question about my order.'),
                  });
                  router.push(`/(messages)/${inboxId}` as any);
                } catch {
                  Alert.alert(t('Error'), t('Failed to start chat'));
                }
              }}
              style={[styles.iconBtn, { backgroundColor: colors.backgroundElement }]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color={colors.text}
              />
            </PressableScale>
            <PressableScale
              onPress={() => router.push('/(favorites)' as any)}
              style={[styles.iconBtn, { backgroundColor: colors.backgroundElement }]}
            >
              <Ionicons name="heart-outline" size={22} color="#ef4444" />
            </PressableScale>
            <PressableScale
              onPress={() => router.push('/(checkout)/cart/0' as any)}
              style={[styles.iconBtn, styles.buyIconBtn]}
            >
              <Ionicons name="bag-handle-outline" size={22} color="#fff" />
            </PressableScale>
          </View>
        </View>
      )}
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
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ef444415',
    justifyContent: 'center',
    alignItems: 'center',
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
  iconBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyIconBtn: {
    backgroundColor: '#3b82f6',
    flex: 1,
    maxWidth: 140,
    borderRadius: 16,
  },
});
