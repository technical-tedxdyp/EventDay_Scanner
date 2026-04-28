import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '@/utils/theme';

type StatusBadgeProps = {
  label: string;
  color?: string;
  pulse?: boolean;
};

export function StatusBadge({
  label,
  color = COLORS.primary,
  pulse = true,
}: StatusBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse, pulseAnim]);

  return (
    <View style={styles.badge}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, opacity: pulseAnim },
        ]}
      />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 59, 0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.round,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 59, 0.15)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
