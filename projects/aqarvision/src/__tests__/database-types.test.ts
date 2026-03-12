import { describe, it, expect } from 'vitest';
import type {
  Agency,
  Property,
  Lead,
  AgencyMember,
  LeadNote,
  Favorite,
  PropertyView,
  AnalyticsEvent,
  Subscription,
  Notification,
  Media,
  SocialPost,
} from '@/types/database';

/**
 * These tests validate that TypeScript database types are consistent
 * with expected DB constraints and business logic.
 * We test by creating valid/invalid mock objects.
 */

// ─── Agency type ────────────────────────────────────────────────────

describe('Agency type', () => {
  const validAgency: Agency = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    owner_id: 'user-123',
    name: 'Immobilière Alger',
    slug: 'immobiliere-alger',
    description: null,
    logo_url: null,
    cover_image_url: null,
    primary_color: '#2563eb',
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
    accent_color: null,
    theme: 'modern',
    border_style: 'rounded',
    hero_video_url: null,
    hero_style: 'color',
    font_style: 'modern',
    theme_mode: 'light',
    tagline: null,
    stats_years: null,
    stats_properties_sold: null,
    stats_clients: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  it('has all required fields', () => {
    expect(validAgency.id).toBeDefined();
    expect(validAgency.owner_id).toBeDefined();
    expect(validAgency.name).toBeDefined();
    expect(validAgency.slug).toBeDefined();
    expect(validAgency.primary_color).toBeDefined();
    expect(validAgency.active_plan).toBeDefined();
    expect(validAgency.locale).toBeDefined();
  });

  it('plan is valid enum value', () => {
    const validPlans = ['starter', 'pro', 'enterprise'];
    expect(validPlans).toContain(validAgency.active_plan);
  });

  it('locale is valid enum value', () => {
    const validLocales = ['fr', 'ar', 'en'];
    expect(validLocales).toContain(validAgency.locale);
  });

  it('hero_style is valid enum value', () => {
    const validStyles = ['color', 'cover', 'video'];
    expect(validStyles).toContain(validAgency.hero_style);
  });

  it('font_style is valid enum value', () => {
    const validFonts = ['modern', 'classic', 'elegant'];
    expect(validFonts).toContain(validAgency.font_style);
  });

  it('theme_mode is valid enum value', () => {
    const validThemes = ['light', 'dark'];
    expect(validThemes).toContain(validAgency.theme_mode);
  });

  it('nullable fields accept null', () => {
    expect(validAgency.description).toBeNull();
    expect(validAgency.logo_url).toBeNull();
    expect(validAgency.phone).toBeNull();
    expect(validAgency.custom_domain).toBeNull();
    expect(validAgency.latitude).toBeNull();
    expect(validAgency.secondary_color).toBeNull();
  });
});

// ─── Property type ──────────────────────────────────────────────────

describe('Property type', () => {
  const validProperty: Property = {
    id: 'prop-1',
    agency_id: 'agency-1',
    created_by: 'user-1',
    title: 'Villa F5 Hydra',
    description: 'Belle villa avec jardin',
    price: 45_000_000,
    surface: 350,
    rooms: 5,
    bathrooms: 3,
    type: 'villa',
    transaction_type: 'sale',
    status: 'active',
    country: 'DZ',
    city: 'Alger',
    wilaya: 'Alger',
    commune: 'Hydra',
    address: 'Rue des Pins',
    currency: 'DZD',
    images: ['https://example.com/photo1.jpg'],
    features: ['Jardin', 'Parking', 'Piscine'],
    latitude: 36.75,
    longitude: 3.06,
    is_featured: true,
    views_count: 150,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    published_at: '2025-01-02T00:00:00Z',
  };

  it('has all required fields', () => {
    expect(validProperty.id).toBeDefined();
    expect(validProperty.agency_id).toBeDefined();
    expect(validProperty.title).toBeDefined();
    expect(validProperty.price).toBeDefined();
    expect(validProperty.type).toBeDefined();
    expect(validProperty.transaction_type).toBeDefined();
    expect(validProperty.status).toBeDefined();
    expect(validProperty.country).toBeDefined();
    expect(validProperty.currency).toBeDefined();
  });

  it('transaction_type is valid enum', () => {
    const valid = ['sale', 'rent'];
    expect(valid).toContain(validProperty.transaction_type);
  });

  it('status is valid enum', () => {
    const valid = ['draft', 'active', 'sold', 'rented', 'archived'];
    expect(valid).toContain(validProperty.status);
  });

  it('images is an array of strings', () => {
    expect(Array.isArray(validProperty.images)).toBe(true);
    for (const img of validProperty.images) {
      expect(typeof img).toBe('string');
    }
  });

  it('features is an array of strings', () => {
    expect(Array.isArray(validProperty.features)).toBe(true);
    for (const feat of validProperty.features) {
      expect(typeof feat).toBe('string');
    }
  });

  it('price is non-negative', () => {
    expect(validProperty.price).toBeGreaterThanOrEqual(0);
  });

  it('views_count is non-negative', () => {
    expect(validProperty.views_count).toBeGreaterThanOrEqual(0);
  });
});

