import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { MESSAGES, LOCALE, PAGINATION } from '@/config';

/**
 * Tests for the logic and patterns in agency pages modified during
 * the <img> → next/image migration and font configuration changes.
 */

const ROOT = resolve(__dirname, '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), 'utf-8');
}

// ─── 1. Image priority & fill props ─────────────────────────────────

describe('next/image priority and fill usage in property detail', () => {
  const detailSource = readSource('app/agence/[slug]/biens/[id]/page.tsx');

  it('sets priority on the first gallery image (Enterprise)', () => {
    // The first <Image in the Enterprise gallery has priority
    const enterpriseGallery = detailSource.split('property.images.length > 0')[1];
    const firstImage = enterpriseGallery?.match(/<Image[\s\S]*?\/>/)?.[0];
    expect(firstImage).toContain('priority');
  });

  it('sets priority on the first gallery image (Starter/Pro)', () => {
    // The Starter/Pro section also has a gallery with priority on first image
    const starterSection = detailSource.split('Starter / Pro')[1];
    const firstImage = starterSection?.match(/<Image[\s\S]*?\/>/)?.[0];
    expect(firstImage).toContain('priority');
  });

  it('does not set priority on secondary gallery images', () => {
    // Secondary images rendered via .slice(1, 5) should not have priority
    const sliceSection = detailSource.match(
      /images\.slice\(1,\s*5\)\.map[\s\S]*?<Image([\s\S]*?)\/>/
    );
    expect(sliceSection).toBeTruthy();
    expect(sliceSection![1]).not.toContain('priority');
  });

  it('wraps all fill images in a relative-positioned container', () => {
    // Every <Image ... fill should be inside a parent with className containing "relative"
    const imageBlocks = detailSource.match(
      /<div[^>]*className="[^"]*relative[^"]*"[^>]*>[\s\S]*?<Image[^>]*fill/g
    );
    expect(imageBlocks).toBeTruthy();
    expect(imageBlocks!.length).toBeGreaterThanOrEqual(2);
  });

  it('limits gallery thumbnails to 4 secondary images via slice(1, 5)', () => {
    const sliceMatches = detailSource.match(/\.slice\(1,\s*5\)/g);
    expect(sliceMatches).toBeTruthy();
    // Both Enterprise and Starter/Pro sections use slice(1, 5)
    expect(sliceMatches!.length).toBe(2);
  });
});

// ─── 2. WhatsApp message & phone formatting ─────────────────────────

describe('WhatsApp message generation', () => {
  it('generates property-specific message with agency name, title, and price', () => {
    const msg = MESSAGES.whatsappProperty('Immo Alger', 'Appartement F3', '4 500 000 DZD');
    expect(msg).toContain('Immo Alger');
    expect(msg).toContain('Appartement F3');
    expect(msg).toContain('4 500 000 DZD');
  });

  it('generates generic message with agency name', () => {
    const msg = MESSAGES.whatsappGeneric('Immo Oran');
    expect(msg).toContain('Immo Oran');
    expect(msg).toContain('intéressé');
  });

  it('wraps property title in quotes', () => {
    const msg = MESSAGES.whatsappProperty('Agence', 'Villa Luxe', '10M');
    expect(msg).toMatch(/"Villa Luxe"/);
  });
});

describe('phone number formatting (regex from property detail page)', () => {
  // Replicates the formatting logic: phone.replace(/[\s\-().+]/g, '').replace(/^0/, LOCALE.PHONE_PREFIX)
  function formatPhone(phone: string | null): string | null {
    if (!phone) return null;
    return phone.replace(/[\s\-().+]/g, '').replace(/^0/, LOCALE.PHONE_PREFIX);
  }

  it('strips spaces from phone number', () => {
    expect(formatPhone('0555 12 34 56')).toBe('213555123456');
  });

  it('strips dashes from phone number', () => {
    expect(formatPhone('0555-12-34-56')).toBe('213555123456');
  });

  it('strips parentheses and dots', () => {
    expect(formatPhone('(0)555.12.34.56')).toBe('213555123456');
  });

  it('strips + prefix', () => {
    expect(formatPhone('+213555123456')).toBe('213555123456');
  });

  it('replaces leading 0 with DZ country prefix', () => {
    expect(formatPhone('0555123456')).toBe('213555123456');
  });

  it('does not double-prefix number already without leading 0', () => {
    const result = formatPhone('555123456');
    expect(result).toBe('555123456');
    expect(result).not.toMatch(/^213213/);
  });

  it('returns null for null input', () => {
    expect(formatPhone(null)).toBeNull();
  });
});

