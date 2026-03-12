import { describe, it, expect } from 'vitest';
import {
  THEME_REGISTRY,
  ALL_THEME_IDS,
  getThemeManifest,
  getAvailableThemes,
  isThemeAvailable,
  THEMES_PER_PLAN,
  type ThemeId,
} from '@/lib/themes/registry';
import { validateThemeForPlan, themeIdSchema, themeWithPlanSchema } from '@/lib/validators/theme';

describe('Theme Registry', () => {
  it('has exactly 7 themes', () => {
    expect(ALL_THEME_IDS).toHaveLength(7);
  });

  it('has expected theme IDs', () => {
    expect(ALL_THEME_IDS).toContain('minimal');
    expect(ALL_THEME_IDS).toContain('modern');
    expect(ALL_THEME_IDS).toContain('professional');
    expect(ALL_THEME_IDS).toContain('editorial');
    expect(ALL_THEME_IDS).toContain('premium');
    expect(ALL_THEME_IDS).toContain('luxury');
    expect(ALL_THEME_IDS).toContain('bold');
  });

  it('each theme has complete manifest', () => {
    for (const id of ALL_THEME_IDS) {
      const manifest = THEME_REGISTRY[id];
      expect(manifest.id).toBe(id);
      expect(manifest.name.fr).toBeTruthy();
      expect(manifest.name.ar).toBeTruthy();
      expect(manifest.name.en).toBeTruthy();
      expect(manifest.description.fr).toBeTruthy();
      expect(manifest.planMin).toMatch(/^(starter|pro|enterprise)$/);
      expect(manifest.sections.length).toBeGreaterThan(0);
      expect(manifest.layout.header).toBeTruthy();
      expect(manifest.layout.footer).toBeTruthy();
      expect(manifest.style.fontFamily).toMatch(/^(modern|classic|elegant)$/);
      expect(manifest.style.borderStyle).toMatch(/^(rounded|square)$/);
      expect(manifest.style.themeMode).toMatch(/^(light|dark)$/);
      expect(manifest.style.defaultColors.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(manifest.style.defaultColors.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('sections are ordered sequentially', () => {
    for (const id of ALL_THEME_IDS) {
      const manifest = THEME_REGISTRY[id];
      const orders = manifest.sections.map((s) => s.order);
      const sorted = [...orders].sort((a, b) => a - b);
      expect(orders).toEqual(sorted);
    }
  });

  it('each theme has hero and properties sections', () => {
    for (const id of ALL_THEME_IDS) {
      const manifest = THEME_REGISTRY[id];
      const sectionIds = manifest.sections.map((s) => s.id);
      expect(sectionIds).toContain('hero');
      expect(sectionIds).toContain('properties');
    }
  });
});

describe('Plan Gating', () => {
  it('Starter gets 2 themes', () => {
    expect(THEMES_PER_PLAN.starter).toBe(2);
  });

  it('Pro gets 5 themes', () => {
    expect(THEMES_PER_PLAN.pro).toBe(5);
  });

  it('Enterprise gets all 7 themes', () => {
    expect(THEMES_PER_PLAN.enterprise).toBe(7);
  });

  it('Starter themes are minimal and modern', () => {
    const starterThemes = getAvailableThemes('starter');
    const ids = starterThemes.map((t) => t.id);
    expect(ids).toContain('minimal');
    expect(ids).toContain('modern');
    expect(ids).not.toContain('luxury');
    expect(ids).not.toContain('professional');
  });

  it('Pro includes Starter themes plus professional, editorial, premium', () => {
    const proThemes = getAvailableThemes('pro');
    const ids = proThemes.map((t) => t.id);
    expect(ids).toContain('minimal');
    expect(ids).toContain('modern');
    expect(ids).toContain('professional');
    expect(ids).toContain('editorial');
    expect(ids).toContain('premium');
    expect(ids).not.toContain('luxury');
    expect(ids).not.toContain('bold');
  });

  it('Enterprise includes all themes', () => {
    const enterpriseThemes = getAvailableThemes('enterprise');
    expect(enterpriseThemes).toHaveLength(7);
  });

  it('isThemeAvailable returns correct results', () => {
    expect(isThemeAvailable('minimal', 'starter')).toBe(true);
    expect(isThemeAvailable('luxury', 'starter')).toBe(false);
    expect(isThemeAvailable('luxury', 'enterprise')).toBe(true);
    expect(isThemeAvailable('professional', 'starter')).toBe(false);
    expect(isThemeAvailable('professional', 'pro')).toBe(true);
    expect(isThemeAvailable('nonexistent', 'enterprise')).toBe(false);
  });
});

describe('getThemeManifest', () => {
  it('returns the correct manifest for known theme', () => {
    const manifest = getThemeManifest('luxury');
    expect(manifest.id).toBe('luxury');
    expect(manifest.planMin).toBe('enterprise');
  });

  it('falls back to modern for unknown theme', () => {
    const manifest = getThemeManifest('nonexistent');
    expect(manifest.id).toBe('modern');
  });

  it('falls back to modern for empty string', () => {
    const manifest = getThemeManifest('');
    expect(manifest.id).toBe('modern');
  });
});

describe('Theme Validators', () => {
  it('themeIdSchema accepts valid theme IDs', () => {
    expect(themeIdSchema.safeParse('minimal').success).toBe(true);
    expect(themeIdSchema.safeParse('luxury').success).toBe(true);
    expect(themeIdSchema.safeParse('custom').success).toBe(true);
  });

  it('themeIdSchema rejects invalid theme IDs', () => {
    expect(themeIdSchema.safeParse('invalid').success).toBe(false);
    expect(themeIdSchema.safeParse('').success).toBe(false);
  });

  it('validateThemeForPlan allows custom for any plan', () => {
    expect(validateThemeForPlan('custom', 'starter')).toEqual({ valid: true });
    expect(validateThemeForPlan('custom', 'enterprise')).toEqual({ valid: true });
  });

  it('validateThemeForPlan rejects locked themes', () => {
    const result = validateThemeForPlan('luxury', 'starter');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('validateThemeForPlan accepts available themes', () => {
    expect(validateThemeForPlan('minimal', 'starter')).toEqual({ valid: true });
    expect(validateThemeForPlan('professional', 'pro')).toEqual({ valid: true });
    expect(validateThemeForPlan('luxury', 'enterprise')).toEqual({ valid: true });
  });

  it('themeWithPlanSchema validates correctly', () => {
    expect(themeWithPlanSchema.safeParse({ theme: 'minimal', plan: 'starter' }).success).toBe(true);
    expect(themeWithPlanSchema.safeParse({ theme: 'luxury', plan: 'starter' }).success).toBe(false);
    expect(themeWithPlanSchema.safeParse({ theme: 'custom', plan: 'starter' }).success).toBe(true);
  });
});
