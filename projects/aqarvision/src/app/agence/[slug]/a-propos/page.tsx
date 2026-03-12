import { notFound } from 'next/navigation';
import { AboutSection } from '@/components/agency/sections/about';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { getThemeManifest } from '@/lib/themes';
import { getTranslations } from '@/lib/i18n';
import { MapPin, FileText, Building2, Phone, Mail, Globe } from 'lucide-react';
import type { AboutVariant } from '@/lib/themes/registry';
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

  const manifest = getThemeManifest(agency.theme);
  const aboutSection = manifest.sections.find((s) => s.id === 'about');
  const aboutVariant = (aboutSection?.variant as AboutVariant) || 'about-simple';

  // Use theme-aware about for luxury/prominent themes
  if (aboutVariant === 'about-luxury' || aboutVariant === 'about-prominent') {
    return <AboutSection variant={aboutVariant} agency={agency} />;
  }

  const accentColor = agency.accent_color || agency.primary_color || '#234E6F';

  const infoItems = [
    { icon: MapPin, label: t('about.wilaya'), value: agency.wilaya },
    { icon: Building2, label: t('about.address'), value: agency.address },
    { icon: FileText, label: t('about.registre'), value: agency.registre_commerce },
    { icon: Phone, label: t('contact.phone'), value: agency.phone },
    { icon: Mail, label: t('contact.email'), value: agency.email },
    { icon: Globe, label: t('contact.website'), value: agency.website },
  ].filter((item) => item.value);

  // Starter / Pro → Page professionnelle
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-heading-lg text-neutral-900">
        {t('about.heading', { name: agency.name })}
      </h1>
      <div className="mt-3 agency-line" style={{ backgroundColor: accentColor }} />

      {agency.description && (
        <p className="mt-4 text-body-sm text-neutral-600 leading-relaxed max-w-2xl">
          {agency.description}
        </p>
      )}

      {infoItems.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {infoItems.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 bg-white rounded-xl border border-neutral-200 p-5"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <item.icon className="h-4.5 w-4.5" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-caption text-neutral-400">{item.label}</p>
                <p className="mt-0.5 text-body-sm font-medium text-neutral-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
