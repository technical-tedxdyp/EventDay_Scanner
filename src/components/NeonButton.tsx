import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, SHADOW } from '@/utils/theme';

type NeonButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'accent' | 'success';
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
        ? COLORS.accentSoft
        : variant === 'danger'
          ? COLORS.primaryDark
          : variant === 'success'
            ? COLORS.success
            : COLORS.primary;

  const darkText = variant === 'accent' || variant === 'secondary';
  const visuallyDisabled = disabled && !loading;
  const hasOffsetShadow = variant !== 'secondary' && !visuallyDisabled;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        hasOffsetShadow ? SHADOW.button : null,
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
            backgroundColor: visuallyDisabled ? COLORS.background : bgColor,
            borderColor:
              visuallyDisabled || variant === 'secondary' || darkText
                ? COLORS.dark
                : COLORS.accentSoft,
            borderWidth: 2,
            opacity: visuallyDisabled ? 0.72 : 1,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: darkText ? COLORS.dark : COLORS.foreground },
            textStyle,
            visuallyDisabled && { color: COLORS.dark },
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
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  text: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
