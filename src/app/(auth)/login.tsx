import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { NeonButton } from "@/components/NeonButton";
import { InputField } from "@/components/InputField";
import { loginWithScannerAccessCode } from "@/services/api";
import { COLORS, FONT_SIZE, FONT_FAMILY, SPACING } from "@/utils/theme";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { refreshStats } = useAnalytics();
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(-20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslate, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  }, []);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithScannerAccessCode(accessCode);
      await refreshStats();
      router.replace("/(tabs)/scanner");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "SCANNER LOGIN FAILED",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslate }],
            },
          ]}
        >
          <Image
            source={require("../../../assets/images/tedxlogo.svg")}
            style={styles.tedxLogo}
            contentFit="contain"
            accessibilityLabel="TEDx DYP Akurdi mosaic logo"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>EVENT DAY SCANNER</Text>
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>

        {/* Login Card */}
        <Animated.View
          style={{
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslate }],
          }}
        >
          <GlassCard glowIntensity="medium">
            <View style={styles.form}>
              <InputField
                label="SCANNER ACCESS CODE"
                placeholder="Shared scanner code"
                value={accessCode}
                onChangeText={setAccessCode}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <NeonButton
                  title="AUTHORIZE"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  textStyle={styles.buttonText}
                />
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 48,
    paddingBottom: SPACING.xxl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
    isolation: "isolate"
  },
  tedxLogo: {
    width: 176,
    height: 142,
    marginBottom: SPACING.lg,
  },
  brandName: {
    fontFamily: FONT_FAMILY.sans,
    fontSize: FONT_SIZE.mega,
    fontWeight: "900",
    color: COLORS.dark,
  },
  brandNameAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.pixel,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginTop: SPACING.sm,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.lg,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  dividerText: {
    fontFamily: FONT_FAMILY.pixel,
    color: COLORS.dark,
    fontSize: FONT_SIZE.sm,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginHorizontal: SPACING.md,
  },
  form: {
    marginTop: SPACING.xs,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 0,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  errorText: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textDanger,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    letterSpacing: 0.2,
    flex: 1,
  },
  buttonContainer: {
    marginTop: SPACING.sm,
  },
  buttonText: {
    color: COLORS.background,
  },

  footer: {
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    letterSpacing: 2,
  },
  footerTextSmall: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
    letterSpacing: 1,
    marginTop: SPACING.xs,
    opacity: 0.5,
  },
});
