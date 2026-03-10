import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * These tests ensure that public-facing agency pages use next/image <Image>
 * instead of raw <img> tags, and that the root layout properly handles
 * custom Google Fonts loading.
 */

const ROOT = resolve(__dirname, '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), 'utf-8');
}

// ─── Agency pages: next/image compliance ─────────────────────────────

const AGENCY_PAGES = [
  'app/agence/[slug]/page.tsx',
  'app/agence/[slug]/biens/page.tsx',
  'app/agence/[slug]/biens/[id]/page.tsx',
] as const;

describe('next/image compliance in agency pages', () => {
  for (const pagePath of AGENCY_PAGES) {
    describe(pagePath, () => {
      const source = readSource(pagePath);

      it('imports Image from next/image', () => {
        expect(source).toMatch(/import\s+Image\s+from\s+['"]next\/image['"]/);
      });

      it('does not use raw <img> tags', () => {
        // Remove comments and strings to avoid false positives
        const withoutComments = source
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/{\/\*[\s\S]*?\*\/}/g, '');

        const imgTagMatch = withoutComments.match(/<img\s/g);
        expect(imgTagMatch).toBeNull();
      });

      it('uses <Image> component with fill prop for responsive images', () => {
        expect(source).toContain('<Image');
        expect(source).toMatch(/\bfill\b/);
      });
    });
  }
});

// ─── Root layout: font loading ───────────────────────────────────────

describe('root layout font configuration', () => {
  const layoutSource = readSource('app/layout.tsx');

  it('loads Google Fonts via <link> stylesheet', () => {
    expect(layoutSource).toContain('fonts.googleapis.com');
    expect(layoutSource).toContain('rel="stylesheet"');
  });

  it('includes all three required font families', () => {
    expect(layoutSource).toContain('Cormorant+Garamond');
    expect(layoutSource).toContain('Inter');
    expect(layoutSource).toContain('Playfair+Display');
  });

  it('preconnects to Google Fonts for performance', () => {
    expect(layoutSource).toContain('rel="preconnect"');
    expect(layoutSource).toContain('fonts.googleapis.com');
    expect(layoutSource).toContain('fonts.gstatic.com');
  });

  it('has eslint-disable for @next/next/no-page-custom-font', () => {
    expect(layoutSource).toContain(
      'eslint-disable-next-line @next/next/no-page-custom-font'
    );
  });
});

// ─── CSS: font-family declarations use correct font names ────────────

describe('globals.css font-family declarations', () => {
  const cssSource = readSource('app/globals.css');

  it('defines .font-display-modern with Inter', () => {
    expect(cssSource).toMatch(/\.font-display-modern\s*\{[^}]*Inter/);
  });

  it('defines .font-display-classic with Playfair Display', () => {
    expect(cssSource).toMatch(
      /\.font-display-classic\s*\{[^}]*Playfair Display/
    );
  });

  it('defines .font-display-elegant with Cormorant Garamond', () => {
    expect(cssSource).toMatch(
      /\.font-display-elegant\s*\{[^}]*Cormorant Garamond/
    );
  });
});

// ─── next.config.js: image remote patterns ───────────────────────────

describe('next.config.js image configuration', () => {
  const configSource = readSource('../next.config.js');

  it('configures remotePatterns for Supabase storage', () => {
    expect(configSource).toContain('remotePatterns');
    expect(configSource).toContain('supabase.co');
  });

  it('uses https protocol for remote images', () => {
    expect(configSource).toMatch(/protocol:\s*['"]https['"]/);
  });
});
