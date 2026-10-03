import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from "@/utils/theme";

export default function InvalidScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reason: string; ticketId: string }>();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, iconScale]);

  return (
    <View style={styles.container}>
      <View style={styles.accentBar} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, SPACING.xl),
            paddingBottom: Math.max(insets.bottom, SPACING.lg),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeIn }}>
          <View style={styles.statusSection}>
            <Animated.View
              style={[
                styles.iconWrap,
                { transform: [{ scale: iconScale }] },
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={38}
                color={COLORS.primary}
              />
            </Animated.View>
            <Text style={styles.eyebrow}>TICKET CHECK</Text>
            <Text style={styles.title}>NOT VERIFIED</Text>
            <Text style={styles.subtitle}>
              This ticket cannot be admitted.
            </Text>
          </View>

          <View style={styles.reasonCard}>
            <View style={styles.reasonHeading}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.reasonLabel}>WHY IT WAS DECLINED</Text>
            </View>
            <Text style={styles.reasonText}>
              {params.reason || "Ticket validation failed. Please check the ticket details."}
            </Text>
            {params.ticketId ? (
              <View style={styles.ticketReference}>
                <Text style={styles.ticketReferenceLabel}>
                  TICKET REFERENCE
                </Text>
                <Text
                  style={styles.ticketReferenceValue}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {params.ticketId}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.guidance}>
            <MaterialCommunityIcons
              name="information-outline"
              size={19}
              color={COLORS.dark}
            />
            <Text style={styles.guidanceText}>
              Check the selected session or ask the attendee to confirm their
              ticket details.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/(tabs)/scanner")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={21}
              color="#FFFFFF"
            />
            <Text style={styles.primaryButtonText}>SCAN ANOTHER TICKET</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primary,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  statusSection: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  iconWrap: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: "#F1C8BF",
    backgroundColor: "#FCEAE6",
  },
  eyebrow: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "900",
    letterSpacing: 0.3,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.sans,
    color: "#656565",
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  reasonCard: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(10, 10, 10, 0.12)",
    borderRadius: RADIUS.lg,
    backgroundColor: "#FFFFFF",
  },
  reasonHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  reasonLabel: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.xs,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  reasonText: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    lineHeight: 22,
  },
  ticketReference: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(10, 10, 10, 0.12)",
  },
  ticketReferenceLabel: {
    fontFamily: FONT_FAMILY.sans,
    color: "#656565",
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ticketReferenceValue: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    marginTop: SPACING.xs,
  },
  guidance: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xs,
  },
  guidanceText: {
    flex: 1,
    fontFamily: FONT_FAMILY.sans,
    color: "#565656",
    fontSize: FONT_SIZE.xs,
    lineHeight: 17,
  },
  primaryButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  primaryButtonText: {
    flex: 1,
    fontFamily: FONT_FAMILY.sans,
    color: "#FFFFFF",
    fontSize: FONT_SIZE.sm,
    fontWeight: "800",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
