import { describe, it, expect } from 'vitest';
import {
  STORAGE,
  MESSAGES,
  UI,
  SOCIAL_EMBED,
  SOCIAL_API,
  TIMEOUTS,
  PLAN_CONFIGS,
  TRIAL_DURATION_DAYS,
  getPlanConfig,
  getPlanPrice,
  getBillingDiscount,
} from '@/config';

// ─── STORAGE ────────────────────────────────────────────────────────

describe('STORAGE', () => {
  it('has a bucket name', () => {
    expect(STORAGE.BUCKET).toBe('agencies');
  });

  it('generates correct cover path', () => {
    const path = STORAGE.coverPath('agency-123', 'jpg');
    expect(path).toBe('agency-123/branding/cover.jpg');
  });

  it('generates correct logo path', () => {
    const path = STORAGE.logoPath('agency-123', 'png');
    expect(path).toBe('agency-123/branding/logo.png');
  });

  it('generates correct branding directory', () => {
    const dir = STORAGE.brandingDir('agency-123');
    expect(dir).toBe('agency-123/branding');
  });

  it('handles different extensions correctly', () => {
    expect(STORAGE.coverPath('id', 'webp')).toContain('cover.webp');
    expect(STORAGE.logoPath('id', 'svg')).toContain('logo.svg');
    expect(STORAGE.coverPath('id', 'jpeg')).toContain('cover.jpeg');
  });

  it('paths are consistent with branding directory', () => {
    const id = 'test-agency';
    const dir = STORAGE.brandingDir(id);
    const cover = STORAGE.coverPath(id, 'jpg');
    const logo = STORAGE.logoPath(id, 'png');
    expect(cover.startsWith(dir)).toBe(true);
    expect(logo.startsWith(dir)).toBe(true);
  });
});

// ─── MESSAGES ───────────────────────────────────────────────────────

describe('MESSAGES', () => {
  it('generates generic WhatsApp message with agency name', () => {
    const msg = MESSAGES.whatsappGeneric('Agence Luxe');
    expect(msg).toContain('Agence Luxe');
    expect(msg).toContain('intéressé');
  });

  it('generates property-specific WhatsApp message', () => {
    const msg = MESSAGES.whatsappProperty('Agence Luxe', 'Villa F5', '15 000 000 DA');
    expect(msg).toContain('Agence Luxe');
    expect(msg).toContain('Villa F5');
    expect(msg).toContain('15 000 000 DA');
  });

  it('handles special characters in agency name', () => {
    const msg = MESSAGES.whatsappGeneric("L'Agence d'Or");
    expect(msg).toContain("L'Agence d'Or");
  });

  it('handles empty property details gracefully', () => {
    const msg = MESSAGES.whatsappProperty('Test', '', '');
    expect(msg).toContain('Test');
    expect(typeof msg).toBe('string');
  });
});

// ─── UI ──────────────────────────────────────────────────────────────

describe('UI', () => {
  it('has positive header scroll threshold', () => {
    expect(UI.HEADER_SCROLL_THRESHOLD).toBeGreaterThan(0);
  });

  it('has positive counter animation duration', () => {
    expect(UI.COUNTER_ANIMATION_MS).toBeGreaterThan(0);
  });

  it('has valid observer threshold (0-1)', () => {
    expect(UI.OBSERVER_THRESHOLD).toBeGreaterThanOrEqual(0);
    expect(UI.OBSERVER_THRESHOLD).toBeLessThanOrEqual(1);
  });

  it('has a valid observer root margin string', () => {
    expect(UI.OBSERVER_ROOT_MARGIN).toMatch(/^-?\d+px/);
  });
});

// ─── SOCIAL_EMBED ───────────────────────────────────────────────────

describe('SOCIAL_EMBED', () => {
  it('generates Instagram embed URL', () => {
    const url = SOCIAL_EMBED.INSTAGRAM('luxury_realty');
    expect(url).toContain('instagram.com');
    expect(url).toContain('luxury_realty');
    expect(url).toContain('embed');
  });

  it('generates Facebook page embed URL', () => {
    const url = SOCIAL_EMBED.FACEBOOK_PAGE('https://facebook.com/agence');
    expect(url).toContain('facebook.com/plugins/page');
    expect(url).toContain('agence');
  });

  it('generates TikTok embed URL', () => {
    const url = SOCIAL_EMBED.TIKTOK('agency_dz');
    expect(url).toContain('tiktok.com');
    expect(url).toContain('agency_dz');
  });

  it('encodes Facebook URL properly', () => {
    const url = SOCIAL_EMBED.FACEBOOK_PAGE('https://facebook.com/page?ref=123');
    expect(url).toContain(encodeURIComponent('https://facebook.com/page?ref=123'));
  });
});

// ─── SOCIAL_API ─────────────────────────────────────────────────────

