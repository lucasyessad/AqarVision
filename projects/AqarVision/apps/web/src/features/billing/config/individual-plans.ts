/**
 * AqarChaab individual billing — packs and subscription plans.
 *
 * To activate payments:
 * 1. Create Price objects in your Stripe dashboard (EUR, one_time for packs, recurring for subs)
 * 2. Add the price IDs to your .env:
 *    STRIPE_PRICE_PACK_3=price_...
 *    STRIPE_PRICE_PACK_7=price_...
 *    STRIPE_PRICE_PACK_15=price_...
 *    STRIPE_PRICE_CHAAB_PLUS=price_...
 *    STRIPE_PRICE_CHAAB_PRO=price_...
 */

export const FREE_LISTING_QUOTA = 2;

// ── One-time packs (permanent extra slots) ──────────────────────────────────

export interface ListingPack {
  slug: string;
  label: string;
  extra_slots: number;
  price_eur: number;
  /** Display price in DA (informational only — payment is in EUR) */
  price_da_display: string;
  stripe_price_id: string;
  badge?: string;
}

export const LISTING_PACKS: ListingPack[] = [
  {
    slug: "pack_3",
    label: "Pack Starter",
    extra_slots: 3,
    price_eur: 3.5,
    price_da_display: "≈ 500 DA",
    stripe_price_id: process.env.STRIPE_PRICE_PACK_3 ?? "",
  },
  {
    slug: "pack_7",
    label: "Pack Pro",
    extra_slots: 7,
    price_eur: 7.0,
    price_da_display: "≈ 1 000 DA",
    stripe_price_id: process.env.STRIPE_PRICE_PACK_7 ?? "",
    badge: "Populaire",
  },
  {
    slug: "pack_15",
    label: "Pack Premium",
    extra_slots: 15,
    price_eur: 13.0,
    price_da_display: "≈ 1 850 DA",
    stripe_price_id: process.env.STRIPE_PRICE_PACK_15 ?? "",
  },
];

// ── Monthly subscriptions (replaces free quota) ─────────────────────────────

export interface IndividualPlan {
  slug: string;
  label: string;
  description: string;
  max_listings: number;
  price_eur: number;
  price_da_display: string;
  stripe_price_id: string;
  badge?: string;
  features: string[];
}

export const INDIVIDUAL_PLANS: IndividualPlan[] = [
  {
    slug: "chaab_plus",
    label: "AqarChaab+",
    description: "Pour les particuliers actifs",
    max_listings: 10,
    price_eur: 4.99,
    price_da_display: "≈ 700 DA/mois",
    stripe_price_id: process.env.STRIPE_PRICE_CHAAB_PLUS ?? "",
    features: [
      "10 annonces actives simultanées",
      "Photos haute résolution",
      "Mise en avant dans les résultats",
      "Statistiques de vues",
    ],
  },
  {
    slug: "chaab_pro",
    label: "AqarChaab Pro",
    description: "Pour les investisseurs et marchands",
    max_listings: 999,
    price_eur: 9.99,
    price_da_display: "≈ 1 400 DA/mois",
    stripe_price_id: process.env.STRIPE_PRICE_CHAAB_PRO ?? "",
    badge: "Illimité",
    features: [
      "Annonces illimitées",
      "Photos haute résolution",
      "Mise en avant premium",
      "Statistiques détaillées",
      "Support prioritaire",
    ],
  },
];

export function getPack(slug: string): ListingPack | undefined {
  return LISTING_PACKS.find((p) => p.slug === slug);
}

export function getIndividualPlan(slug: string): IndividualPlan | undefined {
  return INDIVIDUAL_PLANS.find((p) => p.slug === slug);
}
