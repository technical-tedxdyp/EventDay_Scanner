import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityItem } from "@/components/ActivityItem";
import { useAnalytics } from "@/hooks/useAnalytics";
import { fetchScannerSessions, type ScannerSession } from "@/services/api";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "@/utils/theme";

function SectionTitle({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
      </View>
      <View style={styles.sectionRule} />
    </View>
  );
}

export default function AnalyticsScreen() {
  const analytics = useAnalytics();
  const insets = useSafeAreaInsets();
  const appear = useRef(new Animated.Value(0)).current;
  const admissionSessions = Array.isArray(analytics.analytics?.bySession)
    ? analytics.analytics.bySession
    : [];
  const [activeSessions, setActiveSessions] = useState<ScannerSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const sessions = activeSessions.map((session) => {
    const admission = admissionSessions.find(
      (item) => item.sessionId === session._id,
    );
    return {
      sessionId: session._id,
      title: session.title,
      admissions: admission?.admissions ?? 0,
      uniqueBookings: admission?.uniqueBookings ?? 0,
    };
  });
  const knownSessionIds = new Set(sessions.map((session) => session.sessionId));
  sessions.push(
    ...admissionSessions
      .filter((session) => !knownSessionIds.has(session.sessionId))
      .map((session) => ({
        sessionId: session.sessionId,
        title: session.title,
        admissions: session.admissions,
        uniqueBookings: session.uniqueBookings,
      })),
  );
  const recentHistory = analytics.history.slice(0, 10);
  const rates = [
    {
      label: "Verified",
      value: analytics.successRate * 100,
      count: analytics.validCount,
      color: COLORS.primary,
    },
    {
      label: "Denied",
      value: analytics.rejectionRate * 100,
      count: analytics.invalidCount,
      color: COLORS.dark,
    },
    {
      label: "Duplicate",
      value: analytics.duplicateRate * 100,
      count: analytics.duplicateCount,
      color: COLORS.dark,
    },
  ];

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      setActiveSessions(await fetchScannerSessions());
    } catch (error) {
      setSessionsError(
        error instanceof Error ? error.message : "Unable to load sessions.",
      );
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const refreshAll = () => {
    void Promise.all([analytics.refreshStats(), loadSessions()]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, SPACING.lg),
            paddingBottom: Math.max(insets.bottom, 104),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: appear }}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Analytics</Text>
              <Text style={styles.subtitle}>Live admission overview</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh analytics"
              accessibilityState={{
                disabled: analytics.loading || sessionsLoading,
              }}
              onPress={refreshAll}
              disabled={analytics.loading || sessionsLoading}
              style={({ pressed }) => [
                styles.refreshButton,
                pressed && styles.pressed,
                (analytics.loading || sessionsLoading) &&
                  styles.refreshDisabled,
              ]}
            >
              {analytics.loading || sessionsLoading ? (
                <ActivityIndicator size="small" color={COLORS.foreground} />
              ) : (
                <MaterialCommunityIcons
                  name="refresh"
                  size={21}
                  color={COLORS.foreground}
                />
              )}
            </Pressable>
          </View>

          {analytics.error ? (
            <View style={styles.errorPanel}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={20}
                color={COLORS.primary}
              />
              <View style={styles.errorCopy}>
                <Text style={styles.errorTitle}>Unable to load analytics</Text>
                <Text style={styles.errorMessage}>{analytics.error}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={refreshAll}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>RETRY</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeading}>
              <View style={styles.liveDot} />
              <Text style={styles.summaryLabel}>TOTAL SCANS</Text>
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.summaryNumbers}>
              <Text style={styles.totalValue}>{analytics.totalScans}</Text>
              <View style={styles.summaryDivider} />
              <View style={styles.admissionsSummary}>
                <Text style={styles.admissionsValue}>
                  {analytics.activeEntries}
                </Text>
                <Text style={styles.admissionsLabel}>GROUPS ADMITTED</Text>
              </View>
            </View>
            <Text style={styles.summaryFooter}>
              {analytics.loading && analytics.totalScans === 0
                ? "SYNCING LIVE EVENT DATA"
                : "TICKET VERIFICATION ACTIVITY"}
            </Text>
          </View>

          <View style={styles.outcomeStrip}>
            <Outcome
              label="VERIFIED"
              value={analytics.validCount}
              icon="check-circle-outline"
            />
            <View style={styles.outcomeDivider} />
            <Outcome
              label="DENIED"
              value={analytics.invalidCount}
              icon="close-circle-outline"
            />
            <View style={styles.outcomeDivider} />
            <Outcome
              label="DUPLICATE"
              value={analytics.duplicateCount}
              icon="content-copy"
            />
          </View>

          <SectionTitle
            title="Admissions by session"
            detail="Check-ins across each event session"
          />
          <View style={styles.listPanel}>
            {sessions.length === 0 ? (
              <EmptyState
                loading={analytics.loading || sessionsLoading}
                icon="ticket-confirmation-outline"
                title={
                  sessionsError
                    ? "Sessions unavailable"
                    : "No sessions found"
                }
                text={
                  sessionsError ??
                  "Available sessions and admissions will appear here."
                }
              />
            ) : (
              sessions.map((session, index) => (
                <View
                  key={session.sessionId}
                  style={[
                    styles.sessionRow,
                    index === sessions.length - 1 && styles.lastRow,
                  ]}
                >
                  <View style={styles.sessionIcon}>
                    <MaterialCommunityIcons
                      name="ticket-confirmation-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionName} numberOfLines={1}>
                      {session.title}
                    </Text>
                    <Text style={styles.sessionBookings}>
                      {session.uniqueBookings} GROUP BOOKINGS
                    </Text>
                  </View>
                  <Text style={styles.sessionAdmissions}>
                    {session.admissions}
                  </Text>
                </View>
              ))
            )}
          </View>

          <SectionTitle
            title="Scan outcomes"
            detail="Share of all ticket checks"
          />
          <View style={styles.listPanel}>
            {rates.map((rate, index) => (
              <View
                key={rate.label}
                style={[styles.rateRow, index === rates.length - 1 && styles.lastRow]}
              >
                <View style={styles.rateHead}>
                  <Text style={styles.rateName}>{rate.label}</Text>
                  <Text style={styles.ratePercent}>
                    {rate.count} · {rate.value.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.rateTrack}>
                  <View
                    style={[
                      styles.rateFill,
                      {
                        width: `${Math.min(Math.max(rate.value, 0), 100)}%`,
                        backgroundColor: rate.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <SectionTitle
            title="Throughput"
            detail="Admission pace and busiest period"
          />
          <View style={styles.throughputCard}>
            <ThroughputStat
              icon="speedometer"
              label="ENTRY RATE"
              value={analytics.entryRate.toFixed(2)}
              detail="GROUPS / MIN"
            />
            <View style={styles.throughputDivider} />
            <ThroughputStat
              icon="clock-time-four-outline"
              label="PEAK WINDOW"
              value={analytics.peakWindow}
              detail="BUSIEST PERIOD"
              compact
            />
          </View>

          <SectionTitle
            title="Recent activity"
            detail="The latest ticket scans"
          />
          <View style={styles.listPanel}>
            {recentHistory.length === 0 ? (
              <EmptyState
                loading={analytics.loading}
                icon="history"
                title={
                  analytics.error
                    ? "Activity unavailable"
                    : "No scans recorded yet"
                }
                text={
                  analytics.error ??
                  "Recent ticket activity will appear here."
                }
              />
            ) : (
              recentHistory.map((item) => (
                <ActivityItem
                  key={item.id}
                  name={item.name}
                  ticketId={item.ticketId}
                  status={item.status}
                  time={item.time}
                />
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Outcome({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}) {
  return (
    <View style={styles.outcome}>
      <MaterialCommunityIcons
        name={icon}
        size={19}
        color={COLORS.dark}
      />
      <Text style={styles.outcomeValue}>{value}</Text>
      <Text style={styles.outcomeLabel}>{label}</Text>
    </View>
  );
}

function ThroughputStat({
  icon,
  label,
  value,
  detail,
  compact = false,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
  detail: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.throughputStat}>
      <MaterialCommunityIcons name={icon} size={21} color={COLORS.primary} />
      <Text style={styles.throughputLabel}>{label}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.throughputValue, compact && styles.throughputCompact]}
      >
        {value}
      </Text>
      <Text style={styles.throughputDetail}>{detail}</Text>
    </View>
  );
}

function EmptyState({
  loading,
  icon,
  title,
  text,
}: {
  loading: boolean;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  text: string;
}) {
  return (
    <View style={styles.emptyState}>
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={COLORS.primary}
        />
      )}
      <View style={styles.emptyCopy}>
        <Text style={styles.emptyTitle}>
          {loading ? "Loading event data" : title}
        </Text>
        {!loading ? <Text style={styles.emptyText}>{text}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  title: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.xxl + 2,
    fontWeight: "900",
    marginTop: 2,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: 1,
  },
  refreshButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dark,
    borderRadius: 12,
  },
  pressed: {
    transform: [{ translateY: 2 }],
  },
  refreshDisabled: {
    opacity: 0.65,
  },
  errorPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  errorCopy: {
    flex: 1,
  },
  errorTitle: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.sm,
    fontWeight: "800",
  },
  errorMessage: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  retryButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  retryText: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.foreground,
    fontSize: FONT_SIZE.xs,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  summaryCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.foreground,
    borderWidth: 1,
    borderColor: "rgba(10, 10, 10, 0.12)",
    borderRadius: 16,
  },
  summaryHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  summaryLabel: {
    flex: 1,
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  summaryNumbers: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  totalValue: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.hero - 4,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  summaryDivider: {
    width: 1,
    height: 44,
    marginHorizontal: SPACING.lg,
    backgroundColor: "rgba(10, 10, 10, 0.12)",
  },
  admissionsSummary: {
    flex: 1,
  },
  admissionsValue: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
  },
  admissionsLabel: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  summaryFooter: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: SPACING.md,
  },
  outcomeStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.foreground,
    borderWidth: 1,
    borderColor: "rgba(10, 10, 10, 0.12)",
    borderRadius: 14,
  },
  outcome: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  outcomeValue: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.xl,
    fontWeight: "900",
  },
  outcomeLabel: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  outcomeDivider: {
    width: 1,
    height: 46,
    backgroundColor: "rgba(10, 10, 10, 0.12)",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.md,
    fontWeight: "800",
  },
  sectionDetail: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  sectionRule: {
    width: 18,
    height: 2,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  listPanel: {
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.foreground,
    borderWidth: 1,
    borderColor: "rgba(10, 10, 10, 0.12)",
    borderRadius: 14,
    overflow: "hidden",
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  sessionIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    borderRadius: 9,
    backgroundColor: COLORS.background,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
  },
  sessionBookings: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
    letterSpacing: 0.2,
    marginTop: 3,
  },
  sessionAdmissions: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.primary,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "900",
    marginLeft: SPACING.sm,
  },
  emptyState: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  emptyCopy: {
    flex: 1,
    gap: 3,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  emptyText: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
  },
  rateRow: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  rateHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  rateName: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  ratePercent: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.sm,
    fontWeight: "800",
  },
  rateTrack: {
    height: 7,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  rateFill: {
    height: "100%",
    borderRadius: 4,
  },
  throughputCard: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.foreground,
    borderWidth: 1,
    borderColor: "rgba(10, 10, 10, 0.12)",
    borderRadius: 14,
  },
  throughputStat: {
    flex: 1,
    minHeight: 104,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xs,
  },
  throughputLabel: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
  },
  throughputValue: {
    maxWidth: "100%",
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.dark,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "900",
    marginTop: 2,
  },
  throughputCompact: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.sm,
  },
  throughputDetail: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  throughputDivider: {
    width: 1,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
});
