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

// Note: app/agence/[slug]/page.tsx now delegates rendering to ThemeRenderer
// and section components, so it no longer directly imports Image.
const AGENCY_PAGES = [
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

  it('loads fonts via next/font/google', () => {
    expect(layoutSource).toContain("from 'next/font/google'");
  });

  it('includes all three required font families', () => {
    expect(layoutSource).toContain('DM_Serif_Display');
    expect(layoutSource).toContain('DM_Sans');
    expect(layoutSource).toContain('JetBrains_Mono');
  });

  it('exposes CSS font variables on html element', () => {
    expect(layoutSource).toContain('--font-display');
    expect(layoutSource).toContain('--font-body');
    expect(layoutSource).toContain('--font-mono');
  });

  it('applies font variable classNames to html element', () => {
    expect(layoutSource).toContain('dmSerifDisplay.variable');
    expect(layoutSource).toContain('dmSans.variable');
    expect(layoutSource).toContain('jetbrainsMono.variable');
  });
});

// ─── CSS: font-family declarations use correct font names ────────────

describe('globals.css font-family declarations', () => {
  const cssSource = readSource('app/globals.css');

  it('defines .font-display utility with var(--font-display)', () => {
    expect(cssSource).toContain('--font-display');
    expect(cssSource).toMatch(/\.font-display\s*\{/);
  });

  it('defines .font-body utility with var(--font-body)', () => {
    expect(cssSource).toContain('--font-body');
    expect(cssSource).toMatch(/\.font-body\s*\{/);
  });

  it('defines .font-mono utility with var(--font-mono)', () => {
    expect(cssSource).toContain('--font-mono');
    expect(cssSource).toMatch(/\.font-mono\s*\{/);
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
