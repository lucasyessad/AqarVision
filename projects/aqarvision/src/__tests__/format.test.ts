import { describe, it, expect } from 'vitest';
import { formatPrice, getLocationLabel, getCountryFlag } from '@/lib/utils/format';

// ─── formatPrice ─────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('formats DZD price by default', () => {
    const result = formatPrice(15_000_000);
    expect(result).toContain('15');
    // Should contain some form of DZD or DA
    expect(result).toMatch(/DZD|DA/i);
  });

  it('formats EUR price', () => {
    const result = formatPrice(250_000, 'EUR');
    expect(result).toContain('250');
    expect(result).toMatch(/€|EUR/);
  });

  it('formats USD price', () => {
    const result = formatPrice(450_000, 'USD');
    expect(result).toContain('450');
    expect(result).toMatch(/\$|USD/);
  });

  it('formats AED price', () => {
    const result = formatPrice(5_500_000, 'AED');
    expect(result).toContain('5');
    expect(result).toMatch(/AED|د\.إ/);
  });

  it('formats GBP price', () => {
    const result = formatPrice(800_000, 'GBP');
    expect(result).toContain('800');
    expect(result).toMatch(/£|GBP/);
  });

  it('formats MAD price', () => {
    const result = formatPrice(1_200_000, 'MAD');
    expect(result).toContain('1');
    expect(result).toMatch(/MAD|د\.م/);
  });

  it('formats TRY price', () => {
    const result = formatPrice(3_000_000, 'TRY');
    expect(result).toContain('3');
    expect(result).toMatch(/₺|TRY|TL/);
  });

  it('handles zero price', () => {
    const result = formatPrice(0, 'EUR');
    expect(result).toContain('0');
  });

  it('does not show decimal places', () => {
    const result = formatPrice(250_000.75, 'EUR');
    // maximumFractionDigits: 0 means no decimals
    expect(result).not.toMatch(/[.,]\d{1,2}$/);
  });

  it('falls back to fr-DZ locale for unknown currency', () => {
    // Should not throw, should format somehow
    const result = formatPrice(100_000, 'XYZ');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});

// ─── getLocationLabel ────────────────────────────────────────────────

describe('getLocationLabel', () => {
  it('returns wilaya for Algerian property', () => {
    const result = getLocationLabel({
      country: 'DZ',
      wilaya: 'Alger',
    });
    expect(result).toBe('Alger');
  });

  it('returns city + country for international property', () => {
    const result = getLocationLabel({
      country: 'ES',
      city: 'Marbella',
    });
    expect(result).toBe('Marbella, Espagne');
  });

  it('returns city + wilaya for DZ property with both', () => {
    const result = getLocationLabel({
      country: 'DZ',
      city: 'Bab Ezzouar',
      wilaya: 'Alger',
    });
    expect(result).toBe('Bab Ezzouar, Alger');
  });

  it('does not duplicate city and wilaya when identical', () => {
    const result = getLocationLabel({
      country: 'DZ',
      city: 'Alger',
      wilaya: 'Alger',
    });
    // Should not be "Alger, Alger"
    expect(result).toBe('Alger');
  });

  it('includes commune when provided', () => {
    const result = getLocationLabel({
      country: 'DZ',
      commune: 'Hydra',
      city: 'Alger',
      wilaya: 'Alger',
    });
    expect(result).toContain('Hydra');
    expect(result).toContain('Alger');
  });

  it('returns country name for international property without city', () => {
    const result = getLocationLabel({
      country: 'AE',
    });
    expect(result).toBe('Émirats Arabes Unis');
  });

  it('returns city + country for Dubai property', () => {
    const result = getLocationLabel({
      country: 'AE',
      city: 'Dubai',
    });
    expect(result).toBe('Dubai, Émirats Arabes Unis');
  });

  it('returns city + country for French property', () => {
    const result = getLocationLabel({
      country: 'FR',
      city: 'Paris',
    });
    expect(result).toBe('Paris, France');
  });

  it('handles unknown country gracefully (falls back to DZ)', () => {
    const result = getLocationLabel({
      country: 'XX',
      city: 'Somewhere',
    });
    // Should fall back to DZ config but still show city
    expect(result).toContain('Somewhere');
  });
});

// ─── getCountryFlag ──────────────────────────────────────────────────

describe('getCountryFlag', () => {
  it('returns correct flag for DZ', () => {
    expect(getCountryFlag('DZ')).toBe('🇩🇿');
  });

  it('returns correct flag for FR', () => {
    expect(getCountryFlag('FR')).toBe('🇫🇷');
  });

  it('returns correct flag for AE', () => {
    expect(getCountryFlag('AE')).toBe('🇦🇪');
  });

  it('falls back to DZ flag for unknown country', () => {
    expect(getCountryFlag('XX')).toBe('🇩🇿');
  });
});