describe('SOCIAL_API', () => {
  it('has valid Instagram base URL', () => {
    expect(SOCIAL_API.INSTAGRAM_BASE).toMatch(/^https:\/\/graph\.instagram\.com$/);
  });

  it('has valid Facebook base URL', () => {
    expect(SOCIAL_API.FACEBOOK_BASE).toMatch(/^https:\/\/graph\.facebook\.com$/);
  });

  it('has versioned Facebook API', () => {
    expect(SOCIAL_API.FACEBOOK_API_VERSION).toMatch(/^v\d+\.\d+$/);
  });

  it('has valid TikTok base URL', () => {
    expect(SOCIAL_API.TIKTOK_BASE).toMatch(/^https:\/\/open\.tiktokapis\.com$/);
  });

  it('has versioned TikTok API', () => {
    expect(SOCIAL_API.TIKTOK_API_VERSION).toMatch(/^v\d+$/);
  });
});

// ─── TIMEOUTS ───────────────────────────────────────────────────────

describe('TIMEOUTS', () => {
  it('has a reasonable external API timeout', () => {
    expect(TIMEOUTS.EXTERNAL_API_MS).toBeGreaterThan(1000);
    expect(TIMEOUTS.EXTERNAL_API_MS).toBeLessThanOrEqual(30_000);
  });
});

// ─── TRIAL_DURATION_DAYS ────────────────────────────────────────────

describe('TRIAL_DURATION_DAYS', () => {
  it('is a positive number', () => {
    expect(TRIAL_DURATION_DAYS).toBeGreaterThan(0);
  });

  it('is 60 days', () => {
    expect(TRIAL_DURATION_DAYS).toBe(60);
  });
});

// ─── Plan pricing consistency ───────────────────────────────────────

describe('plan pricing consistency', () => {
  it('monthly < quarterly/3 (quarterly has discount)', () => {
    for (const plan of Object.values(PLAN_CONFIGS)) {
      const monthlyEquiv = plan.pricing.monthlyDZD * 3;
      expect(plan.pricing.quarterlyDZD).toBeLessThan(monthlyEquiv);
    }
  });

  it('monthly < yearly/12 (yearly has discount)', () => {
    for (const plan of Object.values(PLAN_CONFIGS)) {
      const monthlyEquiv = plan.pricing.monthlyDZD * 12;
      expect(plan.pricing.yearlyDZD).toBeLessThan(monthlyEquiv);
    }
  });

  it('starter < pro < enterprise pricing', () => {
    expect(PLAN_CONFIGS.starter.pricing.monthlyDZD).toBeLessThan(PLAN_CONFIGS.pro.pricing.monthlyDZD);
    expect(PLAN_CONFIGS.pro.pricing.monthlyDZD).toBeLessThan(PLAN_CONFIGS.enterprise.pricing.monthlyDZD);
  });

  it('getPlanPrice returns correct values for all cycles', () => {
    expect(getPlanPrice('starter', 'monthly')).toBe(PLAN_CONFIGS.starter.pricing.monthlyDZD);
    expect(getPlanPrice('pro', 'quarterly')).toBe(PLAN_CONFIGS.pro.pricing.quarterlyDZD);
    expect(getPlanPrice('enterprise', 'yearly')).toBe(PLAN_CONFIGS.enterprise.pricing.yearlyDZD);
  });

  it('getBillingDiscount returns correct percentages', () => {
    expect(getBillingDiscount('monthly')).toBe(0);
    expect(getBillingDiscount('quarterly')).toBe(10);
    expect(getBillingDiscount('yearly')).toBe(20);
  });

  it('getPlanConfig falls back to starter for unknown plan', () => {
    const config = getPlanConfig('unknown');
    expect(config.id).toBe('starter');
  });

  it('all plans have all required limit fields', () => {
    const requiredLimitKeys = [
      'maxProperties', 'maxLeadsPerMonth', 'maxMembers', 'maxStorageBytes',
      'luxuryBranding', 'customDomain', 'advancedAnalytics', 'exportLeads',
      'socialIntegration', 'featuredProperties',
    ];

    for (const plan of Object.values(PLAN_CONFIGS)) {
      for (const key of requiredLimitKeys) {
        expect(plan.limits).toHaveProperty(key);
      }
    }
  });

  it('plan limits increase with tier (properties)', () => {
    expect(PLAN_CONFIGS.starter.limits.maxProperties).toBeLessThan(PLAN_CONFIGS.pro.limits.maxProperties);
    expect(PLAN_CONFIGS.pro.limits.maxProperties).toBeLessThan(PLAN_CONFIGS.enterprise.limits.maxProperties);
  });

  it('plan limits increase with tier (members)', () => {
    expect(PLAN_CONFIGS.starter.limits.maxMembers).toBeLessThan(PLAN_CONFIGS.pro.limits.maxMembers);
    expect(PLAN_CONFIGS.pro.limits.maxMembers).toBeLessThan(PLAN_CONFIGS.enterprise.limits.maxMembers);
  });

  it('plan limits increase with tier (storage)', () => {
    expect(PLAN_CONFIGS.starter.limits.maxStorageBytes).toBeLessThan(PLAN_CONFIGS.pro.limits.maxStorageBytes);
    expect(PLAN_CONFIGS.pro.limits.maxStorageBytes).toBeLessThan(PLAN_CONFIGS.enterprise.limits.maxStorageBytes);
  });
});