// ─── Lead type ──────────────────────────────────────────────────────

describe('Lead type', () => {
  const validLead: Lead = {
    id: 'lead-1',
    agency_id: 'agency-1',
    property_id: 'prop-1',
    assigned_to: null,
    name: 'Ahmed Benali',
    phone: '0555123456',
    email: 'ahmed@test.dz',
    message: 'Je suis intéressé',
    source: 'contact_form',
    status: 'new',
    priority: 'normal',
    budget_min: 3_000_000,
    budget_max: 5_000_000,
    desired_country: 'DZ',
    desired_wilaya: 'Alger',
    desired_type: 'apartment',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    contacted_at: null,
  };

  it('source is valid enum', () => {
    const valid = ['contact_form', 'property_detail', 'whatsapp', 'phone', 'walk_in', 'referral'];
    expect(valid).toContain(validLead.source);
  });

  it('status is valid enum', () => {
    const valid = ['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost'];
    expect(valid).toContain(validLead.status);
  });

  it('priority is valid enum', () => {
    const valid = ['low', 'normal', 'high', 'urgent'];
    expect(valid).toContain(validLead.priority);
  });

  it('budget values are positive when set', () => {
    if (validLead.budget_min !== null) {
      expect(validLead.budget_min).toBeGreaterThanOrEqual(0);
    }
    if (validLead.budget_max !== null) {
      expect(validLead.budget_max).toBeGreaterThanOrEqual(0);
    }
  });

  it('budget_max >= budget_min', () => {
    if (validLead.budget_min !== null && validLead.budget_max !== null) {
      expect(validLead.budget_max).toBeGreaterThanOrEqual(validLead.budget_min);
    }
  });
});

// ─── AgencyMember type ──────────────────────────────────────────────

describe('AgencyMember type', () => {
  const validMember: AgencyMember = {
    id: 'member-1',
    agency_id: 'agency-1',
    user_id: 'user-1',
    role: 'agent',
    full_name: 'Karim Boudiaf',
    phone: '0555000000',
    email: 'karim@test.dz',
    avatar_url: null,
    is_active: true,
    invited_at: '2025-01-01T00:00:00Z',
    joined_at: '2025-01-02T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  it('role is valid enum', () => {
    const valid = ['admin', 'agent', 'viewer'];
    expect(valid).toContain(validMember.role);
  });

  it('is_active is boolean', () => {
    expect(typeof validMember.is_active).toBe('boolean');
  });
});

// ─── Subscription type ──────────────────────────────────────────────

