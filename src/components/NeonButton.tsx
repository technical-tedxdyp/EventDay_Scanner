import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE, SHADOW } from '@/utils/theme';

type NeonButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'accent';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
};

export function NeonButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  loading = false,
}: NeonButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const bgColor =
    variant === 'secondary'
      ? 'transparent'
      : variant === 'accent'
        ? COLORS.accent
        : variant === 'danger'
          ? COLORS.primaryDark
          : COLORS.primary;

  const borderColor =
    variant === 'secondary' ? COLORS.primary : 'transparent';

  const glowShadow =
    variant === 'accent' ? SHADOW.glowAccent : SHADOW.glow;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        disabled ? null : glowShadow,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor: disabled ? COLORS.textMuted : bgColor,
            borderColor,
            borderWidth: variant === 'secondary' ? 1.5 : 0,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            variant === 'secondary' && { color: COLORS.primary },
            disabled && { color: COLORS.background },
            textStyle,
          ]}
        >
          {loading ? 'PROCESSING...' : title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  text: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
