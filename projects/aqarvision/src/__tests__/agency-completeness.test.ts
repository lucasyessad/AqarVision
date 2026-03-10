import { describe, it, expect } from 'vitest';
import { calculateAgencyCompleteness } from '@/lib/agency-completeness';
import type { Agency } from '@/types/database';

function makeAgency(overrides: Partial<Agency> = {}): Agency {
  return {
    id: 'agency-1',
    owner_id: 'user-1',
    name: 'Test Agence',
    slug: 'test-agence',
    description: null,
    logo_url: null,
    cover_image_url: null,
    primary_color: '#000',
    phone: null,
    email: null,
    website: null,
    address: null,
    wilaya: null,
    slogan: null,
    registre_commerce: null,
    active_plan: 'starter',
    locale: 'fr',
    custom_domain: null,
    latitude: null,
    longitude: null,
    instagram_url: null,
    facebook_url: null,
    tiktok_url: null,
    secondary_color: null,
    hero_video_url: null,
    hero_style: 'color',
    font_style: 'modern',
    theme_mode: 'light',
    tagline: null,
    stats_years: null,
    stats_properties_sold: null,
    stats_clients: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('calculateAgencyCompleteness', () => {
  it('returns low score for minimal agency', () => {
    const result = calculateAgencyCompleteness(makeAgency());
    expect(result.score).toBeLessThan(30);
    expect(result.missing.length).toBeGreaterThan(5);
  });

  it('returns 100% for fully completed agency', () => {
    const result = calculateAgencyCompleteness(makeAgency({
      name: 'Agence Pro',
      description: 'A'.repeat(150),
      phone: '0555123456',
      email: 'contact@agence.dz',
      address: '123 Rue Didouche',
      wilaya: 'Alger',
      logo_url: 'https://example.com/logo.png',
      slogan: 'Votre partenaire immobilier',
      instagram_url: 'https://instagram.com/agence',
      facebook_url: 'https://facebook.com/agence',
      cover_image_url: 'https://example.com/cover.jpg',
      latitude: 36.7538,
      website: 'https://agence.dz',
    }));
    expect(result.score).toBe(100);
    expect(result.missing).toHaveLength(0);
  });

  it('penalizes short description', () => {
    const shortDesc = calculateAgencyCompleteness(makeAgency({ description: 'Courte' }));
    const longDesc = calculateAgencyCompleteness(makeAgency({
      description: 'A'.repeat(150),
    }));
    expect(longDesc.score).toBeGreaterThan(shortDesc.score);
  });

  it('includes phone in completeness', () => {
    const without = calculateAgencyCompleteness(makeAgency());
    const withPhone = calculateAgencyCompleteness(makeAgency({ phone: '0555123456' }));
    expect(withPhone.score).toBeGreaterThan(without.score);
    expect(withPhone.completed).toContain('Téléphone');
  });

  it('includes logo in completeness', () => {
    const without = calculateAgencyCompleteness(makeAgency());
    const withLogo = calculateAgencyCompleteness(makeAgency({ logo_url: 'https://x.com/logo.png' }));
    expect(withLogo.score).toBeGreaterThan(without.score);
    expect(withLogo.completed).toContain('Logo');
  });

  it('returns max 5 suggestions', () => {
    const result = calculateAgencyCompleteness(makeAgency());
    expect(result.suggestions.length).toBeLessThanOrEqual(5);
  });

  it('suggestions are non-empty strings', () => {
    const result = calculateAgencyCompleteness(makeAgency());
    result.suggestions.forEach((s) => {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    });
  });

  it('score is between 0 and 100', () => {
    const result = calculateAgencyCompleteness(makeAgency());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('reports missing fields correctly', () => {
    const result = calculateAgencyCompleteness(makeAgency());
    expect(result.missing).toContain('Description');
    expect(result.missing).toContain('Téléphone');
    expect(result.missing).toContain('Email');
    expect(result.missing).toContain('Logo');
  });
});
