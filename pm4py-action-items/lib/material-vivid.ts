/**
 * Material Vivid Design System for Townin
 * Google Material You 3 (M3) 디자인 시스템 + Townin 브랜드 색상
 */

// ============================================
// M3 Design Tokens - Townin Edition
// ============================================

export const colors = {
  light: {
    // Townin Primary (Emerald accent)
    primary: '#13ecb6',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E0F7F2',
    onPrimaryContainer: '#004D3D',
    primaryRgb: '19, 236, 182',

    // Townin Surfaces (Light theme from Image #1)
    bgBase: '#0A1612',        // Dark teal background
    bgContainer: '#132822',    // Slightly lighter dark teal
    bgContainerRgb: '19, 40, 34',
    surface: '#1A3530',        // Card background
    surfaceVariant: '#1F4038',  // Elevated surface
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#A8C7BC',

    // Supporting colors
    secondary: '#8BC9BA',
    onSecondary: '#0A1612',
    tertiary: '#10cfa0',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A8C7BC',
    textTertiary: '#7A9B8F',

    // Borders & Outlines
    outline: '#2A4C42',
    outlineVariant: '#1F4038',
  },
  dark: {
    // Same as light for this dark-themed app
    primary: '#13ecb6',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E0F7F2',
    onPrimaryContainer: '#004D3D',
    primaryRgb: '19, 236, 182',

    bgBase: '#0A1612',
    bgContainer: '#132822',
    bgContainerRgb: '19, 40, 34',
    surface: '#1A3530',
    surfaceVariant: '#1F4038',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#A8C7BC',

    secondary: '#8BC9BA',
    onSecondary: '#0A1612',
    tertiary: '#10cfa0',

    textPrimary: '#FFFFFF',
    textSecondary: '#A8C7BC',
    textTertiary: '#7A9B8F',

    outline: '#2A4C42',
    outlineVariant: '#1F4038',
  },
};

// ============================================
// Motion System
// ============================================

export const easings = {
  standard: [0.2, 0, 0, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
  decelerate: [0, 0, 0, 1] as const,
  accelerate: [0.3, 0, 1, 1] as const,
};

export const durations = {
  short: 150,
  medium: 300,
  long: 500,
};

// ============================================
// State Layer Utilities
// ============================================

export const stateLayerOpacity = {
  hover: 0.08,
  focus: 0.10,
  press: 0.12,
  drag: 0.16,
};

// ============================================
// Surface Tint Levels
// ============================================

export const surfaceTint = {
  level0: 0,     // Base surface
  level1: 0.05,  // Slightly elevated
  level2: 0.08,  // Elevated cards
  level3: 0.11,  // Dialogs, modals
  level4: 0.12,  // Menus, tooltips
  level5: 0.14,  // App bar (scrolled)
};

// ============================================
// Typography Scale
// ============================================

export const typography = {
  displayLarge: {
    fontSize: '57px',
    lineHeight: '64px',
    fontWeight: 400,
  },
  displayMedium: {
    fontSize: '45px',
    lineHeight: '52px',
    fontWeight: 400,
  },
  displaySmall: {
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: 400,
  },
  headlineLarge: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 600,
  },
  headlineMedium: {
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: 600,
  },
  headlineSmall: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 600,
  },
  titleLarge: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 500,
  },
  titleMedium: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 600,
  },
  titleSmall: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 600,
  },
  bodyLarge: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
  },
  bodyMedium: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
  },
  bodySmall: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
  },
  labelLarge: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
  },
  labelMedium: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
  },
  labelSmall: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
  },
};

// ============================================
// Helper Functions
// ============================================

export function getSurfaceColor(level: 0 | 1 | 2 | 3 | 4 | 5 = 1, isDark = true) {
  const theme = isDark ? colors.dark : colors.light;
  const tint = surfaceTint[`level${level}`];

  return {
    backgroundColor: theme.bgContainer,
    backgroundImage: `linear-gradient(
      rgba(${theme.primaryRgb}, ${tint}),
      rgba(${theme.primaryRgb}, ${tint})
    )`,
  };
}

export function getStateLayerColor(variant: 'primary' | 'surface' = 'primary') {
  return variant === 'primary'
    ? 'rgba(255, 255, 255, var(--state-opacity, 0))'
    : 'rgba(19, 236, 182, var(--state-opacity, 0))';
}
