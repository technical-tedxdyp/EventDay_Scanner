import { GlassCard } from '@/components/GlassCard';
import { InputField } from '@/components/InputField';
import { NeonButton } from '@/components/NeonButton';
import { login } from '@/services/api';
import { APP_NAME } from '@/utils/constants';
import { COLORS, FONT_SIZE, RADIUS, SHADOW, SPACING } from '@/utils/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(-20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(30)).current;
  const scanlineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title entrance
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslate, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Card entrance (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Scanline loop
    Animated.loop(
      Animated.timing(scanlineAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const scanlineTranslate = scanlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-2, Dimensions.get('window').height],
  });

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)/scanner');
    } else {
      setError(result.error ?? 'ACCESS DENIED');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Scanline effect */}
      <Animated.View
        style={[
          styles.scanline,
          { transform: [{ translateY: scanlineTranslate }] },
        ]}
      />

      {/* Grid overlay */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: `${i * 5}%` }]} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslate }],
            },
          ]}
        >
          {/* TEDx Logo */}
          <View style={styles.tedxLogoContainer}>
            <Text style={styles.tedxText}>TED<Text style={styles.tedxTextSmall}>x</Text></Text>
          </View>

          <Text style={styles.title}>{APP_NAME}</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>SCANNER ACCESS</Text>
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>

        {/* Login Card */}
        <Animated.View
          style={{
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslate }],
          }}
        >
          <GlassCard glowIntensity="medium">

            <View style={styles.form}>
              <InputField
                label="OPERATIVE ID"
                icon="👤"
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <InputField
                label="ACCESS CODE"
                icon="🔑"
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <NeonButton
                  title="AUTHORIZE"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                />
              </View>
            </View>


          </GlassCard>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
    zIndex: 10,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.03,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 80,
    paddingBottom: SPACING.xxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  tedxLogoContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 59, 0.3)',
    ...SHADOW.glowSubtle,
  },
  tedxText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: COLORS.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tedxTextSmall: {
    fontSize: 36,
    fontWeight: '700',
  },
  title: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 4,
    marginTop: SPACING.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  dividerText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    letterSpacing: 3,
    marginHorizontal: SPACING.md,
  },
  form: {
    marginTop: SPACING.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 59, 0.1)',
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 59, 0.3)',
  },
  errorIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  errorText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
  },
  buttonContainer: {
    marginTop: SPACING.sm,
  },

  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 2,
  },
  footerTextSmall: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: SPACING.xs,
    opacity: 0.5,
  },
});
