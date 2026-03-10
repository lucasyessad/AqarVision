/**
 * Configuration centralisée AqarVision.
 *
 * Toutes les valeurs "en dur" du projet sont regroupées ici
 * pour faciliter la maintenance et l'adaptation à d'autres marchés.
 */

// ─── Localisation ────────────────────────────────────────────────────

export const LOCALE = {
  /** Code pays ISO 3166-1 alpha-2 */
  COUNTRY_CODE: 'DZ',
  /** Code devise ISO 4217 */
  CURRENCY: 'DZD',
  /** Indicatif téléphonique international (sans le +) */
  PHONE_PREFIX: '213',
  /** Locales BCP 47 pour SEO */
  LOCALE_AR: 'ar-DZ',
  LOCALE_FR: 'fr-DZ',
} as const;

// ─── Plans ───────────────────────────────────────────────────────────

export const PLANS = {
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type PlanType = (typeof PLANS)[keyof typeof PLANS];

// ─── Cache & Revalidation ────────────────────────────────────────────

export const CACHE = {
  /** ISR revalidate pour les pages agence (secondes) */
  PAGE_REVALIDATE: 300,
  /** TTL du cache des appels sociaux (secondes) */
  SOCIAL_FEED_TTL: 3600,
} as const;

// ─── Timeouts ────────────────────────────────────────────────────────

export const TIMEOUTS = {
  /** Timeout max pour les appels API externes (ms) */
  EXTERNAL_API_MS: 8_000,
} as const;

// ─── Rate Limiting ───────────────────────────────────────────────────

export const RATE_LIMIT = {
  /** Fenêtre de rate-limiting (ms) */
  WINDOW_MS: 60_000,
  /** Nombre max de requêtes par fenêtre */
  MAX_REQUESTS: 5,
} as const;

// ─── Uploads ─────────────────────────────────────────────────────────

export const UPLOADS = {
  /** Taille max de l'image de couverture (octets) */
  MAX_COVER_SIZE: 10 * 1024 * 1024,
  /** Taille max du logo (octets) */
  MAX_LOGO_SIZE: 5 * 1024 * 1024,
  /** Extensions autorisées */
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp', 'svg'] as string[],
};

// ─── Pagination ──────────────────────────────────────────────────────

export const PAGINATION: {
  PROPERTIES_PER_PAGE: number;
  PROPERTIES_DEFAULT_LIMIT: number;
  SIMILAR_PROPERTIES_LIMIT: number;
  SOCIAL_FEED_LIMIT: number;
  SOCIAL_FEED_SMALL: number;
} = {
  /** Nombre de biens par page (liste publique) */
  PROPERTIES_PER_PAGE: 12,
  /** Nombre de biens affichés par défaut (widgets) */
  PROPERTIES_DEFAULT_LIMIT: 6,
  /** Nombre de biens similaires */
  SIMILAR_PROPERTIES_LIMIT: 3,
  /** Nombre de posts sociaux (page contact / détail) */
  SOCIAL_FEED_LIMIT: 6,
  SOCIAL_FEED_SMALL: 3,
};

// ─── APIs Sociales ───────────────────────────────────────────────────

export const SOCIAL_API = {
  INSTAGRAM_BASE: 'https://graph.instagram.com',
  FACEBOOK_BASE: 'https://graph.facebook.com',
  FACEBOOK_API_VERSION: 'v19.0',
  TIKTOK_BASE: 'https://open.tiktokapis.com',
  TIKTOK_API_VERSION: 'v2',
} as const;

// ─── Embeds sociaux ──────────────────────────────────────────────────

export const SOCIAL_EMBED = {
  INSTAGRAM: (username: string) => `https://www.instagram.com/${username}/embed`,
  FACEBOOK_PAGE: (href: string) =>
    `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(href)}&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false`,
  TIKTOK: (username: string) => `https://www.tiktok.com/embed/@${username}`,
} as const;

// ─── Couleurs des plateformes ────────────────────────────────────────

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  tiktok: '#000000',
} as const;

// ─── Storage Supabase ────────────────────────────────────────────────

export const STORAGE = {
  BUCKET: 'agencies',
  coverPath: (agencyId: string, ext: string) =>
    `${agencyId}/branding/cover.${ext}`,
  logoPath: (agencyId: string, ext: string) =>
    `${agencyId}/branding/logo.${ext}`,
  brandingDir: (agencyId: string) => `${agencyId}/branding`,
} as const;

// ─── Messages templates ──────────────────────────────────────────────

export const MESSAGES = {
  whatsappGeneric: (agencyName: string) =>
    `Bonjour ${agencyName}, je suis intéressé(e) par vos biens immobiliers.`,
  whatsappProperty: (agencyName: string, title: string, price: string) =>
    `Bonjour ${agencyName}, je suis intéressé(e) par le bien "${title}" (${price}).`,
} as const;

// ─── Animations / UI ─────────────────────────────────────────────────

export const UI = {
  /** Seuil de scroll pour le header sticky (px) */
  HEADER_SCROLL_THRESHOLD: 50,
  /** Durée de l'animation compteur (ms) */
  COUNTER_ANIMATION_MS: 2000,
  /** IntersectionObserver threshold par défaut */
  OBSERVER_THRESHOLD: 0.1,
  OBSERVER_ROOT_MARGIN: '0px 0px -50px 0px',
} as const;
