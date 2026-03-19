import type { SupabaseClient } from "@supabase/supabase-js";
import type { SearchFilters } from "../schemas/search.schema";
import type { ListingCard } from "@/features/listings/types/listing.types";

export interface SearchResult {
  listings: ListingCard[];
  total: number;
  page: number;
  totalPages: number;
}

export async function searchListings(
  supabase: SupabaseClient,
  filters: SearchFilters,
  locale: string = "fr"
): Promise<SearchResult> {
  const { page, limit, sort, ...rest } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("listings")
    .select(
      `
      id,
      listing_type,
      property_type,
      current_price,
      currency,
      details,
      latitude,
      longitude,
      created_at,
      agency:agencies(name, slug, verification_level:verifications(level)),
      translations:listing_translations(title, slug, locale),
      media:listing_media(storage_path, is_cover),
      commune:communes(name_fr, name_ar),
      wilaya:wilayas(name_fr, name_ar)
    `,
      { count: "exact" }
    )
    .eq("current_status", "published");

  if (rest.type) query = query.eq("listing_type", rest.type);
  if (rest.wilaya) query = query.eq("wilaya_code", rest.wilaya);
  if (rest.priceMin) query = query.gte("current_price", rest.priceMin);
  if (rest.priceMax) query = query.lte("current_price", rest.priceMax);
  if (rest.agency) {
    query = query.eq("agency.slug", rest.agency);
  }

  if (rest.propertyType) {
    const types = Array.isArray(rest.propertyType)
      ? rest.propertyType
      : [rest.propertyType];
    query = query.in("property_type", types);
  }

  // Sort
  switch (sort) {
    case "price_asc":
      query = query.order("current_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("current_price", { ascending: false });
      break;
    case "surface_desc":
      query = query.order("details->area_m2", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  const nameKey = locale === "ar" ? "name_ar" : "name_fr";

  const listings: ListingCard[] = (data ?? []).map((item: Record<string, unknown>) => {
    const translations = item.translations as Array<{ title: string; slug: string; locale: string }>;
    const media = item.media as Array<{ storage_path: string; is_cover: boolean }>;
    const details = item.details as { area_m2: number; rooms?: number };
    const commune = item.commune as Record<string, string> | null;
    const wilaya = item.wilaya as Record<string, string> | null;
    const agency = item.agency as { name: string; slug: string; verification_level?: Array<{ level: number }> } | null;
    const tr =
      translations?.find((t) => t.locale === locale) ??
      translations?.find((t) => t.locale === "fr");
    const cover = media?.find((m) => m.is_cover);

    return {
      id: item.id as string,
      listing_type: item.listing_type as ListingCard["listing_type"],
      property_type: item.property_type as ListingCard["property_type"],
      price: item.current_price as number,
      currency: item.currency as string,
      area_m2: details?.area_m2 ?? 0,
      rooms: details?.rooms ?? null,
      title: tr?.title ?? "",
      slug: tr?.slug ?? "",
      wilaya_name: wilaya?.[nameKey] ?? "",
      commune_name: commune?.[nameKey] ?? "",
      cover_url: cover?.storage_path ?? null,
      agency_name: agency?.name ?? null,
      agency_verified_level:
        agency?.verification_level?.[0]?.level ?? null,
      latitude: (item.latitude as number) ?? null,
      longitude: (item.longitude as number) ?? null,
      created_at: item.created_at as string,
    };
  });

  const total = count ?? 0;

  return {
    listings,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getSimilarListings(
  supabase: SupabaseClient,
  listingId: string,
  wilayaCode: string,
  propertyType: string,
  price: number,
  locale: string = "fr",
  limit: number = 6
): Promise<ListingCard[]> {
  const priceMin = Math.round(price * 0.7);
  const priceMax = Math.round(price * 1.3);

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id, listing_type, property_type, current_price, currency, details, created_at,
      translations:listing_translations(title, slug, locale),
      media:listing_media(storage_path, is_cover),
      commune:communes(name_fr),
      wilaya:wilayas(name_fr)
    `
    )
    .eq("current_status", "published")
    .eq("wilaya_code", wilayaCode)
    .eq("property_type", propertyType)
    .gte("current_price", priceMin)
    .lte("current_price", priceMax)
    .neq("id", listingId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((item: Record<string, unknown>) => {
    const translations = item.translations as Array<{ title: string; slug: string; locale: string }>;
    const media = item.media as Array<{ storage_path: string; is_cover: boolean }>;
    const details = item.details as { area_m2: number; rooms?: number };
    const commune = item.commune as { name_fr: string } | null;
    const wilaya = item.wilaya as { name_fr: string } | null;
    const tr = translations?.find((t) => t.locale === locale) ?? translations?.[0];
    const cover = media?.find((m) => m.is_cover);

    return {
      id: item.id as string,
      listing_type: item.listing_type as ListingCard["listing_type"],
      property_type: item.property_type as ListingCard["property_type"],
      price: item.current_price as number,
      currency: item.currency as string,
      area_m2: details?.area_m2 ?? 0,
      rooms: details?.rooms ?? null,
      title: tr?.title ?? "",
      slug: tr?.slug ?? "",
      wilaya_name: wilaya?.name_fr ?? "",
      commune_name: commune?.name_fr ?? "",
      cover_url: cover?.storage_path ?? null,
      agency_name: null,
      agency_verified_level: null,
      latitude: null,
      longitude: null,
      created_at: item.created_at as string,
    };
  });
}
