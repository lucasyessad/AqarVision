import { describe, it, expect } from 'vitest';
import { getTranslations, isRtlLocale, getLocaleAttrs } from '@/lib/i18n';

describe('getTranslations', () => {
  it('returns French translations by default', () => {
    const t = getTranslations('fr');
    expect(t('nav.home')).toBe('Accueil');
    expect(t('nav.properties')).toBe('Biens');
  });

  it('returns Arabic translations', () => {
    const t = getTranslations('ar');
    expect(t('nav.home')).toBe('الرئيسية');
  });

  it('returns English translations', () => {
    const t = getTranslations('en');
    expect(t('nav.home')).toBe('Home');
    expect(t('nav.properties')).toBe('Properties');
  });

  it('interpolates params', () => {
    const t = getTranslations('fr');
    expect(t('about.heading', { name: 'Test' })).toBe('À propos de Test');
  });

  it('interpolates params in English', () => {
    const t = getTranslations('en');
    expect(t('about.heading', { name: 'Test' })).toBe('About Test');
  });
});

describe('isRtlLocale', () => {
  it('returns true for Arabic', () => {
    expect(isRtlLocale('ar')).toBe(true);
  });

  it('returns false for French', () => {
    expect(isRtlLocale('fr')).toBe(false);
  });

  it('returns false for English', () => {
    expect(isRtlLocale('en')).toBe(false);
  });
});

describe('getLocaleAttrs', () => {
  it('returns RTL attrs for Arabic', () => {
    expect(getLocaleAttrs('ar')).toEqual({ dir: 'rtl', lang: 'ar-DZ' });
  });

  it('returns LTR attrs for French', () => {
    expect(getLocaleAttrs('fr')).toEqual({ dir: 'ltr', lang: 'fr-DZ' });
  });

  it('returns LTR attrs for English', () => {
    expect(getLocaleAttrs('en')).toEqual({ dir: 'ltr', lang: 'en' });
  });
});
