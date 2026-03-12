import { notFound } from 'next/navigation';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { getTranslations } from '@/lib/i18n';
import { Home, Key, BarChart3, Handshake, Building2, Scale } from 'lucide-react';
import type { Metadata } from 'next';
import type { TranslationKey } from '@/lib/i18n';
import type { LucideIcon } from 'lucide-react';

interface ServicesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return {};
  const t = getTranslations(agency.locale ?? 'fr');
  return { title: `${t('nav.services')} — ${agency.name}` };
}

interface ServiceDefinition {
  id: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: LucideIcon;
}

const SERVICES: ServiceDefinition[] = [
  { id: 'vente', labelKey: 'services.sale', descriptionKey: 'services.saleDesc', icon: Home },
  { id: 'location', labelKey: 'services.rent', descriptionKey: 'services.rentDesc', icon: Key },
  { id: 'estimation', labelKey: 'services.estimation', descriptionKey: 'services.estimationDesc', icon: BarChart3 },
  { id: 'accompagnement', labelKey: 'services.support', descriptionKey: 'services.supportDesc', icon: Handshake },
  { id: 'gestion', labelKey: 'services.management', descriptionKey: 'services.managementDesc', icon: Building2 },
  { id: 'juridique', labelKey: 'services.legal', descriptionKey: 'services.legalDesc', icon: Scale },
];

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color || '#234E6F';

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-heading-lg text-neutral-900">
        {t('services.heading')}
      </h1>
      <div className="mt-3 agency-line" style={{ backgroundColor: accentColor }} />
      <p className="mt-4 text-body-sm text-neutral-600 max-w-2xl">
        {t('services.description', { name: agency.name })}
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => {
          const IconComponent = service.icon;
          return (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-neutral-200 p-6"
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <IconComponent className="h-5 w-5" style={{ color: accentColor }} />
              </div>
              <p className="mt-4 text-body-md font-semibold text-neutral-900">
                {t(service.labelKey)}
              </p>
              <p className="mt-2 text-body-sm text-neutral-500 leading-relaxed">
                {t(service.descriptionKey)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
