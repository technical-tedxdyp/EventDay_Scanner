import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '@/utils/theme';
import { GlassCard } from '@/components/GlassCard';
import { NeonButton } from '@/components/NeonButton';
import { StatusBadge } from '@/components/StatusBadge';

const VALID_COLORS = {
  primary: '#00FF41', // Neon Green
  primaryGlow: '#34D399',
  bgAccent: 'rgba(0, 255, 65, 0.15)',
};

const { width } = Dimensions.get('window');

export default function ValidScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    holderName: string;
    group: string;
    accessType: string;
    ticketId: string;
  }>();
  const insets = useSafeAreaInsets();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
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

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Card entrance
    setTimeout(() => {
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
  }, []);

  const handleAllowEntry = () => {
    router.replace('/(tabs)/scanner');
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 40), paddingBottom: Math.max(insets.bottom, 20) }]}>
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
          {/* Glow ring */}
          <Animated.View style={[styles.glowRing, { opacity: glowPulse }]} />

          <View style={styles.checkIcon}>
            <Text style={styles.checkText}>✓</Text>
          </View>
          <Text style={styles.statusTitle}>VALID</Text>
          <Text style={styles.statusSub}>ACCESS AUTHORIZED</Text>
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
        <GlassCard glowIntensity="strong" variant="success">
          <View style={styles.cardHeader}>
            <StatusBadge label="VERIFIED" color={VALID_COLORS.primary} />
            <Text style={styles.ticketId}>{params.ticketId || 'TKT-00000'}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TICKET HOLDER</Text>
              <Text style={styles.detailValue}>{params.holderName || 'UNKNOWN'}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRowInline}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>GROUP SIZE</Text>
                <Text style={styles.detailValueLarge}>{params.group || '1'}</Text>
              </View>
              <View style={styles.detailColDivider} />
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>ACCESS TYPE</Text>
                <View style={styles.accessBadge}>
                  <Text style={styles.accessBadgeText}>
                    {params.accessType || 'GENERAL'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>CLEARANCE LEVEL</Text>
              <Text style={styles.detailValue}>
                {params.accessType === 'VIP' ? 'LEVEL 5 — UNRESTRICTED' : 'LEVEL 3 — STANDARD'}
              </Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.buttonSection}>
          <NeonButton title="ALLOW ENTRY" onPress={handleAllowEntry} variant="success" />
        </View>

        <Text style={styles.footerText}>
          ENTRY LOGGED • {new Date().toLocaleTimeString().toUpperCase()}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bgAccent1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: VALID_COLORS.primaryGlow,
    opacity: 0.04,
  },
  bgAccent2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: VALID_COLORS.primary,
    opacity: 0.03,
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  statusContainer: {
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: VALID_COLORS.primary,
    ...SHADOW.glow,
    shadowColor: VALID_COLORS.primaryGlow, // override shadow color
  },
  checkIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: VALID_COLORS.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: VALID_COLORS.primary,
    marginBottom: SPACING.md,
  },
  checkText: {
    fontSize: 36,
    color: VALID_COLORS.primary,
    fontWeight: '900',
  },
  statusTitle: {
    fontSize: FONT_SIZE.mega,
    fontWeight: '900',
    color: VALID_COLORS.primary,
    letterSpacing: 12,
  },
  statusSub: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 4,
    marginTop: SPACING.xs,
  },
  cardSection: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  ticketId: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 2,
  },
  detailsGrid: {
    gap: 0,
  },
  detailRow: {
    paddingVertical: SPACING.md,
  },
  detailRowInline: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
  },
  detailCol: {
    flex: 1,
    alignItems: 'center',
  },
  detailColDivider: {
    width: 1,
    backgroundColor: COLORS.cardBorder,
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    letterSpacing: 2,
  },
  detailValueLarge: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    letterSpacing: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  accessBadge: {
    backgroundColor: VALID_COLORS.bgAccent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: VALID_COLORS.primary,
    marginTop: SPACING.xs,
  },
  accessBadgeText: {
    color: VALID_COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    letterSpacing: 3,
  },
  buttonSection: {
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
