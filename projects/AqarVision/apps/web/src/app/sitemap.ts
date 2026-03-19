import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aqarvision.com";

const STATIC_ROUTES = [
  "/",
  "/search",
  "/agences",
  "/estimer",
  "/vendre",
  "/pro",
  "/deposer",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static routes for all locales
  for (const locale of routing.locales) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route === "/" ? "" : route}`,
        lastModified: new Date(),
        changeFrequency: route === "/" ? "daily" : "weekly",
        priority: route === "/" ? 1.0 : route === "/search" ? 0.9 : 0.7,
      });
    }
  }

  // Dynamic listing routes
  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();

    const { data: listings } = await supabase
      .from("listing_translations")
      .select("slug, locale, listing:listings!inner(status, updated_at)")
      .eq("listing.status", "published")
      .limit(5000);

    if (listings) {
      for (const entry of listings) {
        const listing = entry.listing as unknown as {
          status: string;
          updated_at: string;
        };
        entries.push({
          url: `${BASE_URL}/${entry.locale}/annonce/${entry.slug}`,
          lastModified: new Date(listing.updated_at),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }

    // Dynamic agency routes
    const { data: agencies } = await supabase
      .from("agencies")
      .select("slug, updated_at")
      .limit(2000);

    if (agencies) {
      for (const agency of agencies) {
        for (const locale of routing.locales) {
          entries.push({
            url: `${BASE_URL}/${locale}/a/${agency.slug}`,
            lastModified: new Date(agency.updated_at),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // Supabase not available at build time — return static routes only
  }

  return entries;
}
