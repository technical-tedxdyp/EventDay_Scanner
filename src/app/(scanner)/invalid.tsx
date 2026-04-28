import { GlassCard } from '@/components/GlassCard';
import { NeonButton } from '@/components/NeonButton';
import { COLORS, FONT_SIZE, SHADOW, SPACING } from '@/utils/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function InvalidScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reason: string }>();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const warningPulse = useRef(new Animated.Value(0.02)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
    ]).start(() => {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(warningPulse, { toValue: 0.08, duration: 1500, useNativeDriver: true }),
        Animated.timing(warningPulse, { toValue: 0.02, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[s.container, { paddingTop: Math.max(insets.top, 40), paddingBottom: Math.max(insets.bottom, 20) }]}>
      <Animated.View style={[s.dangerOverlay, { opacity: warningPulse }]} />
      <View style={s.stripe} />
      <View style={[s.stripe, s.stripeBot]} />
      <Animated.View style={[s.content, { opacity: fadeIn, transform: [{ translateX: shakeAnim }] }]}>
        <View style={s.statusSection}>
          <Animated.View style={[s.iconWrap, { transform: [{ scale: iconScale }] }]}>
            <View style={s.xIcon}><Text style={s.xText}>✕</Text></View>
          </Animated.View>
          <Text style={s.title}>INVALID</Text>
          <Text style={s.sub}>ACCESS DENIED</Text>
        </View>
        <View style={s.cardWrap}>
          <GlassCard glowIntensity="strong">
            <Text style={s.reasonLabel}>⚠ DENIAL REASON</Text>
            <Text style={s.reasonText}>{params.reason || 'TICKET VALIDATION FAILED'}</Text>
            <View style={s.notice}>
              <Text style={s.noticeText}>SECURITY PROTOCOL ENGAGED — INCIDENT LOGGED</Text>
            </View>
          </GlassCard>
        </View>
        <View style={s.buttons}>
          <NeonButton title="SCAN AGAIN" onPress={() => router.replace('/(tabs)/scanner')} />
          <View style={{ height: SPACING.md }} />
          <NeonButton title="FORCE ALLOW ENTRY" onPress={() => router.replace('/(tabs)/scanner')} variant="secondary" />
          <Text style={s.note}>FORCE ENTRY WILL BE FLAGGED FOR REVIEW</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  dangerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.primaryGlow },
  stripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: COLORS.primary, ...SHADOW.glow },
  stripeBot: { top: undefined, bottom: 0 },
  content: { flex: 1 },
  statusSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  iconWrap: { marginBottom: SPACING.md, ...SHADOW.glow },
  xIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,0,0,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.primaryGlow },
  xText: { fontSize: 36, color: COLORS.primaryGlow, fontWeight: '900' },
  title: { fontSize: FONT_SIZE.mega, fontWeight: '900', color: COLORS.primaryGlow, letterSpacing: 12 },
  sub: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.accentSoft, letterSpacing: 4, marginTop: SPACING.xs },
  cardWrap: { paddingHorizontal: SPACING.lg },
  reasonLabel: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 3, marginBottom: SPACING.md },
  reasonText: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '700', letterSpacing: 1, lineHeight: 24 },
  notice: { marginTop: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  noticeText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 2 },
  buttons: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, alignItems: 'center' },
  note: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '600', letterSpacing: 1, marginTop: SPACING.md, textAlign: 'center', opacity: 0.6 },
});
