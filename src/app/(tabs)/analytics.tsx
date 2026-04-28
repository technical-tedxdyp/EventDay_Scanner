import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '@/utils/theme';
import { APP_NAME } from '@/utils/constants';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GlassCard } from '@/components/GlassCard';
import { StatCard } from '@/components/StatCard';
import { ProgressBar } from '@/components/ProgressBar';
import { ActivityItem } from '@/components/ActivityItem';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const analytics = useAnalytics();
  const insets = useSafeAreaInsets();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const recentHistory = analytics.history.slice(0, 10);

  return (
    <View style={s.container}>
      <View style={s.bgAccent} />
      <ScrollView 
        contentContainerStyle={[
          s.scroll, 
          { 
            paddingTop: Math.max(insets.top, 40), 
            paddingBottom: Math.max(insets.bottom, 20) 
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.headerTitle}>ANALYTICS</Text>
              <Text style={s.headerSub}>REAL-TIME MONITORING</Text>
            </View>
          </View>

          {/* Core Metrics Grid */}
          <Text style={s.sectionLabel}>CORE METRICS</Text>
          <View style={s.grid}>
            <View style={s.gridHalf}>
              <StatCard label="TOTAL SCANS" value={analytics.totalScans} color={COLORS.primary} />
            </View>
            <View style={s.gridHalf}>
              <StatCard label="ACTIVE ENTRIES" value={analytics.activeEntries} color={COLORS.accentSoft} />
            </View>
          </View>
          <View style={s.grid}>
            <View style={s.gridThird}>
              <StatCard label="ALLOWED" value={analytics.validCount} color={COLORS.primary} compact />
            </View>
            <View style={s.gridThird}>
              <StatCard label="DENIED" value={analytics.invalidCount} color={COLORS.primaryGlow} compact />
            </View>
            <View style={s.gridThird}>
              <StatCard label="DUPLICATE" value={analytics.duplicateCount} color={COLORS.accent} compact />
            </View>
          </View>

          {/* Derived Metrics */}
          <Text style={s.sectionLabel}>PERFORMANCE RATES</Text>
          <GlassCard glowIntensity="subtle">
            <ProgressBar label="SUCCESS RATE" percentage={analytics.successRate * 100} color={COLORS.primary} />
            <ProgressBar label="REJECTION RATE" percentage={analytics.rejectionRate * 100} color={COLORS.primaryGlow} />
            <ProgressBar label="DUPLICATE RATE" percentage={analytics.duplicateRate * 100} color={COLORS.accent} />
          </GlassCard>

          {/* Entry Rate + Peak */}
          <Text style={s.sectionLabel}>THROUGHPUT ANALYSIS</Text>
          <GlassCard glowIntensity="subtle">
            <View style={s.throughputRow}>
              <View style={s.throughputCol}>
                <Text style={s.throughputLabel}>ENTRY RATE</Text>
                <Text style={s.throughputValue}>{analytics.entryRate.toFixed(2)}</Text>
                <Text style={s.throughputUnit}>SCANS / MIN</Text>
              </View>
              <View style={s.throughputDivider} />
              <View style={s.throughputCol}>
                <Text style={s.throughputLabel}>PEAK WINDOW</Text>
                <Text style={s.throughputValueSm}>{analytics.peakWindow}</Text>
                <Text style={s.throughputUnit}>BUSIEST PERIOD</Text>
              </View>
            </View>
          </GlassCard>


          {/* Recent Activity */}
          <Text style={s.sectionLabel}>RECENT ACTIVITY</Text>
          <GlassCard glowIntensity="subtle">
            {recentHistory.length === 0 ? (
              <Text style={s.emptyText}>NO SCAN HISTORY</Text>
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
          </GlassCard>

          <View style={s.footerSpacer} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  bgAccent: { position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: COLORS.primaryGlow, opacity: 0.03 },
  scroll: { paddingHorizontal: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  headerTitle: { color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: '900', letterSpacing: 6 },
  headerSub: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '600', letterSpacing: 2, marginTop: 2 },
  sectionLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 3, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  grid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  gridHalf: { flex: 1 },
  gridThird: { flex: 1 },
  throughputRow: { flexDirection: 'row', alignItems: 'center' },
  throughputCol: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm },
  throughputDivider: { width: 1, height: 50, backgroundColor: COLORS.cardBorder },
  throughputLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: SPACING.xs },
  throughputValue: { color: COLORS.primary, fontSize: FONT_SIZE.xxl + 4, fontWeight: '900', letterSpacing: 1 },
  throughputValueSm: { color: COLORS.primary, fontSize: FONT_SIZE.md, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  throughputUnit: { color: COLORS.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 2, marginTop: 2 },
  sysRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm + 2 },
  sysDivider: { height: 1, backgroundColor: 'rgba(255,59,59,0.06)' },
  sysLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 2 },
  sysValue: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '800', letterSpacing: 1 },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '700', letterSpacing: 2, textAlign: 'center', paddingVertical: SPACING.xl },
  footerSpacer: { height: SPACING.xl },
});
