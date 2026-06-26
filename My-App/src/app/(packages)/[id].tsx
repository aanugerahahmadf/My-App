import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
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
import Animated, { FadeIn } from "react-native-reanimated";

type PackageItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  image_url?: string;
  category?: { id: number; name: string };
};

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const { t } = useLanguage();

  const [item, setItem] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlist, setIsWishlist] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiGet(API.PACKAGES.DETAIL(parseInt(id, 10)));
      setItem(res.data || res || null);
      const checkRes: any = await apiGet(
        API.WISHLIST.CHECK(parseInt(id, 10)),
      ).catch(() => null);
      if (checkRes) setIsWishlist(checkRes.is_wishlisted || false);
    } catch (e: any) {
      setError(e.message || t("Failed to load"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void Promise.resolve().then(fetchDetail);
  }, [fetchDetail]);

  const toggleWishlist = async () => {
    try {
      await apiPost(API.WISHLIST.TOGGLE, { package_id: parseInt(id!, 10) });
      setIsWishlist((prev) => !prev);
    } catch {}
  };

  const addToCart = async () => {
    try {
      await apiPost(API.CART.ADD, {
        package_id: parseInt(id!, 10),
        quantity: 1,
      });
      Alert.alert(
        t("Added to Cart"),
        t("Package has been added to your cart."),
      );
    } catch (e: any) {
      Alert.alert(t("Error"), e.message || t("Failed to add to cart"));
    }
  };

  const buyNow = () => {
    router.push(`/(checkout)/package/${id}` as any);
  };

  const chatAdmin = async () => {
    try {
      const res: any = await apiPost(API.CHAT.START);
      const inboxId = res.data?.id || res.id;
      if (!inboxId) {
        Alert.alert(t("Error"), t("Could not start conversation."));
        return;
      }
      await apiPost(API.CHAT.SEND, {
        inbox_id: inboxId,
        message: t("Hi admin, I'm interested in the wedding package: {name}").replace("{name}", item?.name || ""),
      });
      router.push(`/(messages)/${inboxId}` as any);
    } catch (e: any) {
      Alert.alert(t("Error"), e.message || t("Failed to start chat"));
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.backgroundSelected },
          ]}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("Package")}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || t("Package not found")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const finalPrice = item.discount_price || item.price;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.backgroundSelected },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView entering={FadeIn.duration(250)} contentContainerStyle={styles.content}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Ionicons
              name="image-outline"
              size={48}
              color={colors.textSecondary}
            />
          </View>
        )}

        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>

        {item.category && (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
              {item.category.name}
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          {item.discount_price ? (
            <>
              <Text style={styles.finalPrice}>
                Rp {finalPrice.toLocaleString("id-ID")}
              </Text>
              <Text
                style={[styles.originalPrice, { color: colors.textSecondary }]}
              >
                Rp {item.price.toLocaleString("id-ID")}
              </Text>
            </>
          ) : (
            <Text style={styles.finalPrice}>
              Rp {item.price.toLocaleString("id-ID")}
            </Text>
          )}
        </View>

        {item.description && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("Description")}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </>
        )}
      </Animated.ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.backgroundSelected,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Pressable onPress={addToCart} style={styles.actionBtn}>
            <Ionicons name="cart-outline" size={22} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>{t("Cart")}</Text>
          </Pressable>
          <Pressable onPress={chatAdmin} style={styles.actionBtn}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={colors.text}
            />
            <Text style={[styles.actionLabel, { color: colors.text }]}>{t("Chat")}</Text>
          </Pressable>
          <Pressable onPress={toggleWishlist} style={styles.actionBtn}>
            <Ionicons
              name={isWishlist ? "heart" : "heart-outline"}
              size={22}
              color={isWishlist ? "#ef4444" : colors.text}
            />
            <Text
              style={[
                styles.actionLabel,
                { color: isWishlist ? "#ef4444" : colors.text },
              ]}
            >
              {t("Favorite")}
            </Text>
          </Pressable>
        </View>
        <Pressable onPress={buyNow} style={[styles.actionBtn, styles.buyBtn]}>
          <Ionicons name="bag-handle-outline" size={22} color="#fff" />
          <Text style={styles.buyLabel}>{t("Buy Now")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.five,
  },
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
    flex: 1,
    textAlign: "center",
  },
  content: { padding: Spacing.three, paddingBottom: Spacing.four },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    marginBottom: Spacing.three,
  },
  imagePlaceholder: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
    marginBottom: Spacing.two,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: Spacing.two,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  finalPrice: { fontSize: 22, fontWeight: "800", color: "#ef4444" },
  originalPrice: { fontSize: 14, textDecorationLine: "line-through" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.two,
    marginTop: Spacing.one,
  },
  description: { fontSize: 14, lineHeight: 22 },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderTopWidth: 1,
  },
  bottomLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  actionBtn: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  actionLabel: { fontSize: 10, fontWeight: "600" },
  buyBtn: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 6,
  },
  buyLabel: { color: "#fff", fontSize: 13, fontWeight: "700" },
  errorText: { fontSize: 15, textAlign: "center" },
});
