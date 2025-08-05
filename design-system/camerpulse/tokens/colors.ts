/**
 * CamerPulse Color System
 * 
 * Based on Cameroon's national flag colors with CamerPulse brand enhancements:
 * - Primary: CamerPulse Red (#B9121B) 
 * - Secondary: National Green (#1F7D2C)
 * - Accent: Pulse Yellow for actions and highlights
 * - Supporting palette for semantic colors
 */

export const colors = {
  // Brand Colors (CamerPulse specific)
  brand: {
    primary: {
      DEFAULT: '#B9121B', // CamerPulse Red
      50: '#FEF2F2',
      100: '#FEE2E2', 
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C', // CamerPulse Red
      800: '#991B1B',
      900: '#7F1D1D',
      950: '#450A0A'
    },
    secondary: {
      DEFAULT: '#1F7D2C', // National Green
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D', // National Green
      800: '#166534',
      900: '#14532D',
      950: '#052E16'
    },
    accent: {
      DEFAULT: '#F59E0B', // Pulse Yellow
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B', // Pulse Yellow
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03'
    }
  },

  // Cameroon Flag Colors (Exact)
  cameroon: {
    green: '#007E33',
    red: '#C8102E', 
    yellow: '#FFD700'
  },

  // Semantic Colors
  semantic: {
    success: {
      DEFAULT: '#10B981',
      light: '#D1FAE5',
      dark: '#047857'
    },
    warning: {
      DEFAULT: '#F59E0B',
      light: '#FEF3C7',
      dark: '#D97706'
    },
    error: {
      DEFAULT: '#EF4444',
      light: '#FEE2E2',
      dark: '#DC2626'
    },
    info: {
      DEFAULT: '#3B82F6',
      light: '#DBEAFE',
      dark: '#1D4ED8'
    }
  },

  // Neutral Colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712'
  },

  // Surface Colors
  surface: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    muted: '#F9FAFB',
    border: '#E5E7EB',
    divider: '#F3F4F6'
  }
} as const;

export const colorTokens = {
  // CSS Custom Properties for dynamic theming
  primary: 'hsl(var(--primary))',
  'primary-foreground': 'hsl(var(--primary-foreground))',
  secondary: 'hsl(var(--secondary))',
  'secondary-foreground': 'hsl(var(--secondary-foreground))',
  accent: 'hsl(var(--accent))',
  'accent-foreground': 'hsl(var(--accent-foreground))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  'card-foreground': 'hsl(var(--card-foreground))',
  muted: 'hsl(var(--muted))',
  'muted-foreground': 'hsl(var(--muted-foreground))',
  border: 'hsl(var(--border))',
  destructive: 'hsl(var(--destructive))',
  'destructive-foreground': 'hsl(var(--destructive-foreground))'
} as const;

export type ColorToken = keyof typeof colorTokens;
export type BrandColor = keyof typeof colors.brand;
export type SemanticColor = keyof typeof colors.semantic;