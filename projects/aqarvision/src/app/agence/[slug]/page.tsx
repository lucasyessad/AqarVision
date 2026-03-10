import { notFound } from 'next/navigation';
import { LuxuryHero } from '@/components/agency/luxury-hero';
import { LuxuryPropertiesSection } from '@/components/agency/luxury-properties-section';
import { LuxuryAboutSection } from '@/components/agency/luxury-about-section';
import { getAgencyBySlug, getAgencyProperties } from '@/lib/queries/agency';
import type { Metadata } from 'next';

interface AgencyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AgencyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return {};
  return {
    title: { absolute: `${agency.name} — Agence immobilière${agency.wilaya ? ` à ${agency.wilaya}` : ''}` },
  };
}

export default async function AgencyPage({ params }: AgencyPageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const properties = await getAgencyProperties(agency.id, 6);

  // Enterprise → Pages Luxury
  if (agency.active_plan === 'enterprise') {
    return (
      <>
        <LuxuryHero agency={agency} />
        <LuxuryPropertiesSection agency={agency} properties={properties} />
        <LuxuryAboutSection agency={agency} showStats={false} />
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