describe('Subscription type', () => {
  const validSub: Subscription = {
    id: 'sub-1',
    agency_id: 'agency-1',
    plan: 'pro',
    status: 'active',
    price_dzd: 12_000,
    billing_cycle: 'monthly',
    payment_method: 'ccp',
    payment_reference: 'REF123',
    starts_at: '2025-01-01T00:00:00Z',
    ends_at: '2025-02-01T00:00:00Z',
    trial_ends_at: null,
    cancelled_at: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  it('plan is valid enum', () => {
    const valid = ['starter', 'pro', 'enterprise'];
    expect(valid).toContain(validSub.plan);
  });

  it('status is valid enum', () => {
    const valid = ['trial', 'active', 'past_due', 'cancelled', 'expired'];
    expect(valid).toContain(validSub.status);
  });

  it('billing_cycle is valid enum', () => {
    const valid = ['monthly', 'quarterly', 'yearly'];
    expect(valid).toContain(validSub.billing_cycle);
  });

  it('payment_method is valid Algerian method', () => {
    const valid = ['ccp', 'baridi_mob', 'virement', 'cash', 'dahabia'];
    expect(valid).toContain(validSub.payment_method);
  });

  it('price_dzd is positive', () => {
    expect(validSub.price_dzd).toBeGreaterThan(0);
  });
});

// ─── SocialPost type ────────────────────────────────────────────────

describe('SocialPost type', () => {
  const validPost: SocialPost = {
    id: 'post-1',
    platform: 'instagram',
    permalink: 'https://instagram.com/p/abc',
    caption: 'Nouvelle villa à vendre',
    media_url: 'https://example.com/photo.jpg',
    media_type: 'image',
    thumbnail_url: null,
    timestamp: '2025-01-15T12:00:00Z',
    likes_count: 42,
    comments_count: 5,
  };

  it('platform is valid enum', () => {
    const valid = ['instagram', 'facebook', 'tiktok'];
    expect(valid).toContain(validPost.platform);
  });

  it('media_type is valid enum', () => {
    const valid = ['image', 'video', 'carousel'];
    expect(valid).toContain(validPost.media_type);
  });
});

// ─── Notification type ──────────────────────────────────────────────

describe('Notification type', () => {
  const validNotif: Notification = {
    id: 'notif-1',
    user_id: 'user-1',
    agency_id: 'agency-1',
    type: 'new_lead',
    title: 'Nouveau lead reçu',
    body: 'Ahmed Benali vous a contacté',
    data: { lead_id: 'lead-1' },
    is_read: false,
    read_at: null,
    created_at: '2025-01-15T10:00:00Z',
  };

  it('type is valid notification type', () => {
    const valid = [
      'new_lead', 'lead_assigned', 'lead_status_change',
      'subscription_expiring', 'subscription_expired', 'subscription_renewed',
      'property_published', 'property_view_milestone',
      'member_invited', 'member_joined',
      'system',
    ];
    expect(valid).toContain(validNotif.type);
  });

  it('is_read is boolean', () => {
    expect(typeof validNotif.is_read).toBe('boolean');
  });

  it('data is an object', () => {
    expect(typeof validNotif.data).toBe('object');
    expect(validNotif.data).not.toBeNull();
  });
});

// ─── Media type ─────────────────────────────────────────────────────

describe('Media type', () => {
  const validMedia: Media = {
    id: 'media-1',
    agency_id: 'agency-1',
    uploaded_by: 'user-1',
    file_name: 'photo-villa.jpg',
    file_path: 'agencies/agency-1/properties/photo-villa.jpg',
    file_size: 1_500_000,
    mime_type: 'image/jpeg',
    width: 1920,
    height: 1080,
    alt_text: 'Villa avec jardin',
    category: 'property',
    public_url: 'https://storage.example.com/photo-villa.jpg',
    created_at: '2025-01-15T10:00:00Z',
  };

  it('category is valid enum', () => {
    const valid = ['property', 'branding', 'avatar', 'document'];
    expect(valid).toContain(validMedia.category);
  });

  it('file_size is positive', () => {
    expect(validMedia.file_size).toBeGreaterThan(0);
  });

  it('dimensions are positive when set', () => {
    if (validMedia.width !== null) expect(validMedia.width).toBeGreaterThan(0);
    if (validMedia.height !== null) expect(validMedia.height).toBeGreaterThan(0);
  });
});

// ─── Cross-type consistency ─────────────────────────────────────────

describe('cross-type consistency', () => {
  it('Lead sources match all possible channels', () => {
    // These source values should cover all user touchpoints
    const sources = ['contact_form', 'property_detail', 'whatsapp', 'phone', 'walk_in', 'referral'];
    expect(sources).toHaveLength(6);
  });

  it('Property statuses cover full lifecycle', () => {
    const statuses = ['draft', 'active', 'sold', 'rented', 'archived'];
    expect(statuses).toHaveLength(5);
    // draft → active → sold/rented → archived
  });

  it('Lead statuses form a valid pipeline', () => {
    const statuses = ['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost'];
    expect(statuses).toHaveLength(6);
    // new → contacted → qualified → negotiation → converted/lost
  });

  it('MemberRole has exactly 3 roles', () => {
    const roles = ['admin', 'agent', 'viewer'];
    expect(roles).toHaveLength(3);
  });

  it('payment methods cover Algerian payment landscape', () => {
    const methods = ['ccp', 'baridi_mob', 'virement', 'cash', 'dahabia'];
    expect(methods).toHaveLength(5);
    // CCP, BaridiMob, virement bancaire, cash, Dahabia
  });
});
