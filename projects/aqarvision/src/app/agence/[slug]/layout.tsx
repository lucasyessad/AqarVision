import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LuxuryLayout } from '@/components/agency/luxury-layout';
import { AgencyJsonLd } from '@/components/seo/json-ld';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { getLocaleAttrs, getTranslations } from '@/lib/i18n';
import { CACHE, PLANS } from '@/config';
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
    const t = getTranslations('fr');
    return { title: t('error.agencyNotFound') };
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

export default async function AgencyLayout({ children, params }: AgencyLayoutProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const localeAttrs = getLocaleAttrs(agency.locale ?? 'fr');

  const jsonLd = <AgencyJsonLd agency={agency} baseUrl={BASE_URL} />;

  // Enterprise → Luxury Layout
  if (agency.active_plan === PLANS.ENTERPRISE) {
    return (
      <div dir={localeAttrs.dir} lang={localeAttrs.lang}>
        {jsonLd}
        <LuxuryLayout agency={agency}>{children}</LuxuryLayout>
      </div>
    );
  }

  // Starter / Pro → Layout basique
  const t = getTranslations(agency.locale ?? 'fr');

  return (
    <div className="min-h-screen bg-white" dir={localeAttrs.dir} lang={localeAttrs.lang}>
      {jsonLd}
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href={`/agence/${slug}`} className="text-lg font-semibold">
            {agency.name}
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href={`/agence/${slug}`}>{t('nav.home')}</Link>
            <Link href={`/agence/${slug}/biens`}>{t('nav.properties')}</Link>
            <Link href={`/agence/${slug}/a-propos`}>{t('nav.about')}</Link>
            <Link href={`/agence/${slug}/contact`}>{t('nav.contact')}</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t px-6 py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {agency.name}. {t('footer.rights')}
      </footer>
    </div>
  );
}
