import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '@/utils/theme';

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  compact?: boolean;
  style?: ViewStyle;
};

export function StatCard({ label, value, sub, color = COLORS.primary, compact, style }: StatCardProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      <View style={[styles.accentLine, { backgroundColor: color }]} />
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOW.glowSubtle,
  },
  cardCompact: {
    padding: SPACING.sm + 2,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
  },
  value: {
    fontSize: FONT_SIZE.xxl + 4,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sub: {
    fontSize: FONT_SIZE.xs - 1,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
});
