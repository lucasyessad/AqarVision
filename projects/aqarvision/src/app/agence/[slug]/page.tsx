import { notFound } from 'next/navigation';
import { ThemeRenderer } from '@/components/agency/theme-renderer';
import { getAgencyBySlug, getAgencyProperties } from '@/lib/queries/agency';
import { fetchSocialFeed } from '@/lib/social/fetch-feed';
import { getThemeManifest } from '@/lib/themes';
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

  const manifest = getThemeManifest(agency.theme);

  return (
    <ThemeRenderer
      agency={agency}
      properties={properties}
      manifest={manifest}
      socialFeed={socialFeed}
    />
  );
}
