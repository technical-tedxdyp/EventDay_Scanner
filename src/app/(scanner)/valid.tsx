import { useAnalytics } from "@/hooks/useAnalytics";
import { checkInTicket, ScannerApiError } from "@/services/api";
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from "@/utils/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VALID_COLORS = {
    primary: "#237A52",
    primaryGlow: "#237A52",
    bgAccent: "#EAF4EE",
};

export default function ValidScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        holderName: string;
        group: string;
        accessType: string;
        ticketId: string;
        sessionId: string;
        sessionTitle: string;
    }>();
    const insets = useSafeAreaInsets();
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkInError, setCheckInError] = useState<string | null>(null);
    const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
    const { refreshStats } = useAnalytics();

    // Animations
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const glowPulse = useRef(new Animated.Value(0.4)).current;
    const glowScale = useRef(new Animated.Value(1)).current;
    const cardSlide = useRef(new Animated.Value(50)).current;
    const cardFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Status badge entrance
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Keep the ring's pulse subtle so the verified icon stays legible.
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(glowPulse, {
                        toValue: 0.7,
                        duration: 1400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowScale, {
                        toValue: 1.06,
                        duration: 1400,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(glowPulse, {
                        toValue: 0.4,
                        duration: 1400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowScale, {
                        toValue: 1,
                        duration: 1400,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        );
        pulseAnimation.start();

        const cardEntranceTimer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(cardSlide, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(cardFade, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 200);

        return () => {
            pulseAnimation.stop();
            clearTimeout(cardEntranceTimer);
        };
    }, [cardFade, cardSlide, glowPulse, glowScale, opacityAnim, scaleAnim]);

    const handleAllowEntry = async () => {
        if (!params.ticketId || !params.sessionId || checkedInAt) return;
        setCheckingIn(true);
        setCheckInError(null);
        try {
            const result = await checkInTicket(params.ticketId, params.sessionId);
            setCheckedInAt(result.checkedInAt);
            await refreshStats();
        } catch (error) {
            if (error instanceof ScannerApiError && error.status === 401) {
                router.replace("/(auth)/login");
                return;
            }
            setCheckInError(
                error instanceof Error
                    ? error.message
                    : "Admission could not be recorded. Do not admit this group.",
            );
        } finally {
            setCheckingIn(false);
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: Math.max(insets.top, 40),
                    paddingBottom: Math.max(insets.bottom, 20),
                },
            ]}
        >
            {/* Background accents */}
            <View style={styles.bgAccent1} />
            <View style={styles.bgAccent2} />

            {/* Status header */}
            <View style={styles.statusSection}>
                <Animated.View
                    style={[
                        styles.statusContainer,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.iconWrap}>
                        <Animated.View
                            style={[
                                styles.glowRing,
                                {
                                    opacity: glowPulse,
                                    transform: [{ scale: glowScale }],
                                },
                            ]}
                        />
                        <View style={styles.checkIcon}>
                            <MaterialCommunityIcons
                                name="check"
                                size={38}
                                color={VALID_COLORS.primary}
                            />
                        </View>
                    </View>
                    <Text style={styles.statusTitle}>
                        {checkedInAt ? "ADMITTED" : "VERIFIED"}
                    </Text>
                    <Text style={styles.statusSub}>
                        {checkedInAt ? "ENTRY RECORDED" : "ENTRY NOT YET RECORDED"}
                    </Text>
                </Animated.View>
            </View>

            {/* Ticket details */}
            <Animated.View
                style={[
                    styles.cardSection,
                    {
                        opacity: cardFade,
                        transform: [{ translateY: cardSlide }],
                    },
                ]}
            >
                <View style={styles.detailsCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardStatus}>
                            <View style={styles.cardStatusDot} />
                            <Text style={styles.cardStatusText}>
                                {checkedInAt ? "ADMITTED" : "TICKET VERIFIED"}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.ticketId}>
                        {params.ticketId || "TEDX-2026-00000"}
                    </Text>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>TICKET HOLDER</Text>
                            <Text style={styles.detailValue} numberOfLines={2}>
                                {params.holderName || "UNKNOWN ATTENDEE"}
                            </Text>
                        </View>

                        <View style={styles.detailDivider} />

                        <View style={styles.detailRowInline}>
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>TICKET COUNT</Text>
                                <Text style={styles.detailValueLarge}>
                                    {params.group || "1"}
                                </Text>
                            </View>
                            <View style={styles.detailColDivider} />
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>SESSION / PASS</Text>
                                <View style={styles.accessBadge}>
                                    <Text style={styles.accessBadgeText}>
                                        {params.sessionTitle ||
                                            params.accessType ||
                                            "SELECTED SESSION"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.buttonSection}>
                    {checkInError && (
                        <Text
                            style={styles.checkInError}
                        >{`ADMISSION NOT CONFIRMED. VERIFY BEFORE ALLOWING ENTRY: ${checkInError}`}</Text>
                    )}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{
                            disabled: checkingIn || Boolean(checkedInAt),
                            busy: checkingIn,
                        }}
                        onPress={handleAllowEntry}
                        disabled={checkingIn || Boolean(checkedInAt)}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.buttonPressed,
                            (checkingIn || Boolean(checkedInAt)) && styles.buttonDisabled,
                        ]}
                    >
                        {checkingIn ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <MaterialCommunityIcons
                                name={checkedInAt ? "check-circle-outline" : "door-open"}
                                size={21}
                                color="#FFFFFF"
                            />
                        )}
                        <Text style={styles.primaryButtonText}>
                            {checkedInAt
                                ? "ENTRY RECORDED"
                                : checkingIn
                                    ? "RECORDING ENTRY..."
                                    : "CONFIRM ENTRY"}
                        </Text>
                        {!checkingIn && !checkedInAt && (
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={20}
                                color="#FFFFFF"
                            />
                        )}
                    </Pressable>
                    {checkedInAt && (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.replace("/(tabs)/scanner")}
                            style={({ pressed }) => [
                                styles.secondaryButton,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="qrcode-scan"
                                size={20}
                                color={COLORS.dark}
                            />
                            <Text style={styles.secondaryButtonText}>SCAN NEXT TICKET</Text>
                        </Pressable>
                    )}
                </View>

                <Text style={styles.footerText}>
                    {checkedInAt
                        ? `ADMISSION CONFIRMED • ${new Date(checkedInAt).toLocaleTimeString().toUpperCase()}`
                        : "VERIFIED ONLY • ADMISSION REQUIRES CONFIRMATION"}
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    bgAccent1: {
        position: "absolute",
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: VALID_COLORS.primaryGlow,
        opacity: 0.04,
    },
    bgAccent2: {
        position: "absolute",
        bottom: -50,
        left: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: VALID_COLORS.primary,
        opacity: 0.03,
    },
    statusSection: {
        alignItems: "center",
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.lg,
    },
    statusContainer: { alignItems: "center" },
    iconWrap: {
        width: 96,
        height: 96,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: SPACING.md,
    },
    glowRing: {
        position: "absolute",
        top: 3,
        left: 3,
        width: 90,
        height: 90,
        borderRadius: RADIUS.round,
        borderWidth: 1,
        borderColor: VALID_COLORS.primary,
    },
    checkIcon: {
        width: 70,
        height: 70,
        borderRadius: RADIUS.round,
        backgroundColor: VALID_COLORS.bgAccent,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#B9D9C6",
    },
    statusTitle: {
        fontFamily: FONT_FAMILY.sans,
        fontSize: FONT_SIZE.xxl,
        fontWeight: "900",
        color: VALID_COLORS.primary,
        marginTop: SPACING.md,
    },
    statusSub: {
        fontFamily: FONT_FAMILY.sans,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        color: COLORS.textSecondary,
        letterSpacing: 0.5,
        marginTop: SPACING.xs,
    },
    cardSection: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    detailsCard: {
        padding: SPACING.lg,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "rgba(10, 10, 10, 0.12)",
        borderRadius: RADIUS.lg,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.xs,
    },
    cardStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.round,
        backgroundColor: VALID_COLORS.bgAccent,
    },
    cardStatusDot: {
        width: 7,
        height: 7,
        borderRadius: RADIUS.round,
        backgroundColor: VALID_COLORS.primary,
    },
    cardStatusText: {
        fontFamily: FONT_FAMILY.sans,
        color: VALID_COLORS.primary,
        fontSize: FONT_SIZE.xs,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    ticketId: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.md,
        fontWeight: "600",
        letterSpacing: 0.3,
        marginBottom: SPACING.sm,
    },
    detailsGrid: { gap: 0 },
    detailRow: { paddingVertical: SPACING.sm, marginBottom: SPACING.sm },
    detailRowInline: {
        flexDirection: "row",
        marginTop: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    detailCol: {
        flex: 1,
        alignItems: "flex-start",
        paddingHorizontal: SPACING.xs,
    },
    detailColDivider: {
        width: 1,
        backgroundColor: "rgba(10, 10, 10, 0.12)",
        marginRight: SPACING.xl,
    },
    detailLabel: {
        fontFamily: FONT_FAMILY.sans,
        color: "#656565",
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        letterSpacing: 0.6,
        marginBottom: SPACING.xs,
    },
    detailValue: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.text,
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        letterSpacing: 0.1,
    },
    detailValueLarge: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.text,
        fontSize: FONT_SIZE.xxl,
        fontWeight: "900",
        letterSpacing: 0.2,
    },
    detailDivider: {
        height: 1,
        backgroundColor: "rgba(10, 10, 10, 0.1)",
    },
    accessBadge: {
        backgroundColor: VALID_COLORS.bgAccent,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.round,
        borderWidth: 1,
        borderColor: "#B9D9C6",
        marginTop: SPACING.xs,
    },
    accessBadgeText: {
        fontFamily: FONT_FAMILY.sans,
        color: VALID_COLORS.primary,
        fontSize: FONT_SIZE.xs,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    buttonSection: {
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    checkInError: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.textDanger,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: SPACING.md,
    },
    primaryButton: {
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
        paddingHorizontal: SPACING.md,
        backgroundColor: VALID_COLORS.primary,
        borderRadius: RADIUS.md,
    },
    primaryButtonText: {
        flex: 1,
        fontFamily: FONT_FAMILY.sans,
        color: "#FFFFFF",
        fontSize: FONT_SIZE.lg,
        fontWeight: "800",
        letterSpacing: 0.5,
        textAlign: "center",
    },
    secondaryButton: {
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: "rgba(10, 10, 10, 0.18)",
        borderRadius: RADIUS.md,
        backgroundColor: "#FFFFFF",
    },
    secondaryButtonText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.dark,
        fontSize: FONT_SIZE.sm,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    buttonPressed: {
        opacity: 0.82,
        transform: [{ scale: 0.99 }],
    },
    buttonDisabled: { opacity: 0.72 },
    footerText: {
        fontFamily: FONT_FAMILY.sans,
        color: "#656565",
        fontSize: FONT_SIZE.xs,
        fontWeight: "600",
        letterSpacing: 0.3,
        textAlign: "center",
        marginTop: SPACING.md,
    },
});
