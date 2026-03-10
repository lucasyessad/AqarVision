import { describe, it, expect } from 'vitest';
import {
  COUNTRIES,
  PLANS,
  LOCALE,
  DEFAULT_COUNTRY,
  getCountryConfig,
  CACHE,
  RATE_LIMIT,
  UPLOADS,
  PAGINATION,
  PLATFORM_COLORS,
} from '@/config';

// ─── COUNTRIES config ────────────────────────────────────────────────

describe('COUNTRIES', () => {
  it('contains 9 supported countries', () => {
    expect(Object.keys(COUNTRIES)).toHaveLength(9);
  });

  it('has DZ as default country', () => {
    expect(DEFAULT_COUNTRY).toBe('DZ');
    expect(COUNTRIES.DZ).toBeDefined();
  });

  it('all countries have required fields', () => {
    for (const [code, config] of Object.entries(COUNTRIES)) {
      expect(config.code).toBe(code);
      expect(config.name).toBeTruthy();
      expect(config.flag).toBeTruthy();
      expect(config.currency).toHaveLength(3);
      expect(config.currencySymbol).toBeTruthy();
      expect(config.phonePrefix).toBeTruthy();
      expect(config.locale).toBeTruthy();
      expect(config.regionLabel).toBeTruthy();
    }
  });

  it('country codes are 2 uppercase letters', () => {
    for (const code of Object.keys(COUNTRIES)) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });

  it('currency codes are 3 uppercase letters', () => {
    for (const config of Object.values(COUNTRIES)) {
      expect(config.currency).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('phone prefixes are numeric strings', () => {
    for (const config of Object.values(COUNTRIES)) {
      expect(config.phonePrefix).toMatch(/^\d+$/);
    }
  });
});

// ─── getCountryConfig ────────────────────────────────────────────────

describe('getCountryConfig', () => {
  it('returns correct config for DZ', () => {
    const config = getCountryConfig('DZ');
    expect(config.name).toBe('Algérie');
    expect(config.currency).toBe('DZD');
    expect(config.phonePrefix).toBe('213');
  });

  it('returns correct config for FR', () => {
    const config = getCountryConfig('FR');
    expect(config.name).toBe('France');
    expect(config.currency).toBe('EUR');
  });

  it('returns correct config for AE (Dubai)', () => {
    const config = getCountryConfig('AE');
    expect(config.name).toBe('Émirats Arabes Unis');
    expect(config.currency).toBe('AED');
  });

  it('falls back to DZ for unknown country', () => {
    const config = getCountryConfig('XX');
    expect(config.code).toBe('DZ');
    expect(config.currency).toBe('DZD');
  });
});

// ─── PLANS ───────────────────────────────────────────────────────────

describe('PLANS', () => {
  it('has 3 plan types', () => {
    expect(Object.keys(PLANS)).toHaveLength(3);
  });

  it('matches DB CHECK constraint values', () => {
    expect(PLANS.STARTER).toBe('starter');
    expect(PLANS.PRO).toBe('pro');
    expect(PLANS.ENTERPRISE).toBe('enterprise');
  });
});

// ─── LOCALE ──────────────────────────────────────────────────────────

describe('LOCALE', () => {
  it('has correct Algerian defaults', () => {
    expect(LOCALE.COUNTRY_CODE).toBe('DZ');
    expect(LOCALE.CURRENCY).toBe('DZD');
    expect(LOCALE.PHONE_PREFIX).toBe('213');
  });
});

// ─── Numeric config sanity checks ────────────────────────────────────

describe('config sanity', () => {
  it('CACHE values are positive', () => {
    expect(CACHE.PAGE_REVALIDATE).toBeGreaterThan(0);
    expect(CACHE.SOCIAL_FEED_TTL).toBeGreaterThan(0);
  });

  it('RATE_LIMIT values are positive', () => {
    expect(RATE_LIMIT.WINDOW_MS).toBeGreaterThan(0);
    expect(RATE_LIMIT.MAX_REQUESTS).toBeGreaterThan(0);
  });

  it('UPLOADS size limits are reasonable', () => {
    expect(UPLOADS.MAX_COVER_SIZE).toBe(10 * 1024 * 1024);
    expect(UPLOADS.MAX_LOGO_SIZE).toBe(5 * 1024 * 1024);
    expect(UPLOADS.ALLOWED_EXTENSIONS).toContain('jpg');
    expect(UPLOADS.ALLOWED_EXTENSIONS).toContain('png');
    expect(UPLOADS.ALLOWED_EXTENSIONS).toContain('webp');
  });

  it('PAGINATION values are positive', () => {
    expect(PAGINATION.PROPERTIES_PER_PAGE).toBeGreaterThan(0);
    expect(PAGINATION.PROPERTIES_DEFAULT_LIMIT).toBeGreaterThan(0);
    expect(PAGINATION.SIMILAR_PROPERTIES_LIMIT).toBeGreaterThan(0);
  });

  it('PLATFORM_COLORS has all 3 platforms', () => {
    expect(PLATFORM_COLORS.instagram).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(PLATFORM_COLORS.facebook).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(PLATFORM_COLORS.tiktok).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
