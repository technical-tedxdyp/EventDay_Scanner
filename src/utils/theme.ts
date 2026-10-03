export const COLORS = {
  background: '#f4f3ed',
  surface: '#f4f3ed',
  card: '#f4f3ed',
  cardBorder: '#0a0a0a',
  cardGlow: '#ff3300',

  primary: '#ff3300',
  primaryDark: '#ff3300',
  primaryGlow: '#ff3300',
  accent: '#f4f3ed',
  accentSoft: '#f4f3ed',

  foreground: '#ededed',
  text: '#0a0a0a',
  textSecondary: '#0a0a0a',
  textMuted: '#0a0a0a',
  textDanger: '#ff3300',

  inputBg: '#f4f3ed',
  inputBorder: '#0a0a0a',
  inputBorderFocus: '#ff3300',

  overlay: '#f4f3ed',
  scannerFrame: '#f4f3ed',

  success: '#ff3300',
  warning: '#ff3300',
  danger: '#ff3300',

  gradientStart: '#f4f3ed',
  gradientMid: '#f4f3ed',
  gradientEnd: '#f4f3ed',
  dark: '#0a0a0a',
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
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  "2xl": 30,
  round: 999,
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  xxl: 28,
  hero: 42,
  mega: 56,
} as const;

export const FONT_FAMILY = {
  sans: 'SpaceGrotesk',
  pixel: 'VT323',
} as const;

export const SHADOW = {
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.75,
    shadowRadius: 0,
    elevation: 4,
  },
  glowSubtle: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 3,
  },
  glowAccent: {
    shadowColor: COLORS.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
    elevation: 3,
  },
  cardShadow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
    elevation: 4,
  },
  button: {
    shadowColor: COLORS.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 4,
  },
} as const;
