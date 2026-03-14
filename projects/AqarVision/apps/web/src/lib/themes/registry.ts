/**
 * ThemeManifest registry for AqarVision agency storefronts.
 *
 * Each theme defines the visual identity, section layout, and default colors
 * for an agency's public showcase page (/a/[slug]).
 *
 * Plan gating:
 *   - null  → available to all plans (including starter / no subscription)
 *   - "pro" → requires Pro plan or higher
 *   - "enterprise" → requires Enterprise plan
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ThemeSection = {
  id: string
  variant: string
  order: number
  props?: Record<string, unknown>
}

export type ThemeManifest = {
  id: string
  name: string
  plan: 'starter' | 'pro' | 'enterprise' | null
  sections: ThemeSection[]
  layout: {
    header: 'header-standard' | 'header-luxury' | 'header-minimal'
    footer: 'footer-standard' | 'footer-minimal'
  }
  style: {
    fontFamily: 'modern' | 'classic' | 'elegant'
    borderStyle: 'rounded' | 'sharp' | 'soft'
    themeMode: 'light' | 'dark'
    spacing: 'compact' | 'normal' | 'spacious'
  }
  defaultColors: {
    primary: string
    accent: string
    secondary: string
  }
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const THEME_REGISTRY: ThemeManifest[] = [
  // ── minimal (all plans) ───────────────────────────────────────────────────
  {
    id: 'minimal',
    name: 'Minimal',
    plan: null,
    sections: [
      { id: 'hero', variant: 'hero-short', order: 1 },
      { id: 'listings', variant: 'listings-grid', order: 2 },
      { id: 'cta', variant: 'cta-simple', order: 3 },
    ],
    layout: {
      header: 'header-minimal',
      footer: 'footer-minimal',
    },
    style: {
      fontFamily: 'modern',
      borderStyle: 'sharp',
      themeMode: 'light',
      spacing: 'compact',
    },
    defaultColors: {
      primary: '#1a1a1a',
      accent: '#e5e5e5',
      secondary: '#666666',
    },
  },

  // ── modern (all plans) ────────────────────────────────────────────────────
  {
    id: 'modern',
    name: 'Modern',
    plan: null,
    sections: [
      { id: 'hero', variant: 'hero-medium', order: 1 },
      { id: 'about', variant: 'about-standard', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'cta', variant: 'cta-card', order: 4 },
    ],
    layout: {
      header: 'header-standard',
      footer: 'footer-standard',
    },
    style: {
      fontFamily: 'modern',
      borderStyle: 'rounded',
      themeMode: 'light',
      spacing: 'normal',
    },
    defaultColors: {
      primary: '#4338ca',
      accent: '#fbbf24',
      secondary: '#6366f1',
    },
  },

  // ── professional (pro) ────────────────────────────────────────────────────
  {
    id: 'professional',
    name: 'Professional',
    plan: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-editorial', order: 1 },
      { id: 'about', variant: 'about-standard', order: 2 },
      { id: 'listings', variant: 'listings-masonry', order: 3 },
      { id: 'team', variant: 'team-cards', order: 4 },
      { id: 'cta', variant: 'cta-card', order: 5 },
    ],
    layout: {
      header: 'header-standard',
      footer: 'footer-standard',
    },
    style: {
      fontFamily: 'classic',
      borderStyle: 'soft',
      themeMode: 'light',
      spacing: 'normal',
    },
    defaultColors: {
      primary: '#1e3a5f',
      accent: '#c9a227',
      secondary: '#2d5a8e',
    },
  },

  // ── editorial (pro) ───────────────────────────────────────────────────────
  {
    id: 'editorial',
    name: 'Editorial',
    plan: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-fullwidth', order: 1 },
      { id: 'about', variant: 'about-editorial', order: 2 },
      { id: 'listings', variant: 'listings-editorial', order: 3 },
      { id: 'stats', variant: 'stats-strip', order: 4 },
      { id: 'cta', variant: 'cta-banner', order: 5 },
    ],
    layout: {
      header: 'header-standard',
      footer: 'footer-standard',
    },
    style: {
      fontFamily: 'elegant',
      borderStyle: 'sharp',
      themeMode: 'dark',
      spacing: 'spacious',
    },
    defaultColors: {
      primary: '#1a1a2e',
      accent: '#e94560',
      secondary: '#16213e',
    },
  },

  // ── premium (pro) ─────────────────────────────────────────────────────────
  {
    id: 'premium',
    name: 'Premium',
    plan: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-overlay', order: 1 },
      { id: 'about', variant: 'about-standard', order: 2 },
      { id: 'listings', variant: 'listings-premium', order: 3 },
      { id: 'testimonials', variant: 'testimonials-cards', order: 4 },
      { id: 'cta', variant: 'cta-card', order: 5 },
    ],
    layout: {
      header: 'header-standard',
      footer: 'footer-standard',
    },
    style: {
      fontFamily: 'modern',
      borderStyle: 'rounded',
      themeMode: 'light',
      spacing: 'spacious',
    },
    defaultColors: {
      primary: '#1b4332',
      accent: '#52b788',
      secondary: '#2d6a4f',
    },
  },

  // ── luxury (enterprise) ───────────────────────────────────────────────────
  {
    id: 'luxury',
    name: 'Luxury',
    plan: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-fullscreen', order: 1 },
      { id: 'about', variant: 'about-luxury', order: 2 },
      { id: 'listings', variant: 'listings-premium', order: 3 },
      { id: 'cta', variant: 'cta-card', order: 4 },
    ],
    layout: {
      header: 'header-luxury',
      footer: 'footer-standard',
    },
    style: {
      fontFamily: 'elegant',
      borderStyle: 'sharp',
      themeMode: 'dark',
      spacing: 'spacious',
    },
    defaultColors: {
      primary: '#0d0d0d',
      accent: '#c9a227',
      secondary: '#1a1a1a',
    },
  },

  // ── bold (enterprise) ─────────────────────────────────────────────────────
  {
    id: 'bold',
    name: 'Bold',
    plan: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-asymmetric', order: 1 },
      { id: 'about', variant: 'about-editorial', order: 2 },
      { id: 'listings', variant: 'listings-editorial', order: 3 },
      { id: 'stats', variant: 'stats-strip', order: 4 },
      { id: 'cta', variant: 'cta-banner', order: 5 },
    ],
    layout: {
      header: 'header-luxury',
      footer: 'footer-standard',
    },
    style: {
      fontFamily: 'modern',
      borderStyle: 'sharp',
      themeMode: 'dark',
      spacing: 'normal',
    },
    defaultColors: {
      primary: '#3d0066',
      accent: '#f72585',
      secondary: '#7209b7',
    },
  },
]
