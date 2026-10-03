import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, SPACING } from '@/utils/theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  glowIntensity?: 'subtle' | 'medium' | 'strong';
  variant?: 'primary' | 'success';
};

export function GlassCard({ children, style, glowIntensity = 'medium', variant = 'primary' }: GlassCardProps) {
  const isSuccess = variant === 'success';
  const isHighlighted = glowIntensity !== 'subtle';

  return (
    <View style={styles.outerGlow}>
      {isHighlighted && <View pointerEvents="none" style={styles.shadowBlock} />}
      <View
        style={[
          styles.card,
          !isHighlighted && styles.cardSubtle,
          isSuccess && styles.cardSuccess,
          style,
        ]}
      >
        {/* {isHighlighted && (
          <View
            style={[
              styles.cornerAccent,
              isSuccess && { backgroundColor: COLORS.success },
            ]}
          />
        )} */}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerGlow: {
    position: 'relative',
  },
  shadowBlock: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: 5,
    bottom: 5,
    backgroundColor: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 0,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
    position: 'relative',
  },
  cardSubtle: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.dark,
  },
  cardSuccess: {
    borderColor: COLORS.primary,
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: COLORS.primary,
  },
});
