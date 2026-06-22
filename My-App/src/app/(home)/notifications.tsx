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

import { Colors, Spacing } from "@/constants/theme";
import { apiGet } from "@/lib/api-client";
import { API } from "@/lib/endpoints";
import { useLanguage } from "@/lib/language-context";

type Notification = {
  id: number;
  title: string;
  body: string;
  type: string;
  read_at: string | null;
  created_at: string;
};

const TYPE_META: Record<
  string,
  {
    icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
    color: string;
  }
> = {
  order_update: { icon: "receipt-outline", color: "#3b82f6" },
  promotion: { icon: "pricetag-outline", color: "#ec4899" },
  message: { icon: "chatbubble-outline", color: "#8b5cf6" },
  reminder: { icon: "calendar-outline", color: "#f59e0b" },
  payment: { icon: "card-outline", color: "#10b981" },
  system: { icon: "information-circle-outline", color: "#6b7280" },
};

function getMeta(type: string) {
  return (
    TYPE_META[type] ?? {
      icon: "notifications-outline" as const,
      color: "#3b82f6",
    }
  );
}

// Map notification type → in-app destination route
const TYPE_ROUTE: Record<string, string> = {
  order_update: "/(home)/histories",
  reminder: "/(home)/histories",
  payment: "/(home)/histories",
  message: "/(home)/messages",
  promotion: "/(home)/packages",
  system: "/(home)/notifications",
};

function getRoute(type: string): string {
  return TYPE_ROUTE[type] ?? "/(home)/notifications";
}

function timeAgo(dateStr: string, tFn: (key: string) => string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return tFn("Just now");
  if (diffMin < 60) return tFn("{n}m ago").replace("{n}", String(diffMin));
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return tFn("{n}h ago").replace("{n}", String(diffHr));
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return tFn("{n}d ago").replace("{n}", String(diffDay));
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

// Fallback demo data when API has no notifications yet
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Booking Confirmed",
    body: "Your wedding booking has been confirmed. We look forward to making your special day perfect!",
    type: "order_update",
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 2,
    title: "Special Promo – 20% Off",
    body: "Get 20% off all wedding packages this weekend. Use code WEDDING20 at checkout.",
    type: "promotion",
    read_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 3,
    title: "New Message from Admin",
    body: "The wedding coordinator has sent you a message. Tap to view the full conversation.",
    type: "message",
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 4,
    title: "Event Reminder",
    body: "Your wedding is in 7 days! Please confirm your guest list and final details.",
    type: "reminder",
    read_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 5,
    title: "Payment Received",
    body: "We have received your payment of Rp 5,000,000. Your booking is now active.",
    type: "payment",
    read_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export default function NotificationsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const res: any = await apiGet(API.NOTIFICATIONS.LIST);
      const data: Notification[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
      setNotifications(data.length > 0 ? data : DEMO_NOTIFICATIONS);
      // Mark already-read items
      const alreadyRead = new Set<number>(
        data
          .filter((n: Notification) => n.read_at !== null)
          .map((n: Notification) => n.id),
      );
      setReadIds(alreadyRead);
    } catch {
      setNotifications(DEMO_NOTIFICATIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const markAsRead = (id: number) => {
    setReadIds((prev) => new Set([...prev, id]));
    apiGet(API.NOTIFICATIONS.READ(id)).catch(() => {});
  };

  const handlePress = (item: Notification) => {
    markAsRead(item.id);
    const route = getRoute(item.type);
    router.push(route as any);
  };

  const markAllRead = () => {
    const allIds = new Set<number>(notifications.map((n) => n.id));
    setReadIds(allIds);
    apiGet(API.NOTIFICATIONS.READ_ALL).catch(() => {});
  };

  const unreadCount = notifications.filter(
    (n) => !readIds.has(n.id) && n.read_at === null,
  ).length;

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
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("Notifications")}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <Pressable style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllText}>{t("Read all")}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="notifications-off-outline"
                size={40}
                color={colors.textSecondary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("No Notifications Yet")}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t("You're all caught up! New notifications will appear here.")}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        renderItem={({ item }) => {
          const meta = getMeta(item.type);
          const isRead = readIds.has(item.id) || item.read_at !== null;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.backgroundElement },
                !isRead && styles.cardUnread,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handlePress(item)}
              android_ripple={{
                color: "rgba(59,130,246,0.08)",
                borderless: false,
              }}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: meta.color + "20" },
                ]}
              >
                <Ionicons name={meta.icon} size={20} color={meta.color} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: colors.text },
                      !isRead && styles.cardTitleUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {t(item.title)}
                  </Text>
                  {!isRead && (
                    <View
                      style={[
                        styles.unreadDot,
                        { backgroundColor: meta.color },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[styles.cardBody2, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {t(item.body)}
                </Text>
                <Text
                  style={[styles.cardTime, { color: colors.textSecondary }]}
                >
                  {timeAgo(item.created_at, t)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textSecondary}
                style={styles.chevron}
              />
            </Pressable>
          );
        }}
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
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  list: { padding: Spacing.three },
  emptyContainer: { flex: 1 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.six,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(128,128,128,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: Spacing.one,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardBody2: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  cardTitleUnread: { fontWeight: "800" },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  cardTime: {
    fontSize: 11,
    marginTop: 5,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  cardPressed: {
    opacity: 0.75,
  },
  chevron: {
    alignSelf: "center",
    flexShrink: 0,
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(59,130,246,0.12)",
  },
  markAllText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
});
