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

// ─── Pays supportés ──────────────────────────────────────────────────

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  locale: string;
  /** Terme local pour la subdivision (wilaya, ville, émirat...) */
  regionLabel: string;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  DZ: {
    code: 'DZ',
    name: 'Algérie',
    flag: '🇩🇿',
    currency: 'DZD',
    currencySymbol: 'DA',
    phonePrefix: '213',
    locale: 'fr-DZ',
    regionLabel: 'Wilaya',
  },
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    phonePrefix: '33',
    locale: 'fr-FR',
    regionLabel: 'Département',
  },
  ES: {
    code: 'ES',
    name: 'Espagne',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€',
    phonePrefix: '34',
    locale: 'es-ES',
    regionLabel: 'Provincia',
  },
  AE: {
    code: 'AE',
    name: 'Émirats Arabes Unis',
    flag: '🇦🇪',
    currency: 'AED',
    currencySymbol: 'AED',
    phonePrefix: '971',
    locale: 'ar-AE',
    regionLabel: 'Émirat',
  },
  MA: {
    code: 'MA',
    name: 'Maroc',
    flag: '🇲🇦',
    currency: 'MAD',
    currencySymbol: 'MAD',
    phonePrefix: '212',
    locale: 'fr-MA',
    regionLabel: 'Région',
  },
  TN: {
    code: 'TN',
    name: 'Tunisie',
    flag: '🇹🇳',
    currency: 'TND',
    currencySymbol: 'TND',
    phonePrefix: '216',
    locale: 'fr-TN',
    regionLabel: 'Gouvernorat',
  },
  TR: {
    code: 'TR',
    name: 'Turquie',
    flag: '🇹🇷',
    currency: 'TRY',
    currencySymbol: '₺',
    phonePrefix: '90',
    locale: 'tr-TR',
    regionLabel: 'Province',
  },
  US: {
    code: 'US',
    name: 'États-Unis',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    phonePrefix: '1',
    locale: 'en-US',
    regionLabel: 'State',
  },
  GB: {
    code: 'GB',
    name: 'Royaume-Uni',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    phonePrefix: '44',
    locale: 'en-GB',
    regionLabel: 'County',
  },
};

/** Pays par défaut */
export const DEFAULT_COUNTRY = 'DZ';

/**
 * Récupère la config d'un pays. Retourne DZ par défaut si inconnu.
 */
export function getCountryConfig(countryCode: string): CountryConfig {
  return COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];
}

// ─── Plans ───────────────────────────────────────────────────────────

export const PLANS = {
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type PlanType = (typeof PLANS)[keyof typeof PLANS];

// ─── Plan Limits & Pricing ──────────────────────────────────────────

export interface PlanLimits {
  /** Nombre max de biens publiés */
  maxProperties: number;
  /** Nombre max de leads reçus par mois */
  maxLeadsPerMonth: number;
  /** Nombre max de membres dans l'agence */
  maxMembers: number;
  /** Espace stockage max en octets */
  maxStorageBytes: number;
  /** Accès au branding luxury */
  luxuryBranding: boolean;
  /** Domaine personnalisé */
  customDomain: boolean;
  /** Analytics avancés */
  advancedAnalytics: boolean;
  /** Export CSV des leads */
  exportLeads: boolean;
  /** Intégration réseaux sociaux */
  socialIntegration: boolean;
  /** Biens sponsorisés / mise en avant */
  featuredProperties: number;
}

export interface PlanPricing {
  /** Prix mensuel en DZD */
  monthlyDZD: number;
  /** Prix trimestriel en DZD (remise ~10%) */
  quarterlyDZD: number;
  /** Prix annuel en DZD (remise ~20%) */
  yearlyDZD: number;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  description: string;
  limits: PlanLimits;
  pricing: PlanPricing;
  /** Badges / labels marketing */
  badge: string | null;
}

/** Durée de l'essai gratuit en jours */
export const TRIAL_DURATION_DAYS = 60;

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Pour les agents indépendants et petites agences',
    badge: null,
    limits: {
      maxProperties: 15,
      maxLeadsPerMonth: 30,
      maxMembers: 1,
      maxStorageBytes: 500 * 1024 * 1024, // 500 MB
      luxuryBranding: false,
      customDomain: false,
      advancedAnalytics: false,
      exportLeads: false,
      socialIntegration: false,
      featuredProperties: 0,
    },
    pricing: {
      monthlyDZD: 5_000,
      quarterlyDZD: 13_500, // ~10% remise
      yearlyDZD: 48_000,    // ~20% remise
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les agences en croissance',
    badge: 'Populaire',
    limits: {
      maxProperties: 50,
      maxLeadsPerMonth: 150,
      maxMembers: 5,
      maxStorageBytes: 2 * 1024 * 1024 * 1024, // 2 GB
      luxuryBranding: false,
      customDomain: false,
      advancedAnalytics: true,
      exportLeads: true,
      socialIntegration: true,
      featuredProperties: 3,
    },
    pricing: {
      monthlyDZD: 12_000,
      quarterlyDZD: 32_400,  // ~10% remise
      yearlyDZD: 115_200,    // ~20% remise
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour les grandes agences et promoteurs',
    badge: 'Premium',
    limits: {
      maxProperties: Infinity,
      maxLeadsPerMonth: Infinity,
      maxMembers: 20,
      maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
      luxuryBranding: true,
      customDomain: true,
      advancedAnalytics: true,
      exportLeads: true,
      socialIntegration: true,
      featuredProperties: Infinity,
    },
    pricing: {
      monthlyDZD: 30_000,
      quarterlyDZD: 81_000,  // ~10% remise
      yearlyDZD: 288_000,    // ~20% remise
    },
  },
};

/**
 * Récupère la config d'un plan. Retourne starter par défaut si inconnu.
 */
export function getPlanConfig(plan: string): PlanConfig {
  return PLAN_CONFIGS[plan as PlanType] || PLAN_CONFIGS.starter;
}

/**
 * Calcule l'économie en % pour un cycle de facturation vs mensuel.
 */
export function getBillingDiscount(cycle: 'monthly' | 'quarterly' | 'yearly'): number {
  switch (cycle) {
    case 'quarterly': return 10;
    case 'yearly': return 20;
    default: return 0;
  }
}

/**
 * Retourne le prix pour un plan et un cycle donnés.
 */
export function getPlanPrice(plan: string, cycle: 'monthly' | 'quarterly' | 'yearly'): number {
  const config = getPlanConfig(plan);
  switch (cycle) {
    case 'quarterly': return config.pricing.quarterlyDZD;
    case 'yearly': return config.pricing.yearlyDZD;
    default: return config.pricing.monthlyDZD;
  }
}

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

// ─── AqarSearch ─────────────────────────────────────────────────────

export const SEARCH = {
  RESULTS_PER_PAGE: 12,
  MAX_SAVED_SEARCHES: 20,
  MAX_ALERTS: 10,
  HISTORY_MAX_ITEMS: 50,
  TRUST_SCORE_HIGH: 80,
  TRUST_SCORE_MEDIUM: 50,
  MIN_IMAGES_FOR_HIGH_TRUST: 3,
  SEARCH_REVALIDATE: 60,
  SIMILAR_PROPERTIES_LIMIT: 4,
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
