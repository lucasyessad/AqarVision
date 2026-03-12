import { notFound } from 'next/navigation';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { getTranslations } from '@/lib/i18n';
import { MapPin, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import type { AgencyWilaya } from '@/types/database';

interface ZonesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ZonesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return {};
  const t = getTranslations(agency.locale ?? 'fr');
  return { title: `${t('nav.zones')} — ${agency.name}` };
}

export default async function ZonesPage({ params }: ZonesPageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color || '#234E6F';

  const supabase = await createClient();
  const { data: wilayas } = await supabase
    .from('agency_wilayas')
    .select('id, wilaya, address, is_headquarters')
    .eq('agency_id', agency.id)
    .order('is_headquarters', { ascending: false })
    .order('wilaya', { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-heading-lg text-neutral-900">
        {t('zones.heading')}
      </h1>
      <div className="mt-3 agency-line" style={{ backgroundColor: accentColor }} />
      <p className="mt-4 text-body-sm text-neutral-600 max-w-2xl">
        {t('zones.description', { name: agency.name })}
      </p>

      {wilayas && wilayas.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(wilayas as AgencyWilaya[]).map((wilaya) => (
            <div
              key={wilaya.id}
              className="flex items-start gap-3 bg-white rounded-xl border border-neutral-200 p-5"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <MapPin className="h-4.5 w-4.5" style={{ color: accentColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-body-sm font-medium text-neutral-900">
                    {wilaya.wilaya}
                  </p>
                  {wilaya.is_headquarters && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Star className="h-2.5 w-2.5" />
                      {t('zones.headquarters')}
                    </span>
                  )}
                </div>
                {wilaya.address && (
                  <p className="mt-0.5 text-caption text-neutral-400 truncate">
                    {wilaya.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border-2 border-dashed border-neutral-200 bg-white py-16 text-center">
          <MapPin className="mx-auto h-10 w-10 text-neutral-300" />
          <p className="mt-4 text-body-md text-neutral-500">{t('zones.empty')}</p>
        </div>
      )}
    </div>
  );
}
