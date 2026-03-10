import { describe, it, expect } from 'vitest';
import { propertySchema } from '@/lib/validators/property';

describe('propertySchema', () => {
  const validProperty = {
    title: 'Villa avec piscine',
    price: 25_000_000,
    type: 'villa',
    transaction_type: 'sale' as const,
  };

  // ─── Basic validation ────────────────────────────────────────────

  it('accepts valid minimal property', () => {
    const result = propertySchema.safeParse(validProperty);
    expect(result.success).toBe(true);
  });

  it('applies defaults for country, currency, status', () => {
    const result = propertySchema.safeParse(validProperty);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe('DZ');
      expect(result.data.currency).toBe('DZD');
      expect(result.data.status).toBe('draft');
      expect(result.data.images).toEqual([]);
      expect(result.data.features).toEqual([]);
      expect(result.data.is_featured).toBe(false);
    }
  });

  it('rejects title shorter than 3 chars', () => {
    const result = propertySchema.safeParse({ ...validProperty, title: 'AB' });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = propertySchema.safeParse({ ...validProperty, price: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid transaction_type', () => {
    const result = propertySchema.safeParse({ ...validProperty, transaction_type: 'lease' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = propertySchema.safeParse({ ...validProperty, status: 'pending' });
    expect(result.success).toBe(false);
  });

  // ─── Country validation ──────────────────────────────────────────

  it('accepts all supported countries', () => {
    const countries = ['DZ', 'FR', 'ES', 'AE', 'MA', 'TN', 'TR', 'US', 'GB'];
    for (const country of countries) {
      const result = propertySchema.safeParse({ ...validProperty, country });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe(country);
      }
    }
  });

  it('uppercases country code automatically', () => {
    const result = propertySchema.safeParse({ ...validProperty, country: 'fr' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe('FR');
    }
  });

  it('rejects unsupported country code', () => {
    const result = propertySchema.safeParse({ ...validProperty, country: 'XX' });
    expect(result.success).toBe(false);
  });

  it('rejects country code with wrong length', () => {
    const result = propertySchema.safeParse({ ...validProperty, country: 'FRA' });
    expect(result.success).toBe(false);
  });

  // ─── Currency validation ─────────────────────────────────────────

  it('accepts all supported currencies', () => {
    const currencies = ['DZD', 'EUR', 'AED', 'MAD', 'TND', 'TRY', 'USD', 'GBP'];
    for (const currency of currencies) {
      const result = propertySchema.safeParse({ ...validProperty, currency });
      expect(result.success).toBe(true);
    }
  });

  it('uppercases currency code automatically', () => {
    const result = propertySchema.safeParse({ ...validProperty, currency: 'eur' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('EUR');
    }
  });

  it('rejects unsupported currency code', () => {
    const result = propertySchema.safeParse({ ...validProperty, currency: 'BTC' });
    expect(result.success).toBe(false);
  });

  it('rejects currency code with wrong length', () => {
    const result = propertySchema.safeParse({ ...validProperty, currency: 'EU' });
    expect(result.success).toBe(false);
  });

  // ─── International property ──────────────────────────────────────

  it('accepts a complete international property (Spain)', () => {
    const result = propertySchema.safeParse({
      title: 'Apartamento en Marbella',
      description: 'Bel appartement vue mer',
      price: 350_000,
      surface: 120,
      rooms: 3,
      bathrooms: 2,
      type: 'apartment',
      transaction_type: 'sale',
      country: 'ES',
      city: 'Marbella',
      currency: 'EUR',
      latitude: 36.5,
      longitude: -4.88,
      images: ['https://example.com/photo1.jpg'],
      features: ['piscine', 'terrasse'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe('ES');
      expect(result.data.currency).toBe('EUR');
      expect(result.data.city).toBe('Marbella');
    }
  });

  it('accepts a Dubai property with AED', () => {
    const result = propertySchema.safeParse({
      title: 'Luxury Penthouse Dubai Marina',
      price: 5_500_000,
      type: 'penthouse',
      transaction_type: 'sale',
      country: 'AE',
      city: 'Dubai',
      currency: 'AED',
    });
    expect(result.success).toBe(true);
  });

  // ─── Coordinates validation ──────────────────────────────────────

  it('rejects latitude out of range', () => {
    const result = propertySchema.safeParse({ ...validProperty, latitude: 91 });
    expect(result.success).toBe(false);
  });

  it('rejects longitude out of range', () => {
    const result = propertySchema.safeParse({ ...validProperty, longitude: -181 });
    expect(result.success).toBe(false);
  });

  it('accepts valid coordinates', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      latitude: 36.75,
      longitude: 3.06,
    });
    expect(result.success).toBe(true);
  });

  // ─── Optional fields ────────────────────────────────────────────

  it('accepts null optional fields', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      description: null,
      surface: null,
      rooms: null,
      bathrooms: null,
      city: null,
      wilaya: null,
      commune: null,
      address: null,
      latitude: null,
      longitude: null,
    });
    expect(result.success).toBe(true);
  });
});
