export const COLORS = {
  background: '#000000',
  surface: '#0A0A0A',
  card: '#111111',
  cardBorder: 'rgba(255, 59, 59, 0.15)',
  cardGlow: 'rgba(255, 0, 0, 0.25)',

  primary: '#E51A1A',
  primaryDark: '#B30000',
  primaryGlow: '#FF1A1A',
  accent: '#FF7A00',
  accentSoft: '#FF6B6B',
  
  text: '#F5F5F5',
  textSecondary: '#B3B3B3',
  textMuted: '#666666',
  textDanger: '#FF3B3B',

  inputBg: '#111111',
  inputBorder: 'rgba(255, 59, 59, 0.3)',
  inputBorderFocus: 'rgba(255, 59, 59, 0.7)',

  overlay: 'rgba(0, 0, 0, 0.6)',
  scannerFrame: '#FF3B3B',
  
  success: '#FF3B3B', // Red-themed "success" — intentionally NOT green
  warning: '#FF7A00',
  danger: '#FF0000',

  gradientStart: '#140000',
  gradientMid: '#2A0000',
  gradientEnd: '#000000',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  hero: 42,
  mega: 56,
} as const;

export const SHADOW = {
  glow: {
    shadowColor: COLORS.primaryGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  glowSubtle: {
    shadowColor: COLORS.primaryGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  glowAccent: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 12,
  },
  cardShadow: {
    shadowColor: COLORS.primaryGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;
