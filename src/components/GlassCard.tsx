import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOW } from '@/utils/theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  glowIntensity?: 'subtle' | 'medium' | 'strong';
};

export function GlassCard({ children, style, glowIntensity = 'medium' }: GlassCardProps) {
  const glowStyle =
    glowIntensity === 'strong'
      ? SHADOW.glow
      : glowIntensity === 'subtle'
        ? SHADOW.glowSubtle
        : SHADOW.cardShadow;

  return (
    <View style={[styles.outerGlow, glowStyle]}>
      <View style={[styles.card, style]}>
        <View style={styles.borderGlow} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerGlow: {
    borderRadius: RADIUS.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
});
