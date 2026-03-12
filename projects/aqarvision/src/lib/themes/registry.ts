/**
 * Theme Registry — Système de thèmes structurels pour AqarVision
 *
 * Chaque thème est un vrai template complet avec structure de page,
 * variants de sections et styles différents.
 */

import type { AgencyPlan } from '@/types/database';

// === Section Variants ===

export type HeroVariant =
  | 'hero-short'       // minimal: court avec barre de recherche
  | 'hero-medium'      // modern: moyen avec image + CTA
  | 'hero-editorial'   // professional: texte + stats
  | 'hero-fullwidth'   // editorial: pleine largeur image
  | 'hero-overlay'     // premium: grande image overlay sombre
  | 'hero-fullscreen'  // luxury: fullscreen vidéo/image
  | 'hero-asymmetric'; // bold: asymétrique

export type PropertiesVariant =
  | 'properties-grid'       // grille 3 colonnes standard
  | 'properties-featured'   // biens mis en avant + grille
  | 'properties-editorial'  // mise en page alternée image/texte
  | 'properties-premium';   // cartes premium avec hover effects

export type AboutVariant =
  | 'about-simple'     // aperçu court avec lien
  | 'about-prominent'  // section proéminente avec stats
  | 'about-luxury';    // style luxury avec info cards

export type CtaVariant =
  | 'cta-banner'  // bannière CTA couleur pleine
  | 'cta-card';   // carte CTA centrée

export type HeaderVariant =
  | 'header-standard'  // header classique avec nav
  | 'header-luxury'    // header glassmorphism
  | 'header-minimal';  // header minimaliste

export type FooterVariant =
  | 'footer-standard'  // footer classique 4 colonnes
  | 'footer-luxury';   // footer luxury 3 colonnes

export type SectionVariant =
  | HeroVariant
  | PropertiesVariant
  | AboutVariant
  | CtaVariant;

// === Section Definition ===

export type SectionId = 'hero' | 'properties' | 'about' | 'cta' | 'social';

export interface ThemeSection {
  id: SectionId;
  variant: SectionVariant;
  order: number;
}

// === Style Tokens ===

export interface ThemeStyleTokens {
  fontFamily: 'modern' | 'classic' | 'elegant';
  borderStyle: 'rounded' | 'square';
  themeMode: 'light' | 'dark';
  /** Couleurs par défaut du thème (override par branding agence) */
  defaultColors: {
    primary: string;
    accent: string;
    secondary: string;
  };
}

// === Layout Config ===

export interface ThemeLayoutConfig {
  header: HeaderVariant;
  footer: FooterVariant;
}

// === Theme Manifest ===

export type ThemeId =
  | 'minimal'
  | 'modern'
  | 'professional'
  | 'editorial'
  | 'premium'
  | 'luxury'
  | 'bold';

export interface ThemeManifest {
  id: ThemeId;
  name: { fr: string; ar: string; en: string };
  description: { fr: string; ar: string; en: string };
  planMin: AgencyPlan;
  sections: ThemeSection[];
  layout: ThemeLayoutConfig;
  style: ThemeStyleTokens;
}

// === Plan Hierarchy ===

const PLAN_HIERARCHY: Record<AgencyPlan, number> = {
  starter: 0,
  pro: 1,
  enterprise: 2,
};

// === Theme Registry ===

