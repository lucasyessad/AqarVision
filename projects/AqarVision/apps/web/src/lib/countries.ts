/**
 * Multi-country configuration for AqarVision.
 *
 * Supported countries: DZ (default), FR, MA, TN, AE.
 *
 * Each entry defines currency, phone prefix, locale, the local label for
 * an administrative region (wilaya / région / etc.), and RTL direction.
 *
 * These are pure constants — no I/O, safe to import anywhere.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CountryConfig {
  /** ISO 4217 currency code */
  currency: string;
  /** International dialing prefix (without the leading "+") */
  phone_prefix: string;
  /** BCP-47 locale tag used for number/date formatting */
  locale: string;
  /** Local name for the first-level administrative region */
  regionLabel: string;
  /** Whether the country's primary language is written right-to-left */
  rtl: boolean;
}

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * Country configurations keyed by ISO 3166-1 alpha-2 code.
 *
 * Algeria (DZ) is the primary market and default country.
 */
export const COUNTRIES: Record<string, CountryConfig> = {
  /** Algeria — primary market */
  DZ: {
    currency: "DZD",
    phone_prefix: "213",
    locale: "fr-DZ",
    regionLabel: "wilaya",
    rtl: false,
  },

  /** France */
  FR: {
    currency: "EUR",
    phone_prefix: "33",
    locale: "fr-FR",
    regionLabel: "région",
    rtl: false,
  },

  /** Morocco */
  MA: {
    currency: "MAD",
    phone_prefix: "212",
    locale: "fr-MA",
    regionLabel: "région",
    rtl: false,
  },

  /** Tunisia */
  TN: {
    currency: "TND",
    phone_prefix: "216",
    locale: "fr-TN",
    regionLabel: "gouvernorat",
    rtl: false,
  },

  /** United Arab Emirates */
  AE: {
    currency: "AED",
    phone_prefix: "971",
    locale: "ar-AE",
    regionLabel: "إمارة",
    rtl: true,
  },
} as const;

// ── Default ───────────────────────────────────────────────────────────────────

/** ISO 3166-1 alpha-2 code of the default country (Algeria) */
export const DEFAULT_COUNTRY = "DZ" as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the `CountryConfig` for a given ISO country code.
 * Falls back to the Algerian config if the code is unknown.
 *
 * @example
 * getCountryConfig("MA")   // { currency: "MAD", ... }
 * getCountryConfig("XX")   // falls back to DZ config
 */
export function getCountryConfig(code: string): CountryConfig {
  return (COUNTRIES[code.toUpperCase()] ?? COUNTRIES[DEFAULT_COUNTRY]) as CountryConfig;
}

/**
 * Returns all supported ISO country codes.
 */
export function getSupportedCountryCodes(): string[] {
  return Object.keys(COUNTRIES);
}

/**
 * Returns `true` if the given ISO code is a supported country.
 */
export function isSupportedCountry(code: string): boolean {
  return code in COUNTRIES;
}
