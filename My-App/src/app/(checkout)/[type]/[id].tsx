import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Colors, Spacing, Shadows } from "@/constants/theme";
import { apiGet, apiPost } from "@/lib/api-client";
import { API } from "@/lib/endpoints";
import { useLanguage } from "@/lib/language-context";
import Animated, { FadeIn } from "react-native-reanimated";

type CheckoutItem = {
  id: number;
  name: string;
  price: number;
  discount_price?: number;
  stock?: number;
};

type CartLineItem = {
  id: number;
  quantity: number;
  product?: { id: number; name: string; price: number };
  package?: { id: number; name: string; price: number };
};

type VoucherOption = {
  id: number;
  code: string;
  discount_amount: number;
  discount_type: "percentage" | "fixed";
  description?: string;
};

const STEPS = [
  { key: "event", icon: "calendar-outline" as const, label: "Acara" },
  { key: "contact", icon: "person-circle-outline" as const, label: "Kontak" },
  { key: "voucher", icon: "ticket-outline" as const, label: "Voucher" },
  { key: "confirm", icon: "checkmark-circle-outline" as const, label: "Bayar" },
];

function formatDateId(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CheckoutScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const { t } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);

  const isCart = type === "cart";
  const isPackage = type === "package";

  const [item, setItem] = useState<CheckoutItem | null>(null);
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [vouchers, setVouchers] = useState<VoucherOption[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [showVoucherPicker, setShowVoucherPicker] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isCart) {
        const cartRes: any = await apiGet(API.CART.INDEX);
        const items = cartRes.data || cartRes || [];
        setCartItems(Array.isArray(items) ? items : []);
      } else if (id) {
        const endpoint = isPackage
          ? API.PACKAGES.DETAIL(parseInt(id, 10))
          : API.PRODUCTS.DETAIL(parseInt(id, 10));
        const res: any = await apiGet(endpoint);
        setItem(res.data || res || null);
      }

      const profileRes: any = await apiGet(API.PROFILE.SHOW).catch(() => null);
      if (profileRes?.data || profileRes) {
        const p = profileRes.data || profileRes;
        setCustomerName(p.name || "");
        setWhatsapp(p.whatsapp || p.phone || "");
      }

      const voucherRes: any = await apiGet(API.VOUCHERS.INDEX).catch(() => null);
      if (voucherRes?.data) {
        setVouchers(Array.isArray(voucherRes.data) ? voucherRes.data : []);
      } else if (Array.isArray(voucherRes)) {
        setVouchers(voucherRes);
      }
    } catch {
      Alert.alert(t("Error"), t("Failed to load"));
    } finally {
      setLoading(false);
    }
  }, [id, isCart, isPackage, t]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const finalPrice = isCart
    ? cartItems.reduce(
        (sum, ci) =>
          sum + (ci.product?.price || ci.package?.price || 0) * ci.quantity,
        0,
      )
    : item
      ? (item.discount_price || item.price) * parseInt(quantity || "1", 10)
      : 0;

  const totalAfterDiscount = Math.max(0, finalPrice - voucherDiscount);

  const selectVoucher = (vId: number) => {
    const v = vouchers.find((x) => x.id === vId);
    if (!v) return;
    setSelectedVoucherId(vId);
    if (v.discount_type === "percentage") {
      setVoucherDiscount(Math.round(finalPrice * (v.discount_amount / 100)));
    } else {
      setVoucherDiscount(v.discount_amount);
    }
    setShowVoucherPicker(false);
  };

  const removeVoucher = () => {
    setSelectedVoucherId(null);
    setVoucherDiscount(0);
  };

  const canNext = (): boolean => {
    if (step === 0) {
      if (!bookingDate || !bookingTime) return false;
      if (!isCart) {
        const q = parseInt(quantity, 10);
        if (isNaN(q) || q < 1) return false;
        if (item?.stock !== undefined && q > item.stock) return false;
      }
      if (!notes.trim()) return false;
      return true;
    }
    if (step === 1) {
      if (!customerName.trim()) return false;
      if (!whatsapp.trim()) return false;
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!canNext()) {
      Alert.alert(t("Validation"), t("Please fill in all required fields"));
      return;
    }
    if (step < 3) {
      setStep((s) => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const getSelectedVoucher = () =>
    selectedVoucherId ? vouchers.find((v) => v.id === selectedVoucherId) : null;

  const handleConfirmAndPay = async () => {
    if (isCart && cartItems.length === 0) return;
    if (!isCart && !item) return;
    setSubmitting(true);
    try {
      const body: Record<string, any> = {
        booking_date: bookingDate,
        booking_time: bookingTime,
        notes: notes.trim(),
        customer_name: customerName.trim(),
        whatsapp: whatsapp.trim(),
      };

      if (isCart) {
        body.items = cartItems.map((ci) => ({
          ...(ci.product
            ? { product_id: ci.product.id }
            : { package_id: ci.package!.id }),
          quantity: ci.quantity,
        }));
      } else {
        body.quantity = parseInt(quantity, 10);
        if (isPackage) {
          body.package_id = item!.id;
        } else {
          body.product_id = item!.id;
        }
      }

      if (selectedVoucherId) {
        body.voucher_id = selectedVoucherId;
      }

      const orderRes: any = await apiPost(API.ORDERS.CREATE, body);
      const orderId = orderRes.data?.id || orderRes.id;
      if (!orderId) {
        Alert.alert(t("Error"), t("Failed to place order"));
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      router.replace(`/(checkout)/payment/${orderId}` as any);
    } catch (e: any) {
      Alert.alert(t("Error"), e.message || t("Failed to process payment"));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  if ((!isCart && !item) || (isCart && cartItems.length === 0)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("Checkout")}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>{t("Item not found")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unitPrice = item ? item.discount_price || item.price : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.backgroundSelected }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("Checkout")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.stepBar, { backgroundColor: colors.backgroundElement }]}>
        {STEPS.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          return (
            <View key={s.key} style={styles.stepCol}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: isDone ? "#22c55e" : isActive ? "#3b82f6" : colors.backgroundSelected,
                    ...(isActive ? Shadows.sm : {}),
                  },
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <Ionicons name={s.icon} size={16} color={isActive ? "#fff" : colors.textSecondary} />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: isDone ? "#22c55e" : isActive ? "#3b82f6" : colors.textSecondary,
                    fontWeight: isActive ? "700" : "500",
                  },
                ]}
              >
                {s.label}
              </Text>
              {i < STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: isDone ? "#22c55e" : colors.backgroundSelected },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <Animated.ScrollView
        entering={FadeIn.duration(250)}
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="calendar-outline" size={18} color="#3b82f6" />{" "}
              {t("Event Details")}
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              {t("Choose time & needs")}
            </Text>

            {isCart && cartItems.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                  {t("Items to Order")}
                </Text>
                {cartItems.map((ci) => {
                  const name = ci.product?.name || ci.package?.name || "";
                  const price = ci.product?.price || ci.package?.price || 0;
                  return (
                    <View key={ci.id} style={styles.itemRow}>
                      <Text style={{ color: colors.text, flex: 1, fontSize: 14 }} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 13, marginHorizontal: 8 }}>
                        ×{ci.quantity}
                      </Text>
                      <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 14 }}>
                        Rp {(price * ci.quantity).toLocaleString("id-ID")}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                <Ionicons name="calendar-outline" size={14} color="#3b82f6" />{" "}
                {t("Planned Event Date")} *
              </Text>
              <View style={[styles.fieldInput, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                <TextInput
                  style={{ color: colors.text, flex: 1, fontSize: 15, paddingVertical: Platform.OS === "ios" ? 14 : 10 }}
                  value={bookingDate}
                  onChangeText={setBookingDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
                {bookingDate ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginLeft: 8 }}>
                    {formatDateId(bookingDate)}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                <Ionicons name="time-outline" size={14} color="#3b82f6" />{" "}
                {t("Time of Event")} *
              </Text>
              <View style={[styles.fieldInput, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                <TextInput
                  style={{ color: colors.text, flex: 1, fontSize: 15, paddingVertical: Platform.OS === "ios" ? 14 : 10 }}
                  value={bookingTime}
                  onChangeText={setBookingTime}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {!isCart && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  <Ionicons name="cube-outline" size={14} color="#3b82f6" />{" "}
                  {t("Quantity to Buy")} *
                </Text>
                <View style={[styles.fieldInput, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                  <TextInput
                    style={{ color: colors.text, flex: 1, fontSize: 15, paddingVertical: Platform.OS === "ios" ? 14 : 10 }}
                    keyboardType="number-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                {item?.stock !== undefined && (
                  <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>
                    {t("Max: {n}").replace("{n}", String(item.stock))}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                <Ionicons name="location-outline" size={14} color="#3b82f6" />{" "}
                {t("Location Address")} *
              </Text>
              <View style={[styles.fieldInputMultiline, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                <TextInput
                  style={{ color: colors.text, fontSize: 15, textAlignVertical: "top", minHeight: 80, paddingVertical: Platform.OS === "ios" ? 14 : 10 }}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  placeholderTextColor={colors.textSecondary}
                  placeholder={t("Full address")}
                />
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="person-circle-outline" size={18} color="#3b82f6" />{" "}
              {t("Contact Info")}
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              {t("Verify your data")}
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                <Ionicons name="person-outline" size={14} color="#3b82f6" />{" "}
                {t("Full Name")} *
              </Text>
              <View style={[styles.fieldInput, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                <TextInput
                  style={{ color: colors.text, flex: 1, fontSize: 15, paddingVertical: Platform.OS === "ios" ? 14 : 10 }}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholderTextColor={colors.textSecondary}
                  placeholder={t("Full Name")}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                <Ionicons name="logo-whatsapp" size={14} color="#25D366" />{" "}
                {t("WhatsApp Number")} *
              </Text>
              <View style={[styles.fieldInput, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                <TextInput
                  style={{ color: colors.text, flex: 1, fontSize: 15, paddingVertical: Platform.OS === "ios" ? 14 : 10 }}
                  keyboardType="phone-pad"
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  placeholderTextColor={colors.textSecondary}
                  placeholder="e.g. 08123456789"
                />
              </View>
              <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>
                {t("Payment notifications will be sent to this number.")}
              </Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="ticket-outline" size={18} color="#3b82f6" />{" "}
              {t("Voucher & Discount")}
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              {t("Use a voucher you have claimed in the Voucher menu.")}
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t("Available Voucher")}
              </Text>

              {selectedVoucherId ? (
                <View style={[styles.voucherCard, { backgroundColor: "#22c55e12", borderColor: "#22c55e" }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.voucherCode, { color: colors.text }]}>
                      {getSelectedVoucher()?.code}
                    </Text>
                    <Text style={[styles.voucherDesc, { color: colors.textSecondary }]}>
                      {getSelectedVoucher()?.discount_type === "percentage"
                        ? `${getSelectedVoucher()?.discount_amount}%`
                        : `Rp ${Number(getSelectedVoucher()?.discount_amount || 0).toLocaleString("id-ID")}`}
                    </Text>
                  </View>
                  <Pressable onPress={removeVoucher} style={styles.removeVBtn}>
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowVoucherPicker(true)}
                  style={[styles.fieldInput, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}
                >
                  <Ionicons name="ticket-outline" size={18} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, marginLeft: 10, flex: 1, fontSize: 15 }}>
                    {vouchers.length > 0 ? t("Select a voucher") : t("No vouchers available")}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                </Pressable>
              )}

              <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>
                {t("Only vouchers meeting the minimum purchase will appear.")}
              </Text>
            </View>

            {selectedVoucherId && (
              <View style={[styles.discountPreview, { borderColor: "#22c55e40", backgroundColor: "#22c55e08" }]}>
                <View style={styles.discountRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t("Package Price")}</Text>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                    Rp {finalPrice.toLocaleString("id-ID")}
                  </Text>
                </View>
                <View style={styles.discountRow}>
                  <Text style={{ color: "#22c55e", fontSize: 14, fontWeight: "600" }}>
                    <Ionicons name="pricetag" size={14} color="#22c55e" /> {t("Voucher Discount")}
                  </Text>
                  <Text style={{ color: "#22c55e", fontWeight: "700", fontSize: 14 }}>
                    - Rp {voucherDiscount.toLocaleString("id-ID")}
                  </Text>
                </View>
                <View style={[styles.discountDivider, { borderColor: "#22c55e30" }]} />
                <View style={styles.discountRow}>
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>{t("Total Pay")}</Text>
                  <Text style={{ color: "#22c55e", fontWeight: "800", fontSize: 18 }}>
                    Rp {totalAfterDiscount.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>
            )}

            {showVoucherPicker && vouchers.length > 0 && (
              <View style={[styles.voucherList, { backgroundColor: colors.backgroundElement, ...Shadows.sm }]}>
                {vouchers.map((v) => {
                  const displayAmount =
                    v.discount_type === "percentage"
                      ? `${v.discount_amount}%`
                      : `Rp ${Number(v.discount_amount).toLocaleString("id-ID")}`;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => selectVoucher(v.id)}
                      style={[styles.voucherOption, { borderBottomColor: colors.backgroundSelected }]}
                    >
                      <Ionicons name="pricetag-outline" size={20} color="#3b82f6" />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.voucherCode, { color: colors.text }]}>{v.code}</Text>
                        <Text style={[styles.voucherDesc, { color: colors.textSecondary }]}>
                          {t("Discount")} {displayAmount}
                        </Text>
                      </View>
                      <View style={styles.addIcon}>
                        <Ionicons name="add" size={20} color="#fff" />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {step === 3 && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#22c55e" />{" "}
              {t("Confirmation")}
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              {t("Review your order")}
            </Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.backgroundElement }]}>
              {isCart ? (
                <>
                  <Text style={[styles.summarySectionTitle, { color: "#3b82f6" }]}>
                    <Ionicons name="cart-outline" size={16} color="#3b82f6" /> {t("Items to Order")}
                  </Text>
                  {cartItems.map((ci) => {
                    const name = ci.product?.name || ci.package?.name || "";
                    const price = ci.product?.price || ci.package?.price || 0;
                    return (
                      <View key={ci.id} style={styles.summaryItemRow}>
                        <Text style={{ color: colors.text, flex: 1, fontSize: 14 }} numberOfLines={1}>
                          {name}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginHorizontal: 8 }}>×{ci.quantity}</Text>
                        <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 14 }}>
                          Rp {(price * ci.quantity).toLocaleString("id-ID")}
                        </Text>
                      </View>
                    );
                  })}
                </>
              ) : (
                <>
                  <Text style={[styles.summarySectionTitle, { color: "#3b82f6" }]}>
                    <Ionicons name={isPackage ? "flower-outline" : "rose-outline"} size={16} color="#3b82f6" />{" "}
                    {isPackage ? t("Decoration Package") : t("Product")}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text, fontSize: 15 }]}>{item!.name}</Text>
                </>
              )}

              <View style={[styles.summaryDivider, { backgroundColor: colors.backgroundSelected }]} />

              <View style={styles.summaryDetailRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.summaryDetailLabel, { color: colors.textSecondary }]}>{t("Booking Date")}</Text>
                <Text style={[styles.summaryDetailValue, { color: colors.text }]}>{formatDateId(bookingDate)}</Text>
              </View>

              <View style={styles.summaryDetailRow}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.summaryDetailLabel, { color: colors.textSecondary }]}>{t("Time of Event")}</Text>
                <Text style={[styles.summaryDetailValue, { color: colors.text }]}>{bookingTime}</Text>
              </View>

              {!isCart && (
                <View style={styles.summaryDetailRow}>
                  <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.summaryDetailLabel, { color: colors.textSecondary }]}>{t("Quantity")}</Text>
                  <Text style={[styles.summaryDetailValue, { color: colors.text }]}>{quantity}</Text>
                </View>
              )}

              <View style={styles.summaryDetailRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.summaryDetailLabel, { color: colors.textSecondary }]}>{t("Location Address")}</Text>
                <Text style={[styles.summaryDetailValue, { color: colors.textSecondary, flex: 1, textAlign: "right" }]} numberOfLines={2}>
                  {notes}
                </Text>
              </View>

              <View style={styles.summaryDetailRow}>
                <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.summaryDetailLabel, { color: colors.textSecondary }]}>{t("Full Name")}</Text>
                <Text style={[styles.summaryDetailValue, { color: colors.text }]}>{customerName}</Text>
              </View>

              <View style={styles.summaryDetailRow}>
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                <Text style={[styles.summaryDetailLabel, { color: colors.textSecondary }]}>WhatsApp</Text>
                <Text style={[styles.summaryDetailValue, { color: colors.text }]}>{whatsapp}</Text>
              </View>
            </View>

            <View style={[styles.priceSummary, { backgroundColor: colors.backgroundElement }]}>
              {!isCart && (
                <View style={styles.discountRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t("Unit Price")}</Text>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                    Rp {unitPrice.toLocaleString("id-ID")} × {quantity}
                  </Text>
                </View>
              )}
              <View style={styles.discountRow}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t("Subtotal")}</Text>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                  Rp {finalPrice.toLocaleString("id-ID")}
                </Text>
              </View>
              {selectedVoucherId && (
                <View style={styles.discountRow}>
                  <Text style={{ color: "#22c55e", fontSize: 14, fontWeight: "600" }}>
                    {t("Voucher Discount")}
                  </Text>
                  <Text style={{ color: "#22c55e", fontWeight: "700", fontSize: 14 }}>
                    - Rp {voucherDiscount.toLocaleString("id-ID")}
                  </Text>
                </View>
              )}
              <View style={[styles.discountDivider, { borderColor: colors.backgroundSelected }]} />
              <View style={styles.discountRow}>
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>{t("Total Pay")}</Text>
                <Text style={{ color: "#ef4444", fontWeight: "800", fontSize: 20 }}>
                  Rp {totalAfterDiscount.toLocaleString("id-ID")}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.navButtons}>
          {step > 0 ? (
            <Pressable
              onPress={handleBack}
              style={[styles.navBtn, styles.navBtnSecondary, { borderColor: colors.backgroundSelected }]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
              <Text style={[styles.navBtnText, { color: colors.text }]}>{t("Back")}</Text>
            </Pressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {step < 3 ? (
            <Pressable onPress={handleNext} style={[styles.navBtn, styles.navBtnPrimary, Shadows.sm]}>
              <Text style={styles.navBtnTextPrimary}>{t("Next")}</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleConfirmAndPay}
              disabled={submitting}
              style={[styles.navBtn, styles.navBtnPrimary, submitting && { opacity: 0.6 }, Shadows.sm]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="bag-handle-outline" size={18} color="#fff" />
                  <Text style={styles.navBtnTextPrimary}>{t("Confirm & Pay")}</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.five },
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
  stepBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  stepCol: { flex: 1, alignItems: "center", position: "relative" },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  stepLabel: { fontSize: 11, marginTop: 2 },
  stepLine: {
    position: "absolute",
    top: 18,
    left: "60%",
    right: "-40%",
    height: 2,
  },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.six * 2 },
  formSection: { gap: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
  sectionSub: { fontSize: 13, marginBottom: Spacing.three },
  card: { borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.three },
  cardLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: Spacing.two },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  fieldGroup: { marginBottom: Spacing.three },
  fieldLabel: { fontSize: 13, fontWeight: "600", marginBottom: Spacing.one },
  fieldInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
  },
  fieldInputMultiline: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
  },
  fieldHint: { fontSize: 12, marginTop: 6, lineHeight: 16 },
  voucherCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
  },
  voucherCode: { fontSize: 15, fontWeight: "700" },
  voucherDesc: { fontSize: 13, marginTop: 2 },
  removeVBtn: { padding: 4 },
  voucherList: { borderRadius: 14, marginTop: Spacing.three, overflow: "hidden" },
  voucherOption: { flexDirection: "row", alignItems: "center", padding: Spacing.three, borderBottomWidth: 1 },
  addIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center" },
  discountPreview: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: 10, marginTop: Spacing.two },
  discountRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  discountDivider: { borderTopWidth: 1, marginVertical: 6 },
  summaryCard: { borderRadius: 14, padding: Spacing.three, marginBottom: Spacing.three },
  summarySectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: Spacing.two },
  summaryValue: { fontSize: 14, fontWeight: "500", marginBottom: Spacing.one },
  summaryDivider: { height: 1, marginVertical: Spacing.two },
  summaryDetailRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  summaryDetailLabel: { fontSize: 13, width: 80 },
  summaryDetailValue: { fontSize: 14, fontWeight: "600" },
  summaryItemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  priceSummary: { borderRadius: 14, padding: Spacing.three, gap: 10 },
  navButtons: { flexDirection: "row", justifyContent: "space-between", gap: Spacing.two, marginTop: Spacing.four },
  navBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 12, gap: 6 },
  navBtnSecondary: { borderWidth: 1 },
  navBtnPrimary: { backgroundColor: "#3b82f6" },
  navBtnText: { fontSize: 15, fontWeight: "600" },
  navBtnTextPrimary: { color: "#fff", fontSize: 15, fontWeight: "700" },
  errorText: { fontSize: 15, textAlign: "center" },
});
