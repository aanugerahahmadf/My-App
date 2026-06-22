import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
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
import { apiGet, apiPost } from "@/lib/api-client";
import { API } from "@/lib/endpoints";
import { useLanguage } from "@/lib/language-context";

type Voucher = {
  id: number;
  code: string;
  description?: string;
  discount_amount: string | number;
  discount_type: "percentage" | "fixed";
  min_purchase: string | number;
  expires_at?: string | null;
  is_active: boolean;
  is_global: boolean;
  max_uses?: number | null;
  uses_count?: number;
  pivot?: {
    claimed_at?: string;
    used_at?: string | null;
    order_id?: number | null;
  };
};

type Tab = "available" | "claimed";

export default function VouchersScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("available");
  const [available, setAvailable] = useState<Voucher[]>([]);
  const [claimed, setClaimed] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const fetchVouchers = useCallback(async () => {
    try {
      const [availRes, claimRes]: any[] = await Promise.all([
        apiGet(API.VOUCHERS.INDEX),
        apiGet(`${API.VOUCHERS.INDEX}/my`).catch(() => ({ data: [] })),
      ]);
      setAvailable(availRes?.data || availRes || []);
      setClaimed(claimRes?.data || claimRes || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaim = async (voucher: Voucher) => {
    setClaimingId(voucher.id);
    try {
      await apiPost(API.VOUCHERS.CLAIM(voucher.id));
      Alert.alert(
        t("Success!"),
        t("Voucher {code} has been claimed.").replace("{code}", voucher.code),
      );
      fetchVouchers();
    } catch (e: any) {
      Alert.alert(t("Failed"), e?.message || t("Failed to claim voucher"));
    } finally {
      setClaimingId(null);
    }
  };

  const handleCopy = (code: string) => {
    Clipboard.setString(code);
    Alert.alert(
      t("Copied!"),
      t('Voucher code "{code}" has been copied to clipboard.').replace(
        "{code}",
        code,
      ),
    );
  };

  const formatDiscount = (voucher: Voucher) => {
    const amount = Number(voucher.discount_amount);
    if (voucher.discount_type === "percentage") {
      return `${amount}%`;
    }
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const isExpired = (voucher: Voucher) => {
    if (!voucher.expires_at) return false;
    return new Date(voucher.expires_at) < new Date();
  };

  const isAlreadyClaimed = (voucher: Voucher) => {
    return claimed.some((c) => c.id === voucher.id);
  };

  const renderVoucherCard = (item: Voucher, showClaim = true) => {
    const expired = isExpired(item);
    const alreadyClaimed = isAlreadyClaimed(item);
    const minPurchase = Number(item.min_purchase);
    const used = item.pivot?.used_at != null;

    return (
      <View
        key={item.id}
        style={[
          styles.card,
          { backgroundColor: colors.backgroundElement },
          (expired || used) && styles.cardDimmed,
        ]}
      >
        {/* Left accent stripe */}
        <View
          style={[
            styles.stripe,
            { backgroundColor: expired || used ? "#9ca3af" : "#3b82f6" },
          ]}
        />

        <View style={styles.cardContent}>
          {/* Top: code + discount badge */}
          <View style={styles.cardTop}>
            <View style={styles.codeRow}>
              <Text style={[styles.code, { color: colors.text }]}>
                {item.code}
              </Text>
              <Pressable
                style={styles.copyBtn}
                onPress={() => handleCopy(item.code)}
              >
                <Ionicons
                  name="copy-outline"
                  size={14}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
            <View
              style={[
                styles.discountBadge,
                {
                  backgroundColor:
                    expired || used
                      ? "#9ca3af20"
                      : item.discount_type === "percentage"
                        ? "#8b5cf620"
                        : "#10b98120",
                },
              ]}
            >
              <Text
                style={[
                  styles.discountText,
                  {
                    color:
                      expired || used
                        ? "#9ca3af"
                        : item.discount_type === "percentage"
                          ? "#8b5cf6"
                          : "#10b981",
                  },
                ]}
              >
                {item.discount_type === "percentage"
                  ? t("DISCOUNT")
                  : t("FLAT")}{" "}
                {formatDiscount(item)}
              </Text>
            </View>
          </View>

          {/* Description */}
          {item.description ? (
            <Text
              style={[styles.desc, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}

          {/* Meta */}
          <View style={styles.metaRow}>
            {minPurchase > 0 && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="pricetag-outline"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  {t("Min. Rp {amount}").replace(
                    "{amount}",
                    minPurchase.toLocaleString("id-ID"),
                  )}
                </Text>
              </View>
            )}
            {item.expires_at && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={expired ? "#ef4444" : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: expired ? "#ef4444" : colors.textSecondary },
                  ]}
                >
                  {expired
                    ? t("Expired")
                    : t("Until {date}").replace(
                        "{date}",
                        new Date(item.expires_at!).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }),
                      )}
                </Text>
              </View>
            )}
            {item.is_global && (
              <View style={styles.metaItem}>
                <Ionicons name="globe-outline" size={12} color="#3b82f6" />
                <Text style={[styles.metaText, { color: "#3b82f6" }]}>
                  {t("Global")}
                </Text>
              </View>
            )}
          </View>

          {/* Claimed status / Claim button */}
          {showClaim && (
            <View style={styles.actionRow}>
              {used ? (
                <View
                  style={[styles.statusBadge, { backgroundColor: "#6b728020" }]}
                >
                  <Text style={[styles.statusText, { color: "#6b7280" }]}>
                    {t("Already Used")}
                  </Text>
                </View>
              ) : alreadyClaimed ? (
                <View
                  style={[styles.statusBadge, { backgroundColor: "#10b98120" }]}
                >
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={[styles.statusText, { color: "#10b981" }]}>
                    {t("Claimed")}
                  </Text>
                </View>
              ) : expired ? (
                <View
                  style={[styles.statusBadge, { backgroundColor: "#ef444420" }]}
                >
                  <Text style={[styles.statusText, { color: "#ef4444" }]}>
                    {t("Expired")}
                  </Text>
                </View>
              ) : (
                <Pressable
                  style={[
                    styles.claimBtn,
                    claimingId === item.id && styles.claimBtnDisabled,
                  ]}
                  onPress={() => handleClaim(item)}
                  disabled={claimingId === item.id}
                >
                  {claimingId === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="gift-outline" size={14} color="#fff" />
                      <Text style={styles.claimBtnText}>
                        {t("Claim Voucher")}
                      </Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          )}

          {/* Claimed tab: show used/active info */}
          {!showClaim && (
            <View style={styles.actionRow}>
              {used ? (
                <View
                  style={[styles.statusBadge, { backgroundColor: "#6b728020" }]}
                >
                  <Ionicons
                    name="checkmark-done-circle"
                    size={14}
                    color="#6b7280"
                  />
                  <Text style={[styles.statusText, { color: "#6b7280" }]}>
                    {t("Used")}{" "}
                    {item.pivot?.used_at
                      ? new Date(item.pivot.used_at).toLocaleDateString("en-US")
                      : ""}
                  </Text>
                </View>
              ) : (
                <View
                  style={[styles.statusBadge, { backgroundColor: "#3b82f620" }]}
                >
                  <Ionicons name="ticket-outline" size={14} color="#3b82f6" />
                  <Text style={[styles.statusText, { color: "#3b82f6" }]}>
                    {t("Ready to Use")}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const displayData = tab === "available" ? available : claimed;

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
          {t("Vouchers")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Bar */}
      <View
        style={[styles.tabs, { backgroundColor: colors.backgroundElement }]}
      >
        <Pressable
          style={[styles.tabBtn, tab === "available" && styles.tabBtnActive]}
          onPress={() => setTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              { color: tab === "available" ? "#3b82f6" : colors.textSecondary },
            ]}
          >
            {t("Available")} ({available.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === "claimed" && styles.tabBtnActive]}
          onPress={() => setTab("claimed")}
        >
          <Text
            style={[
              styles.tabText,
              { color: tab === "claimed" ? "#3b82f6" : colors.textSecondary },
            ]}
          >
            {t("Claimed")} ({claimed.length})
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={displayData}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => renderVoucherCard(item, tab === "available")}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchVouchers();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="ticket-outline"
              size={52}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {tab === "available"
                ? t("No Vouchers Available")
                : t("No Claimed Vouchers")}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {tab === "available"
                ? t("No active vouchers available at this time")
                : t("Claim vouchers from the Available tab to see them here")}
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
  tabs: {
    flexDirection: "row",
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.two,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: "#3b82f615" },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  list: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.five },
  card: {
    borderRadius: 16,
    marginBottom: Spacing.three,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardDimmed: { opacity: 0.6 },
  stripe: { width: 6 },
  cardContent: { flex: 1, padding: Spacing.three },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.one,
  },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  code: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  copyBtn: { padding: 4 },
  discountBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.one,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.two,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  actionRow: { flexDirection: "row", alignItems: "center" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  claimBtnDisabled: { opacity: 0.6 },
  claimBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
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
