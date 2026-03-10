import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: agencies }, { data: properties }] = await Promise.all([
    supabase.from('agencies').select('slug, updated_at'),
    supabase.from('properties').select('id, updated_at').eq('status', 'active').limit(1000),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // AqarSearch pages
  entries.push(
    { url: '/recherche', changeFrequency: 'daily', priority: 1.0 },
  );

  // Property detail pages (AqarSearch B2C)
  if (properties) {
    for (const property of properties) {
      entries.push({
        url: `/bien/${property.id}`,
        lastModified: new Date(property.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Agency mini-sites (AqarVision B2B)
  if (agencies) {
    for (const agency of agencies) {
      const base = `/agence/${agency.slug}`;
      const lastModified = new Date(agency.updated_at);

      entries.push(
        { url: base, lastModified, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${base}/biens`, lastModified, changeFrequency: 'daily', priority: 0.9 },
        { url: `${base}/a-propos`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${base}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
      );
    }
  }

  return entries;
}
