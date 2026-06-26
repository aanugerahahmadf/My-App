import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

import { Colors, Spacing, Shadows } from "@/constants/theme";
import { apiPost } from "@/lib/api-client";
import { API } from "@/lib/endpoints";
import { useLanguage } from "@/lib/language-context";
import Animated, { FadeIn } from "react-native-reanimated";

export default function MidtransPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const { t } = useLanguage();

  const [loadingUrl, setLoadingUrl] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const fetchPaymentUrl = useCallback(async () => {
    if (!id) return;
    try {
      const res: any = await apiPost(API.ORDERS.PAY(parseInt(id, 10)));
      const url = res.data?.payment_url || res.payment_url;
      setPaymentUrl(url || null);
    } catch {
      Alert.alert(t("Error"), t("Failed to process payment"));
      router.replace("/(home)/order");
    } finally {
      setLoadingUrl(false);
    }
  }, [id, t, router]);

  useEffect(() => {
    void Promise.resolve().then(fetchPaymentUrl);
  }, [fetchPaymentUrl]);

  const handleOpenPayment = async () => {
    if (!paymentUrl) return;
    setPaying(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(paymentUrl);
      if (result.type === "success") {
        setPaid(true);
      }
    } catch {
      Alert.alert(t("Error"), t("Failed to process payment"));
    } finally {
      setPaying(false);
    }
  };

  if (loadingUrl) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t("Loading payment page...")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (paid) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            {t("Payment Successful")}
          </Text>
          <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
            {t("Your payment has been processed successfully.")}
          </Text>
          <Pressable onPress={() => router.replace("/(home)/order")} style={[styles.successBtn, Shadows.sm]}>
            <Ionicons name="receipt-outline" size={18} color="#fff" />
            <Text style={styles.successBtnText}>{t("View Order")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable onPress={() => router.replace("/(home)/order")} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("Payment")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View entering={FadeIn.duration(250)} style={styles.center}>
        <View style={[styles.payCard, { backgroundColor: colors.backgroundElement }, Shadows.md]}>
          <View style={styles.payIconWrap}>
            <Ionicons name="card-outline" size={48} color="#3b82f6" />
          </View>
          <Text style={[styles.payTitle, { color: colors.text }]}>
            {t("Midtrans Payment")}
          </Text>
          <Text style={[styles.payDesc, { color: colors.textSecondary }]}>
            {t("You will be redirected to the Midtrans payment page.")}
          </Text>
          <View style={[styles.payDivider, { backgroundColor: colors.backgroundSelected }]} />
          <View style={styles.payRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#22c55e" />
            <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>
              Pembayaran aman dengan Midtrans
            </Text>
          </View>
          <View style={styles.payRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#22c55e" />
            <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>
              Data Anda terenkripsi
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleOpenPayment}
          disabled={paying}
          style={[styles.payNowBtn, paying && { opacity: 0.6 }, Shadows.md]}
        >
          {paying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="wallet-outline" size={20} color="#fff" />
              <Text style={styles.payNowText}>{t("Pay Now")}</Text>
            </>
          )}
        </Pressable>

        <Pressable onPress={() => router.replace("/(home)/order")} style={styles.cancelBtn}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t("Cancel")}</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.five, gap: Spacing.three },
  loadingText: { marginTop: Spacing.three, fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  headerTitle: { fontSize: 17, fontWeight: "700", flex: 1, textAlign: "center" },
  successIconWrap: { marginBottom: Spacing.two },
  successTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  successDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  successBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: Spacing.three,
  },
  successBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  payCard: {
    borderRadius: 20,
    padding: Spacing.four,
    width: "100%",
    alignItems: "center",
    gap: Spacing.two,
  },
  payIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3b82f618",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.one,
  },
  payTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  payDesc: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  payDivider: { height: 1, width: "100%", marginVertical: Spacing.one },
  payRow: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%" },
  payNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: "#3b82f6",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: "100%",
    marginTop: Spacing.two,
  },
  payNowText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cancelBtn: { padding: Spacing.two },
});
