import { notFound } from 'next/navigation';
import { LuxuryAboutSection } from '@/components/agency/luxury-about-section';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { getTranslations } from '@/lib/i18n';
import { PLANS } from '@/config';
import type { Metadata } from 'next';

interface AboutPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return {};
  const t = getTranslations(agency.locale ?? 'fr');
  return { title: t('nav.about') };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const t = getTranslations(agency.locale ?? 'fr');

  // Enterprise → Luxury About
  if (agency.active_plan === PLANS.ENTERPRISE) {
    return <LuxuryAboutSection agency={agency} />;
  }

  // Starter / Pro → Page basique
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">{t('about.heading', { name: agency.name })}</h1>
      {agency.description && (
        <p className="leading-relaxed text-gray-600">{agency.description}</p>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {agency.wilaya && (
          <div className="rounded-lg bg-gray-50 p-4">
            <span className="text-sm text-gray-500">{t('about.wilaya')}</span>
            <p className="mt-1 font-medium">{agency.wilaya}</p>
          </div>
        )}
        {agency.address && (
          <div className="rounded-lg bg-gray-50 p-4">
            <span className="text-sm text-gray-500">{t('about.address')}</span>
            <p className="mt-1 font-medium">{agency.address}</p>
          </div>
        )}
        {agency.registre_commerce && (
          <div className="rounded-lg bg-gray-50 p-4">
            <span className="text-sm text-gray-500">{t('about.registre')}</span>
            <p className="mt-1 font-medium">{agency.registre_commerce}</p>
          </div>
        )}
      </div>
    </div>
  );
}
