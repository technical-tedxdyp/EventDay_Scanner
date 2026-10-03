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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from "@/utils/theme";

export default function AlreadyUsedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    holderName: string;
    usedAt: string;
    ticketId: string;
    sessionTitle: string;
  }>();
  const insets = useSafeAreaInsets();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;

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

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "Previous entry time unavailable";
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime()))
      return "Previous entry time unavailable";
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

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
                name="history"
                size={38}
                color={COLORS.primary}
              />
            </Animated.View>
            <Text style={styles.eyebrow}>TICKET CHECK</Text>
            <Text style={styles.title}>ALREADY USED</Text>
            <Text style={styles.subtitle}>
              Entry for this ticket has already been recorded.
            </Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <View style={styles.statusBadge}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.statusBadgeText}>PREVIOUSLY ADMITTED</Text>
              </View>
              <Text
                style={styles.ticketId}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {params.ticketId || "TICKET"}
              </Text>
            </View>

            <DetailRow
              label="TICKET HOLDER"
              value={params.holderName || "Unknown attendee"}
            />
            <View style={styles.divider} />
            <DetailRow
              label="SESSION"
              value={params.sessionTitle || "Selected session"}
            />
            <View style={styles.divider} />
            <DetailRow
              label="PREVIOUS ENTRY"
              value={formatTimestamp(params.usedAt ?? "")}
            />
          </View>

          <View style={styles.guidance}>
            <MaterialCommunityIcons
              name="information-outline"
              size={19}
              color={COLORS.dark}
            />
            <Text style={styles.guidanceText}>
              Do not admit the attendee again for this session. If they believe
              this is a mistake, contact the event lead.
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
  detailsCard: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(10, 10, 10, 0.12)",
    borderRadius: RADIUS.lg,
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(10, 10, 10, 0.1)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flexShrink: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    backgroundColor: "#FCEAE6",
  },
  statusBadgeText: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  ticketId: {
    flexShrink: 1,
    fontFamily: FONT_FAMILY.sans,
    color: "#656565",
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    textAlign: "right",
  },
  detailRow: {
    paddingVertical: SPACING.sm,
  },
  label: {
    fontFamily: FONT_FAMILY.sans,
    color: "#656565",
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  value: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(10, 10, 10, 0.1)",
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
