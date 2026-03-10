import { notFound } from 'next/navigation';
import Image from 'next/image';
import { LuxuryHero } from '@/components/agency/luxury-hero';
import { LuxuryPropertiesSection } from '@/components/agency/luxury-properties-section';
import { LuxuryAboutSection } from '@/components/agency/luxury-about-section';
import { SocialFeedSection } from '@/components/agency/social-feed-section';
import { getAgencyBySlug, getAgencyProperties } from '@/lib/queries/agency';
import { fetchSocialFeed } from '@/lib/social/fetch-feed';
import { getTranslations } from '@/lib/i18n';
import { formatPrice } from '@/lib/utils/format';
import { PLANS } from '@/config';
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

  const t = getTranslations(agency.locale ?? 'fr');
  const hasSocial = agency.instagram_url || agency.facebook_url || agency.tiktok_url;

  const [properties, socialFeed] = await Promise.all([
    getAgencyProperties(agency.id, 6),
    hasSocial
      ? fetchSocialFeed({
          instagram_url: agency.instagram_url,
          facebook_url: agency.facebook_url,
          tiktok_url: agency.tiktok_url,
        })
      : Promise.resolve({ posts: [], embeds: [], hasApiData: false }),
  ]);

  // Enterprise → Pages Luxury
  if (agency.active_plan === PLANS.ENTERPRISE) {
    return (
      <>
        <LuxuryHero agency={agency} />
        <LuxuryPropertiesSection agency={agency} properties={properties} />
        <LuxuryAboutSection agency={agency} showStats={false} />
        <SocialFeedSection
          agency={agency}
          posts={socialFeed.posts}
          embeds={socialFeed.embeds}
          hasApiData={socialFeed.hasApiData}
        />
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
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold">{property.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {property.wilaya} {property.surface && `· ${property.surface} m²`}
                </p>
                <p className="mt-2 font-bold text-blue-600">
                  {formatPrice(property.price, property.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <SocialFeedSection
        agency={agency}
        posts={socialFeed.posts}
        embeds={socialFeed.embeds}
        hasApiData={socialFeed.hasApiData}
      />
    </div>
  );
}
