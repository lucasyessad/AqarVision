/**
 * Theme System — Point d'entrée
 *
 * Re-exporte le registre de thèmes et conserve la logique
 * de résolution de couleurs pour rétrocompatibilité.
 */

export {
  THEME_REGISTRY,
  ALL_THEME_IDS,
  getThemeManifest,
  getAvailableThemes,
  isThemeAvailable,
  THEMES_PER_PLAN,
} from './registry';

export type {
  ThemeId,
  ThemeManifest,
  ThemeSection,
  ThemeStyleTokens,
  ThemeLayoutConfig,
  SectionId,
  SectionVariant,
  HeroVariant,
  PropertiesVariant,
  AboutVariant,
  CtaVariant,
  HeaderVariant,
  FooterVariant,
} from './registry';

// === Color Resolution (legacy compat) ===

export interface ThemeColors {
  primary: string;
  accent: string;
  accentForeground: string;
}

/** Determine if a hex color is light */
export function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

// Old predefined theme colors (for [locale]/[agence] vitrine compat)
const LEGACY_THEME_COLORS: Record<string, { primary: string; accent: string }> = {
  classique: { primary: '#0c1b2a', accent: '#b8963e' },
  moderne: { primary: '#18181b', accent: '#3b82f6' },
  elegant: { primary: '#1e1b4b', accent: '#c084fc' },
  nature: { primary: '#14332b', accent: '#34d399' },
  ocean: { primary: '#0c4a6e', accent: '#22d3ee' },
  terracotta: { primary: '#292524', accent: '#ea580c' },
};

/**
 * Resolve theme colors.
 * Supports both:
 *  - Legacy: resolveThemeColors(themeId, customPrimary?, customAccent?)
 *  - New:    resolveThemeColors(primaryColor, accentColor?)
 */
export function resolveThemeColors(
  primaryOrThemeId: string,
  accentOrCustomPrimary?: string | null,
  customAccent?: string | null,
): ThemeColors {
  // Legacy 3-arg form: resolveThemeColors('classique', customPrimary, customAccent)
  if (customAccent !== undefined || primaryOrThemeId in LEGACY_THEME_COLORS) {
    const legacy = LEGACY_THEME_COLORS[primaryOrThemeId];
    if (primaryOrThemeId === 'custom' && accentOrCustomPrimary && customAccent) {
      const accent = customAccent;
      return {
        primary: accentOrCustomPrimary,
        accent,
        accentForeground: isLightColor(accent) ? '#1a1a1a' : '#ffffff',
      };
    }
    if (legacy) {
      return {
        primary: legacy.primary,
        accent: legacy.accent,
        accentForeground: isLightColor(legacy.accent) ? '#1a1a1a' : '#ffffff',
      };
    }
  }

  // New 2-arg form: resolveThemeColors(primaryColor, accentColor?)
  const primary = primaryOrThemeId;
  const accent = accentOrCustomPrimary || primary;
  return {
    primary,
    accent,
    accentForeground: isLightColor(accent) ? '#1a1a1a' : '#ffffff',
  };
}

/** CSS variables to inject in the vitrine wrapper */
export function themeToCSSVars(
  primaryColor: string,
  accentColor?: string | null,
  secondaryColor?: string | null,
): Record<string, string> {
  return {
    '--agency-primary': primaryColor,
    '--agency-accent': accentColor || primaryColor,
    '--agency-secondary': secondaryColor || '#e2e8f0',
  };
}
