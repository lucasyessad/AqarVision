/**
 * ThemeManifest registry for AqarVision agency storefronts.
 *
 * Each theme defines the visual identity, section layout, and default colors
 * for an agency's public showcase page (/a/[slug]).
 *
 * Plan gating:
 *   - null        → available to all plans (including starter / no subscription)
 *   - "pro"       → requires Pro plan or higher
 *   - "enterprise"→ requires Enterprise plan
 *
 * fontKey maps to Google Fonts loaded by ThemeRenderer:
 *   "modern"  → Plus Jakarta Sans (same as site default)
 *   "classic" → DM Serif Display + Jost
 *   "elegant" → Playfair Display + Outfit
 *   "serif"   → Cormorant Garamond + Work Sans
 *   "slab"    → Syne + IBM Plex Mono
 *   "swiss"   → Manrope
 *   "bodoni"  → Bodoni Moda + Figtree
 *   "organic" → Instrument Serif + Instrument Sans
 *   "pastel"  → Fraunces + Nunito
 *   "editorial"→ Libre Baskerville + Hanken Grotesk
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
    fontFamily: 'modern' | 'classic' | 'elegant' | 'serif' | 'slab' | 'swiss' | 'bodoni' | 'organic' | 'pastel' | 'editorial'
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

  // ── STARTER (free) ────────────────────────────────────────────────────────

  {
    id: 'minimal',
    name: 'Minimal',
    plan: null,
    sections: [
      { id: 'hero', variant: 'hero-short', order: 1 },
      { id: 'listings', variant: 'listings-grid', order: 2 },
      { id: 'cta', variant: 'cta-simple', order: 3 },
    ],
    layout: { header: 'header-minimal', footer: 'footer-minimal' },
    style: { fontFamily: 'modern', borderStyle: 'sharp', themeMode: 'light', spacing: 'compact' },
    defaultColors: { primary: '#1a1a1a', accent: '#e5e5e5', secondary: '#666666' },
  },

  {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    plan: null,
    sections: [
      { id: 'hero', variant: 'hero-medium', order: 1 },
      { id: 'about', variant: 'about-standard', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'stats', variant: 'stats-strip', order: 4 },
      { id: 'cta', variant: 'cta-card', order: 5 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: { fontFamily: 'classic', borderStyle: 'soft', themeMode: 'light', spacing: 'normal' },
    defaultColors: { primary: '#0F1B3D', accent: '#2563EB', secondary: '#64748B' },
  },

  {
    id: 'swiss-minimal',
    name: 'Swiss Minimal',
    plan: null,
    sections: [
      { id: 'hero', variant: 'hero-short', order: 1 },
      { id: 'listings', variant: 'listings-grid', order: 2 },
      { id: 'cta', variant: 'cta-simple', order: 3 },
    ],
    layout: { header: 'header-minimal', footer: 'footer-minimal' },
    style: { fontFamily: 'swiss', borderStyle: 'sharp', themeMode: 'light', spacing: 'compact' },
    defaultColors: { primary: '#111111', accent: '#FF4D00', secondary: '#888888' },
  },

  // ── PRO ───────────────────────────────────────────────────────────────────

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
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: { fontFamily: 'modern', borderStyle: 'rounded', themeMode: 'light', spacing: 'normal' },
    defaultColors: { primary: '#4338ca', accent: '#fbbf24', secondary: '#6366f1' },
  },

  {
    id: 'mediterranee',
    name: 'Méditerranée',
    plan: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-medium', order: 1 },
      { id: 'about', variant: 'about-standard', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'cta', variant: 'cta-card', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: { fontFamily: 'classic', borderStyle: 'soft', themeMode: 'light', spacing: 'spacious' },
    defaultColors: { primary: '#C4775A', accent: '#5E6B52', secondary: '#F5EDE3' },
  },

  {
    id: 'marocain-contemporain',
    name: 'Marocain Contemporain',
    plan: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-fullscreen', order: 1 },
      { id: 'about', variant: 'about-standard', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'cta', variant: 'cta-card', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: { fontFamily: 'serif', borderStyle: 'soft', themeMode: 'light', spacing: 'spacious' },
    defaultColors: { primary: '#1B6B6D', accent: '#C4613A', secondary: '#FAF7F2' },
  },

  {
    id: 'pastel-doux',
    name: 'Pastel Doux',
    plan: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-short', order: 1 },
      { id: 'about', variant: 'about-standard', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'cta', variant: 'cta-simple', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: { fontFamily: 'pastel', borderStyle: 'soft', themeMode: 'light', spacing: 'spacious' },
    defaultColors: { primary: '#B8A9E8', accent: '#F4B8A5', secondary: '#A8D8C8' },
  },

  {
    id: 'organique-eco',
    name: 'Organique & Éco',
    plan: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-medium', order: 1 },
      { id: 'about', variant: 'about-standard', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'cta', variant: 'cta-simple', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: { fontFamily: 'organic', borderStyle: 'soft', themeMode: 'light', spacing: 'spacious' },
    defaultColors: { primary: '#2D5F3C', accent: '#7A9E7E', secondary: '#E8DFD0' },
  },

  // ── ENTERPRISE ────────────────────────────────────────────────────────────

  {
    id: 'luxe-noir',
    name: 'Luxe Noir',
    plan: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-fullscreen', order: 1 },
      { id: 'about', variant: 'about-luxury', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'stats', variant: 'stats-strip', order: 4 },
      { id: 'cta', variant: 'cta-card', order: 5 },
    ],
    layout: { header: 'header-luxury', footer: 'footer-standard' },
    style: { fontFamily: 'elegant', borderStyle: 'sharp', themeMode: 'dark', spacing: 'spacious' },
    defaultColors: { primary: '#0A0A0A', accent: '#C8A45C', secondary: '#1A1A1A' },
  },

  {
    id: 'editorial-07',
    name: 'Editorial',
    plan: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-fullscreen', order: 1 },
      { id: 'about', variant: 'about-editorial', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'cta', variant: 'cta-banner', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: { fontFamily: 'editorial', borderStyle: 'sharp', themeMode: 'light', spacing: 'spacious' },
    defaultColors: { primary: '#0D0D0D', accent: '#D4343B', secondary: '#F0F0F0' },
  },

  {
    id: 'art-deco',
    name: 'Art Déco',
    plan: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-fullscreen', order: 1 },
      { id: 'about', variant: 'about-luxury', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'stats', variant: 'stats-strip', order: 4 },
      { id: 'cta', variant: 'cta-card', order: 5 },
    ],
    layout: { header: 'header-luxury', footer: 'footer-standard' },
    style: { fontFamily: 'bodoni', borderStyle: 'sharp', themeMode: 'light', spacing: 'spacious' },
    defaultColors: { primary: '#1B5E3B', accent: '#C9A84C', secondary: '#F8F5EE' },
  },

  {
    id: 'neo-brutalist',
    name: 'Néo-Brutaliste',
    plan: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-medium', order: 1 },
      { id: 'about', variant: 'about-editorial', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'stats', variant: 'stats-strip', order: 4 },
      { id: 'cta', variant: 'cta-banner', order: 5 },
    ],
    layout: { header: 'header-luxury', footer: 'footer-standard' },
    style: { fontFamily: 'slab', borderStyle: 'sharp', themeMode: 'light', spacing: 'normal' },
    defaultColors: { primary: '#111111', accent: '#E8FF00', secondary: '#F2F0EB' },
  },

  // ── Legacy (kept for backwards compat) ────────────────────────────────────

  {
    id: 'professional',
    name: 'Professional',
    plan: 'pro',
    sections: [
      { id: 'hero', variant: 'hero-medium', order: 1 },
      { id: 'about', variant: 'about-standard', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'cta', variant: 'cta-card', order: 4 },
    ],
    layout: { header: 'header-standard', footer: 'footer-standard' },
    style: { fontFamily: 'classic', borderStyle: 'soft', themeMode: 'light', spacing: 'normal' },
    defaultColors: { primary: '#1e3a5f', accent: '#c9a227', secondary: '#2d5a8e' },
  },

  {
    id: 'luxury',
    name: 'Luxury',
    plan: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-fullscreen', order: 1 },
      { id: 'about', variant: 'about-luxury', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'cta', variant: 'cta-card', order: 4 },
    ],
    layout: { header: 'header-luxury', footer: 'footer-standard' },
    style: { fontFamily: 'elegant', borderStyle: 'sharp', themeMode: 'dark', spacing: 'spacious' },
    defaultColors: { primary: '#0d0d0d', accent: '#c9a227', secondary: '#1a1a1a' },
  },

  {
    id: 'bold',
    name: 'Bold',
    plan: 'enterprise',
    sections: [
      { id: 'hero', variant: 'hero-fullscreen', order: 1 },
      { id: 'about', variant: 'about-editorial', order: 2 },
      { id: 'listings', variant: 'listings-grid', order: 3 },
      { id: 'stats', variant: 'stats-strip', order: 4 },
      { id: 'cta', variant: 'cta-banner', order: 5 },
    ],
    layout: { header: 'header-luxury', footer: 'footer-standard' },
    style: { fontFamily: 'modern', borderStyle: 'sharp', themeMode: 'dark', spacing: 'normal' },
    defaultColors: { primary: '#3d0066', accent: '#f72585', secondary: '#7209b7' },
  },
]
