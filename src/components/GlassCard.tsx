import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOW } from '@/utils/theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  glowIntensity?: 'subtle' | 'medium' | 'strong';
  variant?: 'primary' | 'success';
};

export function GlassCard({ children, style, glowIntensity = 'medium', variant = 'primary' }: GlassCardProps) {
  const isSuccess = variant === 'success';
  const glowStyle =
    glowIntensity === 'strong'
      ? isSuccess ? { ...SHADOW.glow, shadowColor: '#34D399' } : SHADOW.glow
      : glowIntensity === 'subtle'
        ? isSuccess ? { ...SHADOW.glowSubtle, shadowColor: '#34D399' } : SHADOW.glowSubtle
        : isSuccess ? { ...SHADOW.cardShadow, shadowColor: '#34D399' } : SHADOW.cardShadow;

  return (
    <View style={[styles.outerGlow, glowStyle]}>
      <View style={[styles.card, isSuccess && { borderColor: 'rgba(0, 255, 65, 0.15)' }, style]}>
        <View style={[styles.borderGlow, isSuccess && { backgroundColor: '#00FF41' }]} />
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
