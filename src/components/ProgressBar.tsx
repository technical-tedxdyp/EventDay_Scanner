import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '@/utils/theme';

type ProgressBarProps = {
  label: string;
  percentage: number;
  color?: string;
  showValue?: boolean;
};

export function ProgressBar({ label, percentage, color = COLORS.primary, showValue = true }: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.min(Math.max(percentage, 0), 100),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showValue && <Text style={[styles.value, { color }]}>{percentage.toFixed(1)}%</Text>}
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth,
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 8,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    letterSpacing: 1,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,59,59,0.08)',
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.round,
  },
});
