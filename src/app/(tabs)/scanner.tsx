import { CameraView, useCameraPermissions } from "expo-camera";
import { BlurView } from "expo-blur";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";
import { useScanner } from "@/hooks/useScanner";
import {
    fetchScannerSessions,
    logoutScannerOperator,
    type ScannerSession,
} from "@/services/api";
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SHADOW, SPACING } from "@/utils/theme";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

const FRAME_SIZE = Math.min(width * 0.66, 260);
const CORNER_SIZE = 28;
const CORNER_WIDTH = 4;

function formatSessionStartTime(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "TIME UNAVAILABLE";

    const dayMonth = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
    }).format(date);
    const time = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
    }).format(date);

    return `${dayMonth}, ${time}`;
}

export default function ScannerScreen() {
    const router = useRouter();
    const { isScanning, error, performQrScan } = useScanner();

    const [sessions, setSessions] = useState<ScannerSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [sessionError, setSessionError] = useState<string | null>(null);

    const [permission, requestPermission] = useCameraPermissions();

    const [scanned, setScanned] = useState(false);
    const [manualModalVisible, setManualModalVisible] = useState(false);
    const [manualTicketId, setManualTicketId] = useState("");
    const scanLockRef = useRef(false);

    const insets = useSafeAreaInsets();

    const scanlineY = useRef(new Animated.Value(0)).current;
    const cornerPulse = useRef(new Animated.Value(0.5)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;

    /*
     * Request camera permission.
     */
    useEffect(() => {
        if (!permission?.granted && Platform.OS !== "web") {
            requestPermission();
        }
    }, [permission]);

    const loadSessions = useCallback(async () => {
        setSessionsLoading(true);
        setSessionError(null);
        try {
            const availableSessions = await fetchScannerSessions();
            setSessions(availableSessions);
            setSelectedSessionId(
                (current) => current || availableSessions[0]?._id || "",
            );
            if (!availableSessions.length)
                setSessionError("No active sessions are available.");
        } catch (loadError) {
            setSessionError(
                loadError instanceof Error
                    ? loadError.message
                    : "Unable to load sessions.",
            );
        } finally {
            setSessionsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSessions();
    }, [loadSessions]);

    /*
     * Scanner animations.
     */
    useEffect(() => {
        Animated.timing(fadeIn, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        const scanAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scanlineY, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanlineY, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ]),
        );

        scanAnimation.start();

        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(cornerPulse, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(cornerPulse, {
                    toValue: 0.5,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),
        );

        pulseAnimation.start();

        return () => {
            scanAnimation.stop();
            pulseAnimation.stop();
        };
    }, []);

    /*
     * Reset scanned state when returning to scanner.
     */
    useFocusEffect(
        React.useCallback(() => {
            scanLockRef.current = false;
            setScanned(false);

            return () => { };
        }, []),
    );

    useEffect(() => {
        if (error && !isScanning) {
            scanLockRef.current = false;
            setScanned(false);
        }
    }, [error, isScanning]);

    /*
     * QR scanner callback.
     *
     * IMPORTANT:
     * We intentionally do NOT check QR bounds here.
     * This avoids coordinate-system issues between the camera
     * preview and the visual scanning frame.
     */
    const handleBarCodeScanned = ({ data }: { data: string; bounds?: any }) => {
        if (scanLockRef.current || scanned || isScanning) {
            return;
        }

        if (!data || !data.trim()) {
            return;
        }

        scanLockRef.current = true;
        setScanned(true);
        performQrScan(data, selectedSessionId);
    };

    /*
     * Manual ticket verification.
     */
    const handleManualSubmit = () => {
        const ticketId = manualTicketId.trim().toUpperCase();

        if (!ticketId) {
            return;
        }

        scanLockRef.current = true;
        setManualModalVisible(false);
        setScanned(true);

        performQrScan(ticketId, selectedSessionId);

        setManualTicketId("");
    };

    const handleLogout = async () => {
        try {
            await logoutScannerOperator();
        } catch {
            // Local token storage is cleared even if the server cannot be reached.
        }
        router.replace("/(auth)/login");
    };

    /*
     * Scanline animation position.
     */
    const scanlineTranslate = scanlineY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, FRAME_SIZE - 4],
    });

    return (
        <Animated.View
            style={[
                s.container,
                {
                    opacity: fadeIn,
                },
            ]}
        >
            <View
                style={[
                    s.topBar,
                    {
                        paddingTop: Math.max(insets.top, SPACING.md),
                    },
                ]}
            >
                <View style={s.topRow}>
                    <View style={s.headingBlock}>
                        <Image
                            source={require("../../../assets/images/tedxlogo.svg")}
                            style={s.tedxLogo}
                            contentFit="contain"
                            accessibilityLabel="TEDx DYP Akurdi mosaic logo"
                        />
                    </View>

                    <View style={s.topActions}>
                        <TouchableOpacity
                            style={s.logoutBtn}
                            onPress={handleLogout}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Log out"
                        >
                            <Text style={s.logoutText}>LOG OUT ↗</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={s.sessionPanel}>
                    <View style={s.sessionHeader}>
                        <Text style={s.sessionLabel}>SELECT SESSION</Text>
                        {sessions.length > 0 && (
                            <Text style={s.sessionCount}>
                                {sessions.length} AVAILABLE
                            </Text>
                        )}
                    </View>
                    {sessionsLoading ? (
                        <View style={s.sessionLoading}>
                            <ActivityIndicator color={COLORS.primary} size="small" />
                            <Text style={s.sessionHint}>LOADING SESSIONS</Text>
                        </View>
                    ) : sessions.length > 0 ? (
                        <View style={s.sessionChoices}>
                            {sessions.map((session) => {
                                const selected = selectedSessionId === session._id;
                                return (
                                    <Pressable
                                        key={session._id}
                                        accessibilityRole="radio"
                                        accessibilityState={{ selected }}
                                        onPress={() => setSelectedSessionId(session._id)}
                                        style={({ pressed }) => [
                                            s.sessionChoice,
                                            selected && s.sessionChoiceActive,
                                            pressed && s.sessionChoicePressed,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                s.sessionChoiceIcon,
                                                selected && s.sessionChoiceIconActive,
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name="calendar-blank-outline"
                                                size={17}
                                                color={selected ? COLORS.foreground : COLORS.primary}
                                            />
                                        </View>
                                        <View style={s.sessionChoiceCopy}>
                                            <Text
                                                numberOfLines={1}
                                                style={[
                                                    s.sessionChoiceText,
                                                    selected && s.sessionChoiceTextActive,
                                                ]}
                                            >
                                                {session.title}
                                            </Text>
                                            <Text
                                                style={[
                                                    s.sessionChoiceMeta,
                                                    selected && s.sessionChoiceMetaActive,
                                                ]}
                                            >
                                                {formatSessionStartTime(session.startTime)}
                                            </Text>
                                        </View>
                                        {selected && (
                                            <MaterialCommunityIcons
                                                name="check-circle"
                                                size={19}
                                                color={COLORS.foreground}
                                            />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={s.sessionUnavailable}>
                            <Text style={s.sessionErrorText}>
                                {sessionError || "SESSION LIST UNAVAILABLE"}
                            </Text>
                            <Pressable
                                onPress={() => void loadSessions()}
                                style={s.retrySessionsButton}
                                accessibilityRole="button"
                            >
                                <Text style={s.retrySessionsText}>RETRY</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>

            <View style={s.cameraSection}>
                <View style={s.cameraShell}>
                    <View style={s.cameraFull}>
                        {permission?.granted || Platform.OS === "web" ? (
                            <CameraView
                                style={StyleSheet.absoluteFill}
                                facing="back"
                                barcodeScannerSettings={{
                                    barcodeTypes: ["qr"],
                                }}
                                onBarcodeScanned={
                                    scanned || isScanning || !selectedSessionId
                                        ? undefined
                                        : handleBarCodeScanned
                                }
                            />
                        ) : (
                            <View style={s.cameraPlaceholder}>
                                <Text style={s.placeholderIcon}>◎</Text>
                                <Text style={s.placeholderText}>CAMERA ACCESS REQUIRED</Text>
                                <NeonButton
                                    title="GRANT ACCESS"
                                    onPress={requestPermission}
                                    variant="secondary"
                                    style={{ marginTop: SPACING.lg }}
                                />
                            </View>
                        )}

                        {(permission?.granted || Platform.OS === "web") && (
                            <View style={s.overlayContainer} pointerEvents="none">
                                <View style={s.overlayTop} />
                                <View style={s.overlayMiddle}>
                                    <View style={s.overlaySide} />
                                    <View style={s.frameContainer}>
                                        <Animated.View
                                            style={[
                                                s.frameCorners,
                                                { opacity: cornerPulse },
                                            ]}
                                        >
                                            <View style={[s.corner, s.cTL]} />
                                            <View style={[s.corner, s.cTR]} />
                                            <View style={[s.corner, s.cBL]} />
                                            <View style={[s.corner, s.cBR]} />
                                        </Animated.View>
                                        <Animated.View
                                            style={[
                                                s.scanLine,
                                                { transform: [{ translateY: scanlineTranslate }] },
                                            ]}
                                        />
                                        <View style={s.crossH} />
                                        <View style={s.crossV} />
                                    </View>
                                    <View style={s.overlaySide} />
                                </View>
                                <View style={s.overlayBottom} />
                            </View>
                        )}

                        {isScanning && (
                            <View style={s.procFullOverlay}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text style={s.procText}>VALIDATING TICKET</Text>
                                <Text style={s.procSubtext}>PLEASE WAIT A MOMENT</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={s.scanStatus}>
                    <View style={[s.statusDot, isScanning && s.statusDotBusy]} />
                    <Text style={s.frameLbl}>
                        {isScanning
                            ? "PROCESSING SCAN"
                            : scanned
                                ? "SCAN COMPLETE"
                                : "ALIGN QR CODE WITHIN FRAME"}
                    </Text>
                </View>
            </View>

            {error && !isScanning && (
                <View style={s.errBanner}>
                    <Text style={s.errText}>{error}</Text>
                </View>
            )}

            <View
                style={[
                    s.bottomCtrl,
                    { paddingBottom: Math.max(insets.bottom, SPACING.md) },
                ]}
            >
                <View style={s.bottomCopy}>
                    <Text style={s.bottomTitle}>Having trouble scanning?</Text>
                    <Text style={s.instrText}>Enter the ticket or booking reference instead.</Text>
                </View>
                <TouchableOpacity
                    style={[
                        s.manualBtn,
                        (!selectedSessionId || isScanning) && s.manualBtnDisabled,
                    ]}
                    onPress={() => setManualModalVisible(true)}
                    activeOpacity={0.8}
                    disabled={!selectedSessionId || isScanning}
                    accessibilityRole="button"
                    accessibilityLabel="Enter ticket ID manually"
                >
                    <Text style={s.manualBtnText}>ENTER ID</Text>
                    <Text style={s.manualBtnArrow}>↗</Text>
                </TouchableOpacity>
            </View>

            {/* ============================================================
          MANUAL ENTRY MODAL
          ============================================================ */}

            <Modal
                visible={manualModalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                navigationBarTranslucent
                onRequestClose={() => setManualModalVisible(false)}
            >
                <View style={s.modalOverlay}>
                    <BlurView
                        pointerEvents="none"
                        intensity={45}
                        tint="dark"
                        style={s.modalBackdrop}
                    />
                    <View pointerEvents="none" style={s.modalBackdropTint} />
                    <GlassCard glowIntensity="strong" style={s.modalCard}>
                        <View style={s.modalHeader}>
                            <View style={s.modalIcon}>
                                <Text style={s.modalIconText}>ID</Text>
                            </View>
                            <View style={s.modalHeadingCopy}>
                                <Text style={s.modalEyebrow}>TICKET CHECK-IN</Text>
                                <Text style={s.modalTitle}>Enter ticket ID</Text>
                            </View>
                        </View>

                        <Text style={s.modalSub}>
                            Use the ticket ID or booking reference printed on the ticket.
                        </Text>

                        <Text style={s.modalInputLabel}>TICKET OR BOOKING REFERENCE</Text>

                        <TextInput
                            style={s.modalInput}
                            placeholder="e.g. TEDX-2026-ABCD"
                            placeholderTextColor="rgba(10, 10, 10, 0.45)"
                            selectionColor={COLORS.primary}
                            value={manualTicketId}
                            onChangeText={(value) => setManualTicketId(value.toUpperCase())}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleManualSubmit}
                            accessibilityLabel="Ticket ID or booking reference"
                        />

                        <View style={s.modalActions}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Verify ticket"
                                accessibilityState={{
                                    disabled:
                                        !manualTicketId.trim() || !selectedSessionId || isScanning,
                                }}
                                onPress={handleManualSubmit}
                                disabled={
                                    !manualTicketId.trim() || !selectedSessionId || isScanning
                                }
                                style={({ pressed }) => [
                                    s.verifyButton,
                                    pressed && s.modalButtonPressed,
                                    (!manualTicketId.trim() || !selectedSessionId || isScanning) &&
                                        s.verifyButtonDisabled,
                                ]}
                            >
                                <Text style={s.verifyButtonText}>VERIFY TICKET</Text>
                                <Text style={s.verifyButtonArrow}>↗</Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Close manual ticket entry"
                                onPress={() => setManualModalVisible(false)}
                                style={({ pressed }) => [
                                    s.cancelButton,
                                    pressed && s.modalButtonPressed,
                                ]}
                            >
                                <Text style={s.cancelButtonText}>CLOSE</Text>
                            </Pressable>
                        </View>
                    </GlassCard>
                </View>
            </Modal>
        </Animated.View>
    );
}

/* ================================================================
   STYLES
   ================================================================ */

const OVERLAY_OPACITY = 0.8;

const s = StyleSheet.create({
    container: {
        flex: 1,
    },

    cameraFull: {
        flex: 1,
        minHeight: 220,
        overflow: "hidden",
        backgroundColor: COLORS.dark,
        borderWidth: 2,
        borderColor: COLORS.dark,
    },

    cameraPlaceholder: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
        padding: SPACING.lg,
    },

    tedxLogo: {
        width: 56,
        height: 44,
    },

    placeholderIcon: {
        color: COLORS.primary,
        fontSize: 52,
        marginBottom: SPACING.md,
    },

    placeholderText: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.dark,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        letterSpacing: 3,
        textAlign: "center",
    },

    overlayContainer: {
        ...StyleSheet.absoluteFill,
        flexDirection: "column",
    },

    overlayMiddle: {
        height: FRAME_SIZE,
        flexDirection: "row",
    },

    overlaySide: {
        flex: 1,
        backgroundColor: COLORS.dark,
        opacity: OVERLAY_OPACITY,
    },

    overlayTop: {
        flex: 1,
        backgroundColor: COLORS.dark,
        opacity: OVERLAY_OPACITY,
    },

    overlayBottom: {
        flex: 1,
        backgroundColor: COLORS.dark,
        opacity: OVERLAY_OPACITY,
    },

    frameContainer: {
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },

    frameCorners: {
        ...StyleSheet.absoluteFill,
    },

    corner: {
        position: "absolute",
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderColor: COLORS.foreground,
    },

    cTL: {
        top: 0,
        left: 0,
        borderTopWidth: CORNER_WIDTH,
        borderLeftWidth: CORNER_WIDTH,
    },

    cTR: {
        top: 0,
        right: 0,
        borderTopWidth: CORNER_WIDTH,
        borderRightWidth: CORNER_WIDTH,
    },

    cBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: CORNER_WIDTH,
        borderLeftWidth: CORNER_WIDTH,
    },

    cBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: CORNER_WIDTH,
        borderRightWidth: CORNER_WIDTH,
    },

    scanLine: {
        position: "absolute",
        left: CORNER_SIZE / 2,
        right: CORNER_SIZE / 2,
        top: 0,
        height: 2,
        backgroundColor: COLORS.primary,
        ...SHADOW.glow,
    },

    crossH: {
        position: "absolute",
        width: 28,
        height: 1,
        backgroundColor: COLORS.primary,
        opacity: 0.65,
    },

    crossV: {
        position: "absolute",
        width: 1,
        height: 28,
        backgroundColor: COLORS.primary,
        opacity: 0.65,
    },

    topBar: {
        backgroundColor: "white",
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        marginBottom: SPACING.md,
        borderBottomLeftRadius: RADIUS["2xl"],
        borderBottomRightRadius: RADIUS["2xl"],
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 44,
        marginBottom: SPACING.md,
        marginTop: SPACING.lg,
    },

    headingBlock: {
        gap: 1,
    },

    topEyebrow: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        letterSpacing: 2.2,
    },

    topActions: {
        flexDirection: "row",
        alignItems: "center",
    },

    logoutBtn: {
        height: 44,
        justifyContent: "center",
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.dark,
        borderWidth: 2,
        borderColor: COLORS.dark,
    },

    logoutText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.foreground,
        fontSize: FONT_SIZE.xs,
        fontWeight: "800",
        letterSpacing: 1,
    },

    sessionPanel: {
        width: "100%",
        marginTop: SPACING.sm,
    },

    sessionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.sm,
    },

    sessionLabel: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.dark,
        fontSize: FONT_SIZE.xs,
        fontWeight: "800",
        letterSpacing: 1.2,
    },

    sessionCount: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        letterSpacing: 0.6,
    },

    sessionChoices: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SPACING.sm,
    },

    sessionChoice: {
        minHeight: 66,
        width: "48%",
        minWidth: 0,
        paddingHorizontal: SPACING.md,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: "rgba(10, 10, 10, 0.16)",
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.background,
    },

    sessionChoiceActive: {
        backgroundColor: COLORS.dark,
        borderColor: COLORS.dark,
    },

    sessionChoicePressed: {
        opacity: 0.82,
        transform: [{ scale: 0.98 }],
    },

    sessionChoiceIcon: {
        width: 32,
        height: 32,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "white",
    },

    sessionChoiceIconActive: {
        backgroundColor: COLORS.primary,
    },

    sessionChoiceCopy: {
        flex: 1,
        minWidth: 0,
    },

    sessionChoiceText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.dark,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
    },

    sessionChoiceTextActive: {
        color: COLORS.foreground,
    },

    sessionChoiceMeta: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        letterSpacing: 0.5,
        marginTop: 3,
    },

    sessionChoiceMetaActive: {
        color: COLORS.foreground,
        opacity: 0.7,
    },

    sessionLoading: {
        minHeight: 40,
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
    },

    sessionHint: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        letterSpacing: 1.5,
    },

    sessionErrorText: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.textDanger,
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        paddingVertical: SPACING.sm,
    },

    sessionUnavailable: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: SPACING.sm,
    },

    retrySessionsButton: {
        minWidth: 68,
        minHeight: 36,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: COLORS.primary,
        paddingHorizontal: SPACING.sm,
    },

    retrySessionsText: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.primary,
        fontSize: FONT_SIZE.xs,
        fontWeight: "800",
        letterSpacing: 1,
    },

    topTitle: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.dark,
        fontSize: FONT_SIZE.xxl,
        fontWeight: "900",
        letterSpacing: -0.7,
    },
    topSubtitle: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.dark,
        fontSize: 9,
        fontWeight: "700",
        letterSpacing: 0.8,
        marginTop: -2,
    },

    manualBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.dark,
    },

    manualBtnDisabled: {
        opacity: 0.5,
    },

    manualBtnText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.foreground,
        fontSize: FONT_SIZE.sm,
        fontWeight: "800",
        letterSpacing: 1,
    },

    manualBtnArrow: {
        color: COLORS.foreground,
        fontSize: FONT_SIZE.lg,
        fontWeight: "800",
    },

    cameraSection: {
        flex: 1,
        minHeight: 240,
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.xs,
        marginBottom: SPACING.sm,
    },

    cameraShell: {
        flex: 1,
        overflow: "visible",
        backgroundColor: COLORS.dark,
    },

    scanStatus: {
        minHeight: 38,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },

    statusDotBusy: {
        backgroundColor: COLORS.dark,
    },

    frameLbl: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        letterSpacing: 1.5,
        textAlign: "center",
    },

    procFullOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: COLORS.dark,
        alignItems: "center",
        justifyContent: "center",
        padding: SPACING.lg,
    },

    procText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.foreground,
        fontSize: FONT_SIZE.md,
        fontWeight: "800",
        letterSpacing: 1,
        textAlign: "center",
        marginTop: SPACING.md,
    },

    procSubtext: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.foreground,
        fontSize: FONT_SIZE.sm,
        letterSpacing: 1.4,
        marginTop: SPACING.xs,
        opacity: 0.75,
    },

    errBanner: {
        marginHorizontal: SPACING.lg,
        padding: SPACING.md,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.sm,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginBottom: SPACING.sm,
    },

    errText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.dark,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        letterSpacing: 0.2,
    },

    bottomCtrl: {
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.xs,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        paddingTop: SPACING.sm,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: SPACING.md,
        backgroundColor: COLORS.background,
    },

    bottomCopy: {
        flex: 1,
        gap: 2,
    },

    bottomTitle: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.dark,
        fontSize: FONT_SIZE.sm,
        fontWeight: "800",
    },

    instrText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.xs,
        fontWeight: "500",
        lineHeight: 16,
    },

    /* ---------------------------------------------------------------
           MANUAL MODAL
           --------------------------------------------------------------- */

    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: SPACING.lg,
    },

    modalBackdrop: {
        ...StyleSheet.absoluteFill,
    },

    modalBackdropTint: {
        ...StyleSheet.absoluteFill,
        backgroundColor: COLORS.dark,
        opacity: 0.45,
    },

    modalCard: {
        padding: SPACING.lg,
    },

    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.md,
    },

    modalIcon: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: COLORS.dark,
        ...SHADOW.glowSubtle,
    },

    modalIconText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.foreground,
        fontSize: FONT_SIZE.md,
        fontWeight: "900",
        letterSpacing: 1,
    },

    modalHeadingCopy: {
        flex: 1,
        gap: 2,
    },

    modalEyebrow: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        letterSpacing: 1.7,
    },

    modalTitle: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.dark,
        fontSize: FONT_SIZE.xl,
        fontWeight: "900",
        letterSpacing: -0.4,
    },

    modalSub: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
        lineHeight: 20,
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },

    modalInputLabel: {
        fontFamily: FONT_FAMILY.pixel,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        letterSpacing: 1.2,
        marginBottom: SPACING.xs,
    },

    modalInput: {
        fontFamily: FONT_FAMILY.sans,
        backgroundColor: COLORS.background,
        borderWidth: 2,
        borderColor: COLORS.dark,
        borderBottomWidth: 4,
        borderBottomColor: COLORS.primary,
        borderRadius: 0,
        color: COLORS.dark,
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        letterSpacing: 0.8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        marginBottom: SPACING.lg,
    },

    modalActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
    },

    verifyButton: {
        flex: 1,
        minHeight: 50,
        paddingHorizontal: SPACING.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: COLORS.dark,
        ...SHADOW.button,
    },

    verifyButtonDisabled: {
        opacity: 0.55,
    },

    modalButtonPressed: {
        transform: [{ translateY: 2 }],
    },

    verifyButtonText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.foreground,
        fontSize: FONT_SIZE.sm,
        fontWeight: "900",
        letterSpacing: 0.8,
    },

    verifyButtonArrow: {
        color: COLORS.foreground,
        fontSize: FONT_SIZE.lg,
        fontWeight: "800",
    },

    cancelButton: {
        minWidth: 92,
        minHeight: 50,
        paddingHorizontal: SPACING.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.dark,
    },

    cancelButtonText: {
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.dark,
        fontSize: FONT_SIZE.sm,
        fontWeight: "800",
        letterSpacing: 0.8,
    },
});
