"use server";

import { createClient } from "@/lib/supabase/server";
import type { ListingCard } from "@/features/listings/types/listing.types";

export async function getFeaturedListings(
  type: "sale" | "rent" | "vacation",
  limit = 8
): Promise<ListingCard[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("listings")
    .select(
      `
      id,
      listing_type,
      property_type,
      current_price,
      currency,
      surface_m2,
      rooms,
      wilaya_code,
      latitude,
      longitude,
      details,
      published_at,
      created_at,
      agency_id,
      agencies (name, slug, is_verified),
      listing_translations!inner (title, slug, locale),
      listing_media (storage_path, is_cover, sort_order)
    `
    )
    .eq("current_status", "published")
    .eq("listing_type", type)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((row) => {
    const translations = row.listing_translations as Array<{ title: string; slug: string; locale: string }> | null;
    const translation = translations?.find((t) => t.locale === "fr") ?? translations?.[0];

    const mediaList = row.listing_media as Array<{ storage_path: string; is_cover: boolean; sort_order: number }> | null;
    const coverMedia = mediaList?.find((m) => m.is_cover) ?? mediaList?.[0];

    const agencyArr = row.agencies as unknown as Array<{ name: string; slug: string; is_verified: boolean }> | null;
    const agency = Array.isArray(agencyArr) ? agencyArr[0] ?? null : agencyArr;
    const details = (row.details ?? {}) as Record<string, unknown>;

    return {
      id: row.id,
      listing_type: row.listing_type,
      property_type: row.property_type,
      price: row.current_price,
      currency: row.currency,
      area_m2: row.surface_m2 ?? (details.area_m2 as number) ?? 0,
      rooms: row.rooms ?? null,
      title: translation?.title ?? "",
      slug: translation?.slug ?? row.id,
      wilaya_name: row.wilaya_code ?? "",
      commune_name: "",
      cover_url: coverMedia?.storage_path ?? null,
      agency_name: agency?.name ?? null,
      agency_verified_level: agency?.is_verified ? 2 : null,
      latitude: row.latitude ?? null,
      longitude: row.longitude ?? null,
      created_at: row.created_at ?? row.published_at ?? "",
    } satisfies ListingCard;
  });
}
