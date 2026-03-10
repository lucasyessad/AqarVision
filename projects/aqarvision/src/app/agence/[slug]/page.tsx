import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LuxuryHero } from '@/components/agency/luxury-hero';
import { LuxuryPropertiesSection } from '@/components/agency/luxury-properties-section';
import { LuxuryAboutSection } from '@/components/agency/luxury-about-section';
import type { Agency, Property } from '@/types/database';

interface AgencyPageProps {
  params: Promise<{ slug: string }>;
}

async function getAgencyWithProperties(slug: string) {
  const supabase = await createClient();

  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!agency) return null;

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })
    .limit(6);

  return { agency: agency as Agency, properties: (properties || []) as Property[] };
}

export default async function AgencyPage({ params }: AgencyPageProps) {
  const { slug } = await params;
  const data = await getAgencyWithProperties(slug);

  if (!data) notFound();

  const { agency, properties } = data;

  // Enterprise → Pages Luxury
  if (agency.active_plan === 'enterprise') {
    return (
      <>
        <LuxuryHero agency={agency} />
        <LuxuryPropertiesSection agency={agency} properties={properties} />
        <LuxuryAboutSection agency={agency} />
      </>
    );
  }

  // Starter / Pro → Page basique
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold">{agency.name}</h1>
        {agency.slogan && <p className="mt-2 text-gray-600">{agency.slogan}</p>}
      </div>

      {properties.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div key={property.id} className="overflow-hidden rounded-lg border">
              {property.images[0] && (
                <div className="relative aspect-[4/3]">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold">{property.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {property.wilaya} {property.surface && `· ${property.surface} m²`}
                </p>
                <p className="mt-2 font-bold text-blue-600">
                  {new Intl.NumberFormat('fr-DZ').format(property.price)} DZD
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
