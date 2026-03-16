import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const LOCALES = ["fr", "ar", "en", "es"] as const;

/** Derive the agency subdomain URL server-side from NEXT_PUBLIC_SITE_URL */
function getAgencySubdomainUrl(slug: string): string {
  try {
    const url = new URL(BASE_URL);
    const protocol = url.protocol;
    const host = url.host;
    return `${protocol}//${slug}.${host}`;
  } catch {
    return `http://${slug}.localhost:3000`;
  }
}

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
        url: `${BASE_URL}/${t.locale}/annonce/${t.slug}`,
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
      const agencyBaseUrl = getAgencySubdomainUrl(agency.slug);
      for (const locale of LOCALES) {
        // Subdomain URL (primary)
        entries.push({
          url: `${agencyBaseUrl}/${locale}`,
          lastModified: new Date(agency.updated_at as string),
          changeFrequency: "weekly",
          priority: 0.7,
        });
        // Legacy path-based URL (fallback / canonical alternate)
        entries.push({
          url: `${BASE_URL}/${locale}/a/${agency.slug}`,
          lastModified: new Date(agency.updated_at as string),
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  }

  return entries;
}
