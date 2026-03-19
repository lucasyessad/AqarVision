import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAgencyBySlug } from "@/features/agencies/services/agency.service";
import { getAgencyListings } from "@/features/listings/services/listing.service";
import ThemeRenderer from "@/components/agency/themes/ThemeRenderer";
import type { StorefrontProps } from "@/components/agency/themes/types";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const agency = await getAgencyBySlug(supabase, slug);

  if (!agency) {
    return { title: "Agence introuvable" };
  }

  return {
    title: agency.name,
    description: agency.description?.slice(0, 160) ?? `${agency.name} — Agence immobilière sur AqarVision`,
  };
}

export default async function AgencyStorefrontPage({ params }: Props) {
  const { slug, locale } = await params;
  const supabase = await createClient();

  const agency = await getAgencyBySlug(supabase, slug);

  if (!agency) {
    notFound();
  }

  // Fetch published listings for the agency
  let listings: StorefrontProps["listings"] = [];
  try {
    const result = await getAgencyListings(supabase, agency.id, {
      status: "published",
      limit: 12,
    });
    listings = result.listings.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      price: l.price,
      currency: l.currency,
      area_m2: l.area_m2,
      rooms: l.rooms,
      cover_url: l.cover_url,
      listing_type: l.listing_type,
      wilaya_name: l.wilaya_name,
    }));
  } catch {
    // If listings fail, show empty
  }

  // Fetch agency stats
  let stats = { total_listings: 0, total_views: 0, total_leads: 0 };
  try {
    const { count: listingsCount } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .eq("status", "published");

    stats.total_listings = listingsCount ?? 0;

    const { data: statsData } = await supabase
      .from("agency_stats_daily")
      .select("total_views, total_leads")
      .eq("agency_id", agency.id);

    if (statsData) {
      stats.total_views = statsData.reduce((s, r) => s + (r.total_views ?? 0), 0);
      stats.total_leads = statsData.reduce((s, r) => s + (r.total_leads ?? 0), 0);
    }
  } catch {
    // Stats are non-critical
  }

  // Build storefront content with proper typing
  const storefront = agency.storefront_content as StorefrontProps["agency"]["storefront_content"];
  const branding = agency.branding as StorefrontProps["agency"]["branding"];
  const themeId = agency.theme || "mediterranee";

  return (
    <ThemeRenderer
      themeId={themeId}
      agency={{
        name: agency.name,
        slug: agency.slug,
        description: agency.description,
        logo_url: agency.logo_url,
        phone: agency.phone,
        email: agency.email,
        whatsapp_phone: agency.whatsapp_phone,
        opening_hours: agency.opening_hours,
        verification_level: agency.verification_level,
        branding,
        storefront_content: storefront,
      }}
      listings={listings}
      stats={stats}
    />
  );
}
