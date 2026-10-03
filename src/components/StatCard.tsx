import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from '@/utils/theme';

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
    <View style={[styles.shadow, style]}>
      <View style={[styles.card, compact && styles.cardCompact]}>
        <View style={[styles.accentLine, { backgroundColor: color }]} />
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 0,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.dark,
    position: 'relative',
    overflow: 'hidden',
  },
  cardCompact: {
    padding: SPACING.sm + 2,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    opacity: 1,
  },
  value: {
    fontFamily: FONT_FAMILY.sans,
    fontSize: FONT_SIZE.xxl + 4,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  label: {
    fontFamily: FONT_FAMILY.pixel,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sub: {
    fontFamily: FONT_FAMILY.pixel,
    fontSize: FONT_SIZE.xs - 1,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
});