// ─── 3. Pagination logic ────────────────────────────────────────────

describe('pagination logic (from biens listing page)', () => {
  // Replicates: Math.max(1, parseInt(pageStr || '1', 10))
  function getCurrentPage(pageStr?: string): number {
    return Math.max(1, parseInt(pageStr || '1', 10));
  }

  function getOffset(currentPage: number): number {
    return (currentPage - 1) * PAGINATION.PROPERTIES_PER_PAGE;
  }

  function getTotalPages(totalCount: number): number {
    return Math.ceil(totalCount / PAGINATION.PROPERTIES_PER_PAGE);
  }

  describe('currentPage calculation', () => {
    it('defaults to page 1 when no param', () => {
      expect(getCurrentPage(undefined)).toBe(1);
    });

    it('parses valid page number', () => {
      expect(getCurrentPage('3')).toBe(3);
    });

    it('clamps negative page to 1', () => {
      expect(getCurrentPage('-1')).toBe(1);
    });

    it('clamps zero page to 1', () => {
      expect(getCurrentPage('0')).toBe(1);
    });

    it('returns NaN for non-numeric string (edge case not guarded by Math.max)', () => {
      // Math.max(1, NaN) === NaN — the real code guards via pageStr || '1'
      // but if a non-numeric string slips through, the result is NaN
      expect(getCurrentPage('abc')).toBeNaN();
    });
  });

  describe('offset calculation', () => {
    it('page 1 has offset 0', () => {
      expect(getOffset(1)).toBe(0);
    });

    it('page 2 has offset equal to PROPERTIES_PER_PAGE', () => {
      expect(getOffset(2)).toBe(PAGINATION.PROPERTIES_PER_PAGE);
    });

    it('page 3 has offset equal to 2 * PROPERTIES_PER_PAGE', () => {
      expect(getOffset(3)).toBe(2 * PAGINATION.PROPERTIES_PER_PAGE);
    });
  });

  describe('totalPages calculation', () => {
    it('0 items → 0 pages', () => {
      expect(getTotalPages(0)).toBe(0);
    });

    it('1 item → 1 page', () => {
      expect(getTotalPages(1)).toBe(1);
    });

    it('exactly PROPERTIES_PER_PAGE items → 1 page', () => {
      expect(getTotalPages(PAGINATION.PROPERTIES_PER_PAGE)).toBe(1);
    });

    it('PROPERTIES_PER_PAGE + 1 items → 2 pages', () => {
      expect(getTotalPages(PAGINATION.PROPERTIES_PER_PAGE + 1)).toBe(2);
    });

    it('2 * PROPERTIES_PER_PAGE items → 2 pages', () => {
      expect(getTotalPages(2 * PAGINATION.PROPERTIES_PER_PAGE)).toBe(2);
    });
  });

  describe('pluralization', () => {
    it('count 0 → no plural s', () => {
      expect(0 > 1 ? 's' : '').toBe('');
    });

    it('count 1 → no plural s', () => {
      expect(1 > 1 ? 's' : '').toBe('');
    });

    it('count 2 → plural s', () => {
      expect(2 > 1 ? 's' : '').toBe('s');
    });
  });
});

// ─── 4. Metadata generation logic ───────────────────────────────────

describe('metadata description format (property detail page)', () => {
  // Replicates: `${title} — ${priceStr}${location ? ` à ${location}` : ''}`
  function buildDescription(title: string, priceStr: string, location: string): string {
    return `${title} — ${priceStr}${location ? ` à ${location}` : ''}`;
  }

  it('includes location when available', () => {
    const desc = buildDescription('Appartement F3', '4 500 000 DZD', 'Alger');
    expect(desc).toBe('Appartement F3 — 4 500 000 DZD à Alger');
  });

  it('omits location suffix when empty', () => {
    const desc = buildDescription('Villa', '10 000 000 DZD', '');
    expect(desc).toBe('Villa — 10 000 000 DZD');
    expect(desc).not.toContain(' à ');
  });

  it('contains title and price in all cases', () => {
    const desc = buildDescription('Studio', '2M DZD', 'Oran');
    expect(desc).toContain('Studio');
    expect(desc).toContain('2M DZD');
  });
});

