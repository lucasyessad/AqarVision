import type { SupabaseClient } from "@supabase/supabase-js";
import type { SearchFiltersInput } from "../schemas/search.schema";
import type {
  SearchResponse,
  SearchResultDto,
  ListingDetailPublicDto,
  ListingMediaDto,
  ListingTranslationPublicDto,
  AgencyPublicDto,
  AgencyBranchPublicDto,
} from "../types/search.types";

/* ------------------------------------------------------------------ */
/*  searchListings                                                     */
/* ------------------------------------------------------------------ */

export async function searchListings(
  supabase: SupabaseClient,
  filters: SearchFiltersInput
): Promise<SearchResponse> {
  const { locale, page, page_size } = filters;
  const offset = (page - 1) * page_size;

  // Build the base query: published, non-deleted listings joined with translations
  let query = supabase
    .from("listings")
    .select(
      `
      id, agency_id, current_status, current_price, currency,
      listing_type, property_type, surface_m2, rooms, bathrooms,
      wilaya_code, commune_id, published_at, created_at,
      listing_translations!inner(title, slug, search_vector),
      listing_media(storage_path),
      agencies!inner(name)
    `,
      { count: "exact" }
    )
    .eq("current_status", "published")
    .is("deleted_at", null)
    .eq("listing_translations.locale", locale);

  // Full-text search
  if (filters.q) {
    query = query.textSearch("listing_translations.search_vector", filters.q, {
      type: "websearch",
      config: "simple",
    });
  }

  // Filters
  if (filters.listing_type) {
    query = query.eq("listing_type", filters.listing_type);
  }
  if (filters.property_type) {
    query = query.eq("property_type", filters.property_type);
  }
  if (filters.wilaya_code) {
    query = query.eq("wilaya_code", filters.wilaya_code);
  }
  if (filters.commune_id) {
    query = query.eq("commune_id", filters.commune_id);
  }
  if (filters.price_min !== undefined) {
    query = query.gte("current_price", filters.price_min);
  }
  if (filters.price_max !== undefined) {
    query = query.lte("current_price", filters.price_max);
  }
  if (filters.rooms_min !== undefined) {
    query = query.gte("rooms", filters.rooms_min);
  }
  if (filters.surface_min !== undefined) {
    query = query.gte("surface_m2", filters.surface_min);
  }

  // PostGIS map bounds filter via RPC would be ideal, but we use a
  // bounding-box approach with the geography column.
  // Supabase JS client doesn't natively support ST_Within, so we use
  // an RPC call for map bounds filtering.
  if (filters.map_bounds) {
    const { north, south, east, west } = filters.map_bounds;
    // Use PostGIS filter via raw filter
    query = query.filter(
      "location",
      "cd",
      `SRID=4326;POLYGON((${west} ${south},${east} ${south},${east} ${north},${west} ${north},${west} ${south}))`
    );
  }

  // Ordering & pagination
  query = query
    .order("published_at", { ascending: false })
    .range(offset, offset + page_size - 1);

  const { data, error, count } = await query;

  if (error || !data) {
    return { results: [], total_count: 0, page, page_size };
  }

  const results: SearchResultDto[] = data.map((row) => {
    const translations = row.listing_translations as unknown as Record<string, unknown>[];
    const translation = translations?.[0];
    const mediaRows = (row.listing_media as unknown as Record<string, unknown>[]) ?? [];
    const coverMedia = mediaRows[0];
    const agency = row.agencies as unknown as Record<string, unknown>;

    return {
      id: row.id as string,
      agency_id: row.agency_id as string,
      current_status: row.current_status as SearchResultDto["current_status"],
      current_price: row.current_price as number,
      currency: (row.currency as string) ?? "DZD",
      listing_type: row.listing_type as SearchResultDto["listing_type"],
      property_type: row.property_type as SearchResultDto["property_type"],
      surface_m2: (row.surface_m2 as number) ?? null,
      rooms: (row.rooms as number) ?? null,
      bathrooms: (row.bathrooms as number) ?? null,
      wilaya_code: row.wilaya_code as number,
      commune_id: (row.commune_id as number) ?? null,
      published_at: (row.published_at as string) ?? null,
      created_at: row.created_at as string,
      title: (translation?.title as string) ?? "",
      slug: (translation?.slug as string) ?? "",
      cover_url: (coverMedia?.storage_path as string) ?? null,
      agency_name: (agency?.name as string) ?? "",
      relevance_score: null,
    };
  });

  return {
    results,
    total_count: count ?? 0,
    page,
    page_size,
  };
}

/* ------------------------------------------------------------------ */
/*  getListingBySlug                                                   */
/* ------------------------------------------------------------------ */

