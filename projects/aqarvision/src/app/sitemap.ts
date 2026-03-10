import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: agencies } = await supabase
    .from('agencies')
    .select('slug, updated_at');

  if (!agencies) return [];

  const entries: MetadataRoute.Sitemap = [];

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

  return entries;
}
