import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
import { useLanguage } from "@/lib/language-context";

export default function LanguagesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const { lang, setLang, t, loading, availableLanguages } = useLanguage();
  const [saving, setSaving] = useState<string | null>(null);

  const handleSelect = async (code: string) => {
    if (code === lang || saving !== null) return;
    setSaving(code);
    await setLang(code);
    setSaving(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
          {t("Language")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("Select your preferred language")}
        </Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          availableLanguages.map((l) => {
            const isSelected = lang === l.code;
            return (
              <Pressable
                key={l.code}
                style={[
                  styles.langItem,
                  {
                    backgroundColor: isSelected
                      ? "#3b82f620"
                      : colors.backgroundElement,
                    borderColor: isSelected ? "#3b82f6" : "transparent",
                    borderWidth: isSelected ? 1.5 : 0,
                  },
                ]}
                onPress={() => handleSelect(l.code)}
                disabled={saving !== null}
              >
                <Text style={styles.flag}>{l.flag}</Text>
                <View style={styles.langInfo}>
                  <Text style={[styles.langName, { color: colors.text }]}>
                    {l.name}
                  </Text>
                  <Text
                    style={[styles.langNative, { color: colors.textSecondary }]}
                  >
                    {l.nativeName}
                  </Text>
                </View>
                {saving === l.code ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : isSelected ? (
                  <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />
                ) : null}
              </Pressable>
            );
          })
        )}

        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#3b82f6"
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t(
              "Language is synced with your account. Changes are saved to the server via the UserLanguage model.",
            )}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
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
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
    flex: 1,
    textAlign: "center",
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
    marginBottom: Spacing.two,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  flag: { fontSize: 28 },
  langInfo: { flex: 1, gap: 2 },
  langName: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  langNative: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
  },
});
