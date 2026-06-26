import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing, BottomTabInset } from "@/constants/theme";
import { apiGet } from "@/lib/api-client";
import { API } from "@/lib/endpoints";
import { useLanguage } from "@/lib/language-context";
import { StaggeredEntrance } from "@/components/staggered-entrance";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type WishlistItem = {
  id: number;
  name: string;
  resource_type: string;
  created_at: string;
};

type VoucherItem = {
  id: number;
  code: string;
  discount_amount: number | string;
  discount_type: "percentage" | "fixed";
  pivot?: { claimed_at?: string; used_at?: string | null };
};

type HistoryEntry = {
  key: string;
  kind: "order" | "review" | "wishlist" | "voucher";
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  badgeLabel?: string;
  badgeColor?: string;
  route?: string;
  rating?: number;
};

// ─── Label / color maps ────────────────────────────────────────────────────────

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  event_day: "#10b981",
  completed: "#10b981",
  cancelled: "#ef4444",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  event_day: "Event Day",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  partial: "Down Payment",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function HistoriesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  const { t } = useLanguage();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const buildEntries = useCallback(async () => {
    try {
      const [ordersRes, reviewsRes, wishlistRes, vouchersRes] =
        await Promise.all([
          apiGet(API.ORDERS.ALL).catch(() => []),
          apiGet(API.REVIEWS.USER).catch(() => []),
          apiGet(API.WISHLIST.INDEX).catch(() => []),
          apiGet(`${API.VOUCHERS.INDEX}/my`).catch(() => []),
        ]);

      const orders: OrderItem[] = ordersRes?.data || ordersRes || [];
      const reviews: ReviewItem[] = reviewsRes?.data || reviewsRes || [];
      const wishlists: WishlistItem[] = wishlistRes?.data || wishlistRes || [];
      const vouchers: VoucherItem[] = vouchersRes?.data || vouchersRes || [];

      const all: HistoryEntry[] = [];

      // ── Orders ──────────────────────────────────────────────────────────────
      for (const o of orders) {
        const itemName = o.package?.name || o.product?.name || t("Order");
        const statusColor =
          ORDER_STATUS_COLORS[o.status?.toLowerCase()] || "#6b7280";
        const statusKey =
          ORDER_STATUS_LABELS[o.status?.toLowerCase()] || o.status;
        const paymentKey =
          PAYMENT_LABELS[o.payment_status?.toLowerCase()] || o.payment_status;
        all.push({
          key: `order-${o.id}`,
          kind: "order",
          date: o.booking_date,
          icon: "receipt-outline",
          iconColor: statusColor,
          title: t("Order • {itemName}").replace("{itemName}", itemName),
          subtitle: `Rp ${Number(o.total_price).toLocaleString("id-ID")} · ${t("Payment")}: ${t(paymentKey)}`,
          badgeLabel: statusKey,
          badgeColor: statusColor,
          route: "/(home)/order",
        });
      }

      // ── Reviews ─────────────────────────────────────────────────────────────
      for (const r of reviews) {
        const itemName = r.package?.name || r.product?.name || t("Item");
        all.push({
          key: `review-${r.id}`,
          kind: "review",
          date: r.created_at,
          icon: "star-outline",
          iconColor: "#f59e0b",
          title: t("Review • {itemName}").replace("{itemName}", itemName),
          subtitle: r.comment ? `"${r.comment}"` : "",
          rating: r.rating,
          route: "/(home)/reviews",
        });
      }

      // ── Wishlist ─────────────────────────────────────────────────────────────
      for (const w of wishlists) {
        all.push({
          key: `wishlist-${w.id}`,
          kind: "wishlist",
          date: w.created_at,
          icon: "heart-outline",
          iconColor: "#ef4444",
          title: t("Added to Favorites • {name}").replace("{name}", w.name),
          subtitle: "",
          route: "/(home)/favorites",
        });
      }

      // ── Vouchers ─────────────────────────────────────────────────────────────
      for (const v of vouchers) {
        const amount = Number(v.discount_amount);
        const discountText =
          v.discount_type === "percentage"
            ? `${amount}%`
            : `Rp ${amount.toLocaleString("id-ID")}`;
        const used = v.pivot?.used_at != null;
        all.push({
          key: `voucher-${v.id}`,
          kind: "voucher",
          date: v.pivot?.claimed_at || new Date().toISOString(),
          icon: "ticket-outline",
          iconColor: used ? "#6b7280" : "#10b981",
          title: t("Voucher claimed • {code}").replace("{code}", v.code),
          subtitle: t("Discount {discountText}").replace(
            "{discountText}",
            discountText,
          ),
          badgeLabel: used ? t("Used") : t("Active"),
          badgeColor: used ? "#6b7280" : "#10b981",
          route: "/(home)/vouchers",
        });
      }

      // Sort by date desc
      all.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setEntries(all);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.resolve().then(buildEntries);
  }, [buildEntries]);

  const onRefresh = () => {
    setRefreshing(true);
    buildEntries();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.backgroundSelected },
        ]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("Activity History")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
          />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <StaggeredEntrance index={index}>
          <Pressable
            style={styles.historyItem}
            onPress={() =>
              router.push(`/(histories)/${item.key.split("-")[1]}` as any)
            }
          >
            <View style={styles.cardRow}>
              {/* Icon */}
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: item.iconColor + "18" },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>

              {/* Info */}
              <View style={styles.infoWrapper}>
                <Text
                  style={[styles.entryTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.rating !== undefined && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                      marginVertical: 2,
                    }}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <Ionicons
                        key={i}
                        name={i < item.rating! ? "star" : "star-outline"}
                        size={12}
                        color="#f59e0b"
                      />
                    ))}
                  </View>
                )}
                {item.subtitle ? (
                  <Text
                    style={[
                      styles.entrySubtitle,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>

              {/* Right: badge + chevron */}
              <View style={styles.rightWrapper}>
                {item.badgeLabel && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: (item.badgeColor || "#6b7280") + "18",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: item.badgeColor || "#6b7280" },
                      ]}
                    >
                      {t(item.badgeLabel)}
                    </Text>
                  </View>
                )}
                {item.route && (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textSecondary}
                  />
                )}
              </View>
            </View>

            {/* Date footer */}
            <View style={styles.cardFooter}>
              <Ionicons
                name="time-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {new Date(item.date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </Pressable>
          </StaggeredEntrance>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="time-outline"
              size={52}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("No activity yet")}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t(
                "All your orders, reviews, favorites, and claimed vouchers will appear here.",
              )}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },

  list: { padding: Spacing.three, paddingBottom: BottomTabInset },

  historyItem: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  infoWrapper: {
    flex: 1,
    gap: 3,
  },
  entryTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  entrySubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  rightWrapper: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.08)",
  },
  dateText: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },

  empty: {
    alignItems: "center",
    paddingTop: Spacing.six,
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
});