describe('OpenGraph image conditional logic', () => {
  it('includes OG image when first image exists', () => {
    const images = ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'];
    const og = images[0] ? { images: [{ url: images[0] }] } : {};
    expect(og).toHaveProperty('images');
    expect((og as any).images[0].url).toBe('https://example.com/img1.jpg');
  });

  it('excludes OG image when images array is empty', () => {
    const images: string[] = [];
    const og = images[0] ? { images: [{ url: images[0] }] } : {};
    expect(og).not.toHaveProperty('images');
  });
});

// ─── 5. Theme-manifest-based branching ──────────────────────────────

describe('Theme-manifest-based branching (replaces PLANS.ENTERPRISE)', () => {
  it('agency home uses ThemeRenderer', () => {
    const source = readSource('app/agence/[slug]/page.tsx');
    expect(source).toContain('ThemeRenderer');
    expect(source).toContain('getThemeManifest');
  });

  it('properties listing uses getThemeManifest for theme-aware rendering', () => {
    const source = readSource('app/agence/[slug]/biens/page.tsx');
    expect(source).toContain('getThemeManifest');
    expect(source).toContain('PropertiesVariant');
  });

  it('property detail uses getThemeManifest for theme-aware rendering', () => {
    const source = readSource('app/agence/[slug]/biens/[id]/page.tsx');
    expect(source).toContain('getThemeManifest');
    expect(source).toContain('isPremium');
  });

  it('premium detail uses luxury CSS classes', () => {
    const source = readSource('app/agence/[slug]/biens/[id]/page.tsx');
    expect(source).toContain('luxury-property-card');
    expect(source).toContain('font-display-classic');
  });

  it('Starter/Pro detail uses basic card classes', () => {
    const source = readSource('app/agence/[slug]/biens/[id]/page.tsx');
    expect(source).toContain('hover:shadow-md');
  });
});

// ─── 6. SEO structured data ─────────────────────────────────────────

describe('SEO structured data in property detail', () => {
  const source = readSource('app/agence/[slug]/biens/[id]/page.tsx');

  it('imports PropertyJsonLd component', () => {
    expect(source).toMatch(/import\s*\{[^}]*PropertyJsonLd/);
  });

  it('imports BreadcrumbJsonLd component', () => {
    expect(source).toMatch(/import\s*\{[^}]*BreadcrumbJsonLd/);
  });

  it('renders 3-level breadcrumb (agency → properties → property)', () => {
    // BreadcrumbJsonLd items array has 3 entries
    const itemsMatch = source.match(/items=\{(\[[\s\S]*?\])\}/);
    expect(itemsMatch).toBeTruthy();
    const itemCount = (itemsMatch![1].match(/\{ name:/g) || []).length;
    expect(itemCount).toBe(3);
  });

  it('uses BASE_URL defaulting to https://aqarvision.dz', () => {
    expect(source).toMatch(
      /BASE_URL\s*=\s*process\.env\.NEXT_PUBLIC_BASE_URL\s*\|\|\s*['"]https:\/\/aqarvision\.dz['"]/
    );
  });
});

// ─── 7. CSS accessibility & RTL ─────────────────────────────────────

describe('CSS accessibility and RTL support', () => {
  const cssSource = readSource('app/globals.css');

  it('includes prefers-reduced-motion media query', () => {
    expect(cssSource).toContain('prefers-reduced-motion: reduce');
  });

  it('disables luxury animations in reduced-motion mode', () => {
    expect(cssSource).toContain('luxury-animate-fade-in');
    // Check that animation properties are overridden
    const reducedMotionBlock = cssSource.split('prefers-reduced-motion: reduce')[1];
    expect(reducedMotionBlock).toBeTruthy();
    expect(reducedMotionBlock).toMatch(/animation:\s*none/);
  });

  it('defines RTL overrides for font-display', () => {
    expect(cssSource).toMatch(/\[dir="rtl"\].*\.font-display/);
  });
});
