import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aqarvision.com";
const LOCALES = ["fr", "ar", "en", "es"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages per locale
  for (const locale of LOCALES) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    });

    entries.push({
      url: `${BASE_URL}/${locale}/search`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    });
  }

  // Published listings: all locale-slug combinations
  const { data: translations } = await supabase
    .from("listing_translations")
    .select("locale, slug, updated_at, listing_id, listings!inner(current_status, deleted_at)")
    .eq("listings.current_status", "published")
    .is("listings.deleted_at", null);

  if (translations) {
    for (const t of translations) {
      entries.push({
        url: `${BASE_URL}/${t.locale}/l/${t.slug}`,
        lastModified: new Date(t.updated_at as string),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  // Category pages per wilaya (1-58) per locale
  for (const locale of LOCALES) {
    for (let w = 1; w <= 58; w++) {
      entries.push({
        url: `${BASE_URL}/${locale}/search?wilaya_code=${w}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  // Agency pages
  const { data: agencies } = await supabase
    .from("agencies")
    .select("slug, updated_at")
    .is("deleted_at", null);

  if (agencies) {
    for (const agency of agencies) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/a/${agency.slug}`,
          lastModified: new Date(agency.updated_at as string),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  return entries;
}