export const THEME_REGISTRY: Record<ThemeId, ThemeManifest> = {
  minimal: {
    id: 'minimal',
    name: { fr: 'Minimal', ar: 'بسيط', en: 'Minimal' },
    description: {
      fr: 'Épuré, lignes nettes, simplicité maximale',
      ar: 'بسيط وأنيق',
      en: 'Clean, sharp lines, maximum simplicity',
    },
    planMin: 'starter',
    sections: [
      { id: 'hero', variant: 'hero-short', order: 0 },
      { id: 'properties', variant: 'properties-grid', order: 1 },
      { id: 'about', variant: 'about-simple', order: 2 },
      { id: 'cta', variant: 'cta-banner', order: 3 },
      { id: 'social', variant: 'cta-banner', order: 4 },
    ],
    layout: { header: 'header-minimal', footer: 'footer-standard' },
    style: {
      fontFamily: 'modern',
      borderStyle: 'square',
      themeMode: 'light',
      defaultColors: { primary: '#18181b', accent: '#18181b', secondary: '#fafafa' },
    },
  },

  modern: {
    id: 'modern',
    name: { fr: 'Moderne', ar: 'عصري', en: 'Modern' },
    description: {
      fr: 'Contemporain, couleurs vives, dynamique',
      ar: 'عصري وديناميكي',
      en: 'Contemporary, vibrant colors, dynamic',
    },
    planMin: 'starter',
    sections: [
      { id: 'hero', variant: 'hero-medium', order: 0 },
      { id: 'properties', variant: 'properties-featured', order: 1 },
      { id: 'about', variant: 'about-simple', order: 2 },
      { id: 'cta', variant: 'cta-card', order: 3 },
      { id: 'social', variant: 'cta-banner', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: {
      fontFamily: 'modern',
      borderStyle: 'rounded',
      themeMode: 'light',
      defaultColors: { primary: '#111827', accent: '#6366f1', secondary: '#f3f4f6' },
    },
  },

  professional: {
    id: 'professional',
    name: { fr: 'Professionnel', ar: 'مهني', en: 'Professional' },
    description: {
      fr: 'Institutionnel, sérieux, crédible',
      ar: 'مؤسسي وجدي',
      en: 'Institutional, serious, credible',
    },
    planMin: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-editorial', order: 0 },
      { id: 'about', variant: 'about-prominent', order: 1 },
      { id: 'properties', variant: 'properties-grid', order: 2 },
      { id: 'cta', variant: 'cta-banner', order: 3 },
      { id: 'social', variant: 'cta-banner', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: {
      fontFamily: 'classic',
      borderStyle: 'rounded',
      themeMode: 'light',
      defaultColors: { primary: '#0c1b2a', accent: '#2563eb', secondary: '#e2e8f0' },
    },
  },

  editorial: {
    id: 'editorial',
    name: { fr: 'Éditorial', ar: 'تحريري', en: 'Editorial' },
    description: {
      fr: 'Magazine immobilier, mise en page alternée',
      ar: 'مجلة عقارية',
      en: 'Real estate magazine, alternating layout',
    },
    planMin: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-fullwidth', order: 0 },
      { id: 'properties', variant: 'properties-editorial', order: 1 },
      { id: 'about', variant: 'about-simple', order: 2 },
      { id: 'cta', variant: 'cta-card', order: 3 },
      { id: 'social', variant: 'cta-banner', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: {
      fontFamily: 'elegant',
      borderStyle: 'rounded',
      themeMode: 'light',
      defaultColors: { primary: '#1a1a2e', accent: '#c084fc', secondary: '#f5f3ff' },
    },
  },

  premium: {
    id: 'premium',
    name: { fr: 'Premium', ar: 'ممتاز', en: 'Premium' },
    description: {
      fr: 'Haut de gamme sobre, overlay sombre',
      ar: 'راقي ومتقن',
      en: 'Upscale, sober, dark overlay',
    },
    planMin: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-overlay', order: 0 },
      { id: 'properties', variant: 'properties-premium', order: 1 },
      { id: 'about', variant: 'about-prominent', order: 2 },
      { id: 'cta', variant: 'cta-banner', order: 3 },
      { id: 'social', variant: 'cta-banner', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: {
      fontFamily: 'elegant',
      borderStyle: 'rounded',
      themeMode: 'light',
      defaultColors: { primary: '#1b4332', accent: '#52b788', secondary: '#d8f3dc' },
    },
  },

  luxury: {
    id: 'luxury',
    name: { fr: 'Luxe', ar: 'فاخر', en: 'Luxury' },
    description: {
      fr: 'Luxe, animations, fullscreen, compteurs animés',
      ar: 'فاخر مع رسوم متحركة',
      en: 'Luxury, animations, fullscreen, animated counters',
    },
    planMin: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-fullscreen', order: 0 },
      { id: 'properties', variant: 'properties-premium', order: 1 },
      { id: 'about', variant: 'about-luxury', order: 2 },
      { id: 'cta', variant: 'cta-banner', order: 3 },
      { id: 'social', variant: 'cta-banner', order: 4 },
    ],
    layout: { header: 'header-luxury', footer: 'footer-luxury' },
    style: {
      fontFamily: 'elegant',
      borderStyle: 'square',
      themeMode: 'dark',
      defaultColors: { primary: '#1a1a2e', accent: '#d4af37', secondary: '#d4af37' },
    },
  },

  bold: {
    id: 'bold',
    name: { fr: 'Audacieux', ar: 'جريء', en: 'Bold' },
    description: {
      fr: 'Audacieux, créatif, layout non conventionnel',
      ar: 'جريء وإبداعي',
      en: 'Bold, creative, unconventional layout',
    },
    planMin: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-asymmetric', order: 0 },
      { id: 'properties', variant: 'properties-featured', order: 1 },
      { id: 'about', variant: 'about-prominent', order: 2 },
      { id: 'cta', variant: 'cta-card', order: 3 },
      { id: 'social', variant: 'cta-banner', order: 4 },
    ],
    layout: { header: 'header-minimal', footer: 'footer-standard' },
    style: {
      fontFamily: 'modern',
      borderStyle: 'rounded',
      themeMode: 'light',
      defaultColors: { primary: '#7c3aed', accent: '#f59e0b', secondary: '#fef3c7' },
    },
  },
};

// === Utility Functions ===

/** Get all theme IDs */
export const ALL_THEME_IDS = Object.keys(THEME_REGISTRY) as ThemeId[];

/** Get a theme manifest by ID */
export function getThemeManifest(themeId: string): ThemeManifest {
  return THEME_REGISTRY[themeId as ThemeId] || THEME_REGISTRY.modern;
}

/** Get themes available for a given plan */
export function getAvailableThemes(plan: AgencyPlan): ThemeManifest[] {
  const planLevel = PLAN_HIERARCHY[plan] ?? 0;
  return ALL_THEME_IDS
    .map((id) => THEME_REGISTRY[id])
    .filter((theme) => PLAN_HIERARCHY[theme.planMin] <= planLevel);
}

/** Check if a theme is available for a given plan */
export function isThemeAvailable(themeId: string, plan: AgencyPlan): boolean {
  const theme = THEME_REGISTRY[themeId as ThemeId];
  if (!theme) return false;
  return PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[theme.planMin];
}

/** Get the number of themes available per plan */
export const THEMES_PER_PLAN: Record<AgencyPlan, number> = {
  starter: getAvailableThemes('starter').length,   // 2
  pro: getAvailableThemes('pro').length,            // 5
  enterprise: getAvailableThemes('enterprise').length, // 7
};
