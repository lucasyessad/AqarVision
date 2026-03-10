import { describe, it, expect } from 'vitest';
import { propertySchema } from '@/lib/validators/property';
import { agencyBrandingSchema, agencyLuxuryBrandingSchema } from '@/lib/validators/agency';
import { leadSchema } from '@/lib/validators/lead';

// ─── Property Schema - Extended Edge Cases ──────────────────────────

describe('propertySchema - edge cases', () => {
  const validProperty = {
    title: 'Villa avec piscine',
    price: 25_000_000,
    type: 'villa',
    transaction_type: 'sale' as const,
  };

  it('rejects title at exactly 2 chars (boundary)', () => {
    const result = propertySchema.safeParse({ ...validProperty, title: 'AB' });
    expect(result.success).toBe(false);
  });

  it('accepts title at exactly 3 chars (boundary)', () => {
    const result = propertySchema.safeParse({ ...validProperty, title: 'ABC' });
    expect(result.success).toBe(true);
  });

  it('accepts title at 200 chars (max boundary)', () => {
    const result = propertySchema.safeParse({ ...validProperty, title: 'A'.repeat(200) });
    expect(result.success).toBe(true);
  });

  it('rejects title over 200 chars', () => {
    const result = propertySchema.safeParse({ ...validProperty, title: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('accepts price of 0 (free property)', () => {
    const result = propertySchema.safeParse({ ...validProperty, price: 0 });
    expect(result.success).toBe(true);
  });

  it('accepts very large price', () => {
    const result = propertySchema.safeParse({ ...validProperty, price: 999_999_999_999 });
    expect(result.success).toBe(true);
  });

  it('rejects fractional rooms', () => {
    const result = propertySchema.safeParse({ ...validProperty, rooms: 2.5 });
    expect(result.success).toBe(false);
  });

  it('rejects fractional bathrooms', () => {
    const result = propertySchema.safeParse({ ...validProperty, bathrooms: 1.5 });
    expect(result.success).toBe(false);
  });

  it('accepts 0 rooms and 0 bathrooms', () => {
    const result = propertySchema.safeParse({ ...validProperty, rooms: 0, bathrooms: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects description over 5000 chars', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      description: 'A'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty features array', () => {
    const result = propertySchema.safeParse({ ...validProperty, features: [] });
    expect(result.success).toBe(true);
  });

  it('accepts empty images array', () => {
    const result = propertySchema.safeParse({ ...validProperty, images: [] });
    expect(result.success).toBe(true);
  });

  it('rejects invalid image URL', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      images: ['not-a-url'],
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid image URLs', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      images: ['https://example.com/1.jpg', 'https://example.com/2.png'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts all valid transaction types', () => {
    for (const type of ['sale', 'rent']) {
      const result = propertySchema.safeParse({ ...validProperty, transaction_type: type });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid statuses', () => {
    for (const status of ['draft', 'active', 'sold', 'rented', 'archived']) {
      const result = propertySchema.safeParse({ ...validProperty, status });
      expect(result.success).toBe(true);
    }
  });

  it('handles latitude/longitude boundary values', () => {
    const boundaryCases = [
      { lat: -90, lon: -180, valid: true },
      { lat: 90, lon: 180, valid: true },
      { lat: 0, lon: 0, valid: true },
      { lat: -90.001, lon: 0, valid: false },
      { lat: 0, lon: 180.001, valid: false },
    ];

    for (const { lat, lon, valid } of boundaryCases) {
      const result = propertySchema.safeParse({
        ...validProperty,
        latitude: lat,
        longitude: lon,
      });
      expect(result.success).toBe(valid);
    }
  });

  it('accepts all supported country codes via lowercase', () => {
    const countries = ['dz', 'fr', 'es', 'ae', 'ma', 'tn', 'tr', 'us', 'gb'];
    for (const country of countries) {
      const result = propertySchema.safeParse({ ...validProperty, country });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe(country.toUpperCase());
      }
    }
  });

  it('rejects single-letter country code', () => {
    const result = propertySchema.safeParse({ ...validProperty, country: 'F' });
    expect(result.success).toBe(false);
  });

  it('accepts all supported currencies via lowercase', () => {
    const currencies = ['dzd', 'eur', 'aed', 'mad', 'tnd', 'try', 'usd', 'gbp'];
    for (const currency of currencies) {
      const result = propertySchema.safeParse({ ...validProperty, currency });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe(currency.toUpperCase());
      }
    }
  });

  it('accepts commune field', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      commune: 'Hydra',
      city: 'Alger',
      wilaya: 'Alger',
    });
    expect(result.success).toBe(true);
  });

  it('rejects address over 500 chars', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      address: 'A'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ─── Agency Branding - Extended Edge Cases ──────────────────────────

describe('agencyBrandingSchema - edge cases', () => {
  it('accepts name at exactly 2 chars', () => {
    const result = agencyBrandingSchema.safeParse({
      name: 'AB',
      primary_color: '#000000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects 3-char hex color', () => {
    const result = agencyBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#fff',
    });
    expect(result.success).toBe(false);
  });

  it('rejects hex color without #', () => {
    const result = agencyBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '000000',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid locales', () => {
    for (const locale of ['fr', 'ar', 'en']) {
      const result = agencyBrandingSchema.safeParse({
        name: 'Test',
        primary_color: '#000000',
        locale,
      });
      expect(result.success).toBe(true);
    }
  });

  it('defaults locale to fr', () => {
    const result = agencyBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locale).toBe('fr');
    }
  });

  it('rejects invalid locale', () => {
    const result = agencyBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      locale: 'de',
    });
    expect(result.success).toBe(false);
  });

  it('accepts slogan at exactly 120 chars', () => {
    const result = agencyBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      slogan: 'A'.repeat(120),
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid URL for website', () => {
    const result = agencyBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      website: 'https://www.monagence.dz',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid email', () => {
    const result = agencyBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      email: 'contact@monagence.dz',
    });
    expect(result.success).toBe(true);
  });

  it('rejects description over 2000 chars', () => {
    const result = agencyBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      description: 'A'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ─── Luxury Branding - Extended Edge Cases ──────────────────────────

describe('agencyLuxuryBrandingSchema - edge cases', () => {
  it('accepts tagline at exactly 200 chars', () => {
    const result = agencyLuxuryBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      tagline: 'A'.repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it('rejects tagline over 200 chars', () => {
    const result = agencyLuxuryBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      tagline: 'A'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('accepts all hero_style values', () => {
    for (const style of ['color', 'cover', 'video']) {
      const result = agencyLuxuryBrandingSchema.safeParse({
        name: 'Test',
        primary_color: '#000000',
        hero_style: style,
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all font_style values', () => {
    for (const style of ['modern', 'classic', 'elegant']) {
      const result = agencyLuxuryBrandingSchema.safeParse({
        name: 'Test',
        primary_color: '#000000',
        font_style: style,
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all theme_mode values', () => {
    for (const mode of ['light', 'dark']) {
      const result = agencyLuxuryBrandingSchema.safeParse({
        name: 'Test',
        primary_color: '#000000',
        theme_mode: mode,
      });
      expect(result.success).toBe(true);
    }
  });

  it('coerces string stats to numbers', () => {
    const result = agencyLuxuryBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      stats_years: '10',
      stats_properties_sold: '500',
      stats_clients: '1000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stats_years).toBe(10);
      expect(result.data.stats_properties_sold).toBe(500);
      expect(result.data.stats_clients).toBe(1000);
    }
  });

  it('rejects non-integer stats', () => {
    const result = agencyLuxuryBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      stats_years: 5.5,
    });
    expect(result.success).toBe(false);
  });

  it('accepts zero for stats', () => {
    const result = agencyLuxuryBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      stats_years: 0,
      stats_properties_sold: 0,
      stats_clients: 0,
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid social URLs', () => {
    const result = agencyLuxuryBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      instagram_url: 'https://instagram.com/test',
      facebook_url: 'https://facebook.com/test',
      tiktok_url: 'https://tiktok.com/@test',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid social URLs', () => {
    const result = agencyLuxuryBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      instagram_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid hero_video_url', () => {
    const result = agencyLuxuryBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      hero_video_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid hero_video_url', () => {
    const result = agencyLuxuryBrandingSchema.safeParse({
      name: 'Test',
      primary_color: '#000000',
      hero_video_url: 'https://youtube.com/watch?v=abc123',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Lead Schema - Extended Edge Cases ──────────────────────────────

describe('leadSchema - edge cases', () => {
  const validLead = {
    agency_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Ahmed',
    phone: '0555123456',
  };

  it('accepts name at exactly 2 chars', () => {
    const result = leadSchema.safeParse({ ...validLead, name: 'AB' });
    expect(result.success).toBe(true);
  });

  it('accepts phone at exactly 9 chars', () => {
    const result = leadSchema.safeParse({ ...validLead, phone: '055512345' });
    expect(result.success).toBe(true);
  });

  it('rejects phone at 8 chars', () => {
    const result = leadSchema.safeParse({ ...validLead, phone: '05551234' });
    expect(result.success).toBe(false);
  });

  it('accepts long international phone', () => {
    const result = leadSchema.safeParse({ ...validLead, phone: '+213555123456' });
    expect(result.success).toBe(true);
  });

  it('accepts message up to 2000 chars', () => {
    const result = leadSchema.safeParse({ ...validLead, message: 'A'.repeat(2000) });
    expect(result.success).toBe(true);
  });

  it('rejects message over 2000 chars', () => {
    const result = leadSchema.safeParse({ ...validLead, message: 'A'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('accepts valid UUID for property_id', () => {
    const result = leadSchema.safeParse({
      ...validLead,
      property_id: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID for property_id', () => {
    const result = leadSchema.safeParse({
      ...validLead,
      property_id: 'invalid-uuid',
    });
    expect(result.success).toBe(false);
  });
});
