import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  type TextInputProps,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, SHADOW } from '@/utils/theme';

type InputFieldProps = TextInputProps & {
  label: string;
  icon?: string;
};

export function InputField({
  label,
  icon,
  style,
  secureTextEntry,
  ...props
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.inputBorderFocus],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.inputWrapper,
          { borderColor },
          isFocused && SHADOW.glowSubtle,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Hide access code' : 'Show access code'
            }
            accessibilityState={{ selected: isPasswordVisible }}
            hitSlop={8}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            style={styles.visibilityToggle}
          >
            <View style={styles.eye}>
              <View style={styles.eyePupil} />
              {!isPasswordVisible && <View style={styles.eyeSlash} />}
            </View>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONT_FAMILY.pixel,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 0,
    borderWidth: 2,
    paddingHorizontal: SPACING.md,
  },
  icon: {
    fontSize: FONT_SIZE.xl,
    marginRight: SPACING.sm,
  },
  input: {
    fontFamily: FONT_FAMILY.sans,
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '500',
    paddingVertical: SPACING.md,
    letterSpacing: 0.3,
  },
  visibilityToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  eye: {
    width: 20,
    height: 14,
    borderWidth: 1.8,
    borderColor: COLORS.textSecondary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
  },
  eyeSlash: {
    position: 'absolute',
    width: 23,
    height: 2,
    backgroundColor: COLORS.textSecondary,
    transform: [{ rotate: '-38deg' }],
  },
});
