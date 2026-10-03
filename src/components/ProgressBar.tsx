import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from '@/utils/theme';

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
    fontFamily: FONT_FAMILY.pixel,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: FONT_FAMILY.sans,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    letterSpacing: 1,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.cardBorder,
    borderRadius: 0,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 0,
  },
});
