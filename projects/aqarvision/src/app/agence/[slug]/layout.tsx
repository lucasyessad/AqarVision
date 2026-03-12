import { notFound } from 'next/navigation';
import { AgencyJsonLd } from '@/components/seo/json-ld';
import { WhatsAppButton } from '@/components/agency/whatsapp-button';
import { HeaderSection, FooterSection } from '@/components/agency/sections/layout';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { getLocaleAttrs } from '@/lib/i18n';
import { getThemeManifest, themeToCSSVars } from '@/lib/themes';
import { CACHE } from '@/config';
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aqarvision.dz';

interface AgencyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AgencyLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) {
    return { title: 'Agence introuvable' };
  }

  const description = agency.description
    || `${agency.name} — Agence immobilière${agency.wilaya ? ` à ${agency.wilaya}` : ''}, Algérie`;

  return {
    title: {
      default: agency.name,
      template: `%s | ${agency.name}`,
    },
    description,
    openGraph: {
      title: agency.name,
      description,
      type: 'website',
      ...(agency.cover_image_url && { images: [{ url: agency.cover_image_url, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: agency.name,
      description,
    },
  };
}

export const revalidate = CACHE.PAGE_REVALIDATE;

const FONT_CLASS_MAP: Record<string, string> = {
  modern: 'agency-font-modern',
  classic: 'agency-font-classic',
  elegant: 'agency-font-elegant',
};

export default async function AgencyLayout({ children, params }: AgencyLayoutProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const localeAttrs = getLocaleAttrs(agency.locale ?? 'fr');
  const manifest = getThemeManifest(agency.theme);

  const fontClass = FONT_CLASS_MAP[manifest.style.fontFamily] || 'agency-font-modern';
  const borderClass = manifest.style.borderStyle === 'square' ? 'agency-border-square' : 'agency-border-rounded';
  const isDark = manifest.style.themeMode === 'dark';
  const bgClass = isDark ? 'bg-gray-950 text-white' : 'bg-neutral-50';

  const cssVars = themeToCSSVars(
    agency.primary_color,
    agency.accent_color,
    agency.secondary_color,
  );

  return (
    <div
      className={`agency-theme ${fontClass} ${borderClass} min-h-screen flex flex-col ${bgClass}`}
      dir={localeAttrs.dir}
      lang={localeAttrs.lang}
      style={cssVars as React.CSSProperties}
    >
      <AgencyJsonLd agency={agency} baseUrl={BASE_URL} />

      {/* Skip to content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg"
      >
        Aller au contenu
      </a>

      <HeaderSection variant={manifest.layout.header} agency={agency} />

      <main id="main-content" className="flex-1">{children}</main>

      <FooterSection variant={manifest.layout.footer} agency={agency} />

      <WhatsAppButton agency={agency} />
    </div>
  );
}
