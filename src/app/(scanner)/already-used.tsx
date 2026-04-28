import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '@/utils/theme';
import { GlassCard } from '@/components/GlassCard';
import { NeonButton } from '@/components/NeonButton';
import { StatusBadge } from '@/components/StatusBadge';

export default function AlreadyUsedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    holderName: string;
    usedAt: string;
    ticketId: string;
  }>();
  const insets = useSafeAreaInsets();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const warningPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(cardSlide, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }, 200);

    Animated.loop(Animated.sequence([
      Animated.timing(warningPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(warningPulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);

  const formatTimestamp = (ts: string) => {
    if (!ts) return 'UNKNOWN';
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()} • ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    } catch {
      return ts;
    }
  };

  return (
    <View style={[s.container, { paddingTop: Math.max(insets.top, 40), paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={s.accentBar} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>
        <View style={s.statusSection}>
          <Animated.View style={[s.iconWrap, { transform: [{ scale: iconScale }] }]}>
            <Animated.View style={[s.glowRing, { opacity: warningPulse }]} />
            <View style={s.warnIcon}>
              <Text style={s.warnText}>⟳</Text>
            </View>
          </Animated.View>
          <Text style={s.title}>ALREADY{'\n'}USED</Text>
          <Text style={s.sub}>DUPLICATE ENTRY DETECTED</Text>
        </View>

        <Animated.View style={[s.cardWrap, { transform: [{ translateY: cardSlide }] }]}>
          <GlassCard glowIntensity="medium">
            <View style={s.cardHeader}>
              <StatusBadge label="DUPLICATE" color={COLORS.accent} />
              <Text style={s.ticketId}>{params.ticketId || 'TKT-00000'}</Text>
            </View>

            <View style={s.row}>
              <Text style={s.label}>TICKET HOLDER</Text>
              <Text style={s.value}>{params.holderName || 'UNKNOWN'}</Text>
            </View>

            <View style={s.divider} />

            <View style={s.row}>
              <Text style={s.label}>PREVIOUS ENTRY</Text>
              <View style={s.timestampBadge}>
                <Text style={s.timestampText}>{formatTimestamp(params.usedAt ?? '')}</Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.row}>
              <Text style={s.label}>STATUS</Text>
              <Text style={s.statusVal}>ENTRY ALREADY RECORDED — RE-SCAN BLOCKED</Text>
            </View>
          </GlassCard>

          <View style={s.buttons}>
            <NeonButton title="SCAN NEXT TICKET" onPress={() => router.replace('/(tabs)/scanner')} variant="accent" />
          </View>

          <Text style={s.footer}>INCIDENT REFERENCE: DUP-{Date.now().toString(36).toUpperCase()}</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: COLORS.accent, ...SHADOW.glowAccent },
  content: { flex: 1 },
  statusSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  iconWrap: { marginBottom: SPACING.md, alignItems: 'center', justifyContent: 'center' },
  glowRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: COLORS.accent, ...SHADOW.glowAccent },
  warnIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,122,0,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.accent },
  warnText: { fontSize: 36, color: COLORS.accent, fontWeight: '900' },
  title: { fontSize: FONT_SIZE.hero, fontWeight: '900', color: COLORS.accent, letterSpacing: 8, textAlign: 'center' },
  sub: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 3, marginTop: SPACING.xs },
  cardWrap: { paddingHorizontal: SPACING.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  ticketId: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '700', letterSpacing: 2 },
  row: { paddingVertical: SPACING.md },
  label: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 3, marginBottom: SPACING.xs },
  value: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '800', letterSpacing: 2 },
  divider: { height: 1, backgroundColor: COLORS.cardBorder },
  timestampBadge: { backgroundColor: 'rgba(255,122,0,0.12)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: 'rgba(255,122,0,0.3)', alignSelf: 'flex-start' },
  timestampText: { color: COLORS.accent, fontSize: FONT_SIZE.md, fontWeight: '800', letterSpacing: 1 },
  statusVal: { color: COLORS.accentSoft, fontSize: FONT_SIZE.md, fontWeight: '700', letterSpacing: 1 },
  buttons: { marginTop: SPACING.xl },
  footer: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '600', letterSpacing: 2, textAlign: 'center', marginTop: SPACING.lg, opacity: 0.5 },
});