export async function getListingBySlug(
  supabase: SupabaseClient,
  locale: string,
  slug: string
): Promise<ListingDetailPublicDto | null> {
  // Find listing via translation slug
  const { data: translation, error: translationError } = await supabase
    .from("listing_translations")
    .select("listing_id")
    .eq("locale", locale)
    .eq("slug", slug)
    .single();

  if (translationError || !translation) {
    return null;
  }

  const listingId = translation.listing_id as string;

  // Fetch listing with agency
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(
      `
      id, agency_id, current_status, current_price, currency,
      listing_type, property_type, surface_m2, rooms, bathrooms,
      wilaya_code, commune_id, published_at, created_at, details,
      agencies(name, slug, logo_url, phone)
    `
    )
    .eq("id", listingId)
    .eq("current_status", "published")
    .is("deleted_at", null)
    .single();

  if (listingError || !listing) {
    return null;
  }

  // Fetch all translations
  const { data: allTranslations } = await supabase
    .from("listing_translations")
    .select("locale, title, description, slug")
    .eq("listing_id", listingId);

  // Fetch media
  const { data: media } = await supabase
    .from("listing_media")
    .select("id, storage_path, content_type, is_cover, sort_order")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  const agency = listing.agencies as unknown as Record<string, unknown> | null;
  const currentTranslation = (
    (allTranslations ?? []) as Record<string, unknown>[]
  ).find((t) => t.locale === locale);

  // Increment view count (fire and forget)
  supabase
    .from("listing_views")
    .insert({ listing_id: listingId })
    .then(() => {
      /* intentionally empty */
    });

  return {
    id: listing.id as string,
    agency_id: listing.agency_id as string,
    current_status: listing.current_status as ListingDetailPublicDto["current_status"],
    current_price: listing.current_price as number,
    currency: (listing.currency as string) ?? "DZD",
    listing_type: listing.listing_type as ListingDetailPublicDto["listing_type"],
    property_type: listing.property_type as ListingDetailPublicDto["property_type"],
    surface_m2: (listing.surface_m2 as number) ?? null,
    rooms: (listing.rooms as number) ?? null,
    bathrooms: (listing.bathrooms as number) ?? null,
    wilaya_code: listing.wilaya_code as number,
    commune_id: (listing.commune_id as number) ?? null,
    published_at: (listing.published_at as string) ?? null,
    created_at: listing.created_at as string,
    details: (listing.details as Record<string, unknown>) ?? {},
    title: (currentTranslation?.title as string) ?? "",
    description: (currentTranslation?.description as string) ?? "",
    slug: (currentTranslation?.slug as string) ?? slug,
    media: ((media ?? []) as Record<string, unknown>[]).map(
      (m): ListingMediaDto => ({
        id: m.id as string,
        storage_path: m.storage_path as string,
        content_type: (m.content_type as string) ?? null,
        is_cover: m.is_cover as boolean,
        sort_order: m.sort_order as number,
      })
    ),
    agency_name: (agency?.name as string) ?? "",
    agency_slug: (agency?.slug as string) ?? "",
    agency_logo_url: (agency?.logo_url as string) ?? null,
    agency_phone: (agency?.phone as string) ?? null,
    translations: ((allTranslations ?? []) as Record<string, unknown>[]).map(
      (t): ListingTranslationPublicDto => ({
        locale: t.locale as string,
        title: t.title as string,
        description: t.description as string,
        slug: t.slug as string,
      })
    ),
  };
}

/* ------------------------------------------------------------------ */
/*  getAgencyPublic                                                    */
/* ------------------------------------------------------------------ */

export async function getAgencyPublic(
  supabase: SupabaseClient,
  slug: string
): Promise<AgencyPublicDto | null> {
  const { data: agency, error } = await supabase
    .from("agencies")
    .select(
      "id, name, slug, description, logo_url, cover_url, phone, email, is_verified, created_at"
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (error || !agency) {
    return null;
  }

  const agencyId = agency.id as string;

  // Fetch branches
  const { data: branches } = await supabase
    .from("agency_branches")
    .select("id, name, wilaya_code, commune_id, address_text")
    .eq("agency_id", agencyId);

  // Fetch listing count
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .eq("current_status", "published")
    .is("deleted_at", null);

  return {
    id: agencyId,
    name: agency.name as string,
    slug: agency.slug as string,
    description: (agency.description as string) ?? null,
    logo_url: (agency.logo_url as string) ?? null,
    cover_url: (agency.cover_url as string) ?? null,
    phone: (agency.phone as string) ?? null,
    email: (agency.email as string) ?? null,
    is_verified: (agency.is_verified as boolean) ?? false,
    created_at: agency.created_at as string,
    branches: ((branches ?? []) as Record<string, unknown>[]).map(
      (b): AgencyBranchPublicDto => ({
        id: b.id as string,
        name: b.name as string,
        wilaya_code: b.wilaya_code as string,
        commune_id: (b.commune_id as number) ?? null,
        address_text: (b.address_text as string) ?? null,
      })
    ),
    listing_count: count ?? 0,
  };
}
