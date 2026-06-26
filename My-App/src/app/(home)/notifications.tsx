import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing, Shadows, BottomTabInset } from "@/constants/theme";
import { apiGet } from "@/lib/api-client";
import { API } from "@/lib/endpoints";
import { useLanguage } from "@/lib/language-context";
import { StaggeredEntrance } from "@/components/staggered-entrance";

type Notification = {
  id: number;
  title: string;
  body: string;
  type: string;
  read_at: string | null;
  created_at: string;
};

const TYPE_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  order_update: { icon: "receipt-outline", color: "#3b82f6" },
  promotion: { icon: "pricetag-outline", color: "#ec4899" },
  message: { icon: "chatbubble-outline", color: "#8b5cf6" },
  reminder: { icon: "calendar-outline", color: "#f59e0b" },
  payment: { icon: "card-outline", color: "#10b981" },
  system: { icon: "information-circle-outline", color: "#6b7280" },
};

function getMeta(type: string) {
  return TYPE_META[type] ?? { icon: "notifications-outline" as const, color: "#3b82f6" };
}

const TYPES = ["order_update", "promotion", "message", "reminder", "payment", "system"] as const;

const TITLE_POOL: Record<string, string[]> = {
  order_update: ["Status Pesanan", "Update Pesanan", "Info Pesanan"],
  promotion: ["Promo Hari Ini", "Diskon Spesial", "Penawaran Terbatas"],
  message: ["Pesan Baru", "Informasi", "Pemberitahuan"],
  reminder: ["Pengumuman", "Info Terkini", "Pengingat"],
  payment: ["Konfirmasi", "Notifikasi", "Info Pembayaran"],
  system: ["Sistem", "Update Aplikasi", "Info Platform"],
};

const BODY_POOL: Record<string, string[]> = {
  order_update: ["Ada update terbaru mengenai pesanan Anda.", "Status pesanan Anda telah berubah.", "Informasi terbaru terkait pesanan tersedia."],
  promotion: ["Dapatkan penawaran spesial hari ini.", "Promo menarik sedang berlangsung.", "Jangan lewatkan diskon spesial kali ini."],
  message: ["Anda menerima pesan baru.", "Ada pesan masuk untuk Anda.", "Pesan baru telah diterima."],
  reminder: ["Info terbaru untuk Anda.", "Ada informasi yang perlu Anda ketahui.", "Update terkini tersedia."],
  payment: ["Pembayaran Anda telah diproses.", "Status pembayaran telah diperbarui.", "Konfirmasi pembayaran diterima."],
  system: ["Ada pembaruan sistem terbaru.", "Info terbaru dari platform.", "Pemberitahuan sistem."],
};

function generateDummy(): Notification[] {
  const items: Notification[] = [];
  for (let i = 0; i < 8; i++) {
    const type = TYPES[i % TYPES.length];
    const titles = TITLE_POOL[type];
    const bodies = BODY_POOL[type];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const body = bodies[Math.floor(Math.random() * bodies.length)];
    const read = Math.random() > 0.5;
    const minutesAgo = Math.floor(Math.random() * 10080) + 1;
    items.push({
      id: i + 1,
      title,
      body,
      type,
      read_at: read ? new Date().toISOString() : null,
      created_at: new Date(Date.now() - minutesAgo * 60000).toISOString(),
    });
  }
  return items;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}j`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}h`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function NotificationsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const res: any = await apiGet(API.NOTIFICATIONS.LIST);
      const data: Notification[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setNotifications(data.length > 0 ? data : generateDummy());
      setReadIds(new Set(data.filter((n: Notification) => n.read_at !== null).map((n: Notification) => n.id)));
    } catch {
      setNotifications(generateDummy());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const visible = notifications.filter((n) => !deletedIds.has(n.id));

  const markAsRead = (id: number) => {
    setReadIds((prev) => new Set([...prev, id]));
    apiGet(API.NOTIFICATIONS.READ(id)).catch(() => {});
  };

  const handlePress = (item: Notification) => {
    markAsRead(item.id);
    const route = TYPE_ROUTE[item.type];
    if (route) router.push(route as any);
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
    apiGet(API.NOTIFICATIONS.READ_ALL).catch(() => {});
  };

  const handleDelete = (item: Notification) => {
    Alert.alert("Hapus notifikasi?", item.title, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => setDeletedIds((prev) => new Set([...prev, item.id])),
      },
    ]);
  };

  const unreadCount = visible.filter((n) => !readIds.has(n.id) && n.read_at === null).length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifikasi</Text>
          <View style={[styles.countBadge, { backgroundColor: "#3b82f6" }]}>
            <Text style={styles.countText}>{visible.length}</Text>
          </View>
        </View>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllRead}>
            <Text style={[styles.markAllLink, { color: "#3b82f6" }]}>Tandai terbaca</Text>
          </Pressable>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={visible.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={44} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada notifikasi</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Notifikasi baru akan muncul di sini</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const meta = getMeta(item.type);
          const isRead = readIds.has(item.id) || item.read_at !== null;
          return (
            <StaggeredEntrance index={index} offset={40}>
            <Pressable
              onPress={() => handlePress(item)}
              onLongPress={() => handleDelete(item)}
              style={[styles.card, { backgroundColor: colors.backgroundElement }, !isRead && styles.cardUnread]}
            >
              <View style={[styles.iconCircle, { backgroundColor: meta.color + "15" }]}>
                <Ionicons name={meta.icon} size={18} color={meta.color} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }, !isRead && styles.cardTitleBold]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!isRead && <View style={styles.dot} />}
                </View>
                <Text style={[styles.cardBody, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={[styles.cardTime, { color: colors.textSecondary }]}>{timeAgo(item.created_at)}</Text>
              </View>
              <Pressable
                onPress={() => handleDelete(item)}
                style={styles.deleteBtn}
                hitSlop={8}
              >
                <Ionicons name="close-outline" size={16} color={colors.textSecondary} />
              </Pressable>
            </Pressable>
            </StaggeredEntrance>
          );
        }}
      />
    </SafeAreaView>
  );
}

const TYPE_ROUTE: Record<string, string> = {
  order_update: "/(home)/histories",
  reminder: "/(home)/histories",
  payment: "/(home)/histories",
  message: "/(home)/messages",
  promotion: "/(home)/packages",
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  countBadge: {
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  markAllLink: { fontSize: 13, fontWeight: "600" },
  list: { paddingVertical: 10, paddingBottom: BottomTabInset },
  emptyContainer: { flex: 1 },
  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptyDesc: { fontSize: 13, textAlign: "center" },
  card: {
    flexDirection: "row",
    marginHorizontal: Spacing.three,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    ...Shadows.sm,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { flex: 1, marginLeft: 12 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: "500" },
  cardTitleBold: { fontWeight: "700" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#3b82f6" },
  cardBody: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  cardTime: { fontSize: 11, marginTop: 5 },
  deleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    alignSelf: "flex-start",
  },
});
