import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Convert a Supabase storage path to a public URL */
function storageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/listing-media/${path}`;
}
import type { SearchFiltersInput } from "../schemas/search.schema";
import type {
  SearchResponse,
  SearchResultDto,
  ListingDetailPublicDto,
  ListingMediaDto,
  ListingTranslationPublicDto,
  AgencyPublicDto,
  AgencyBranchPublicDto,
  WilayaDto,
} from "../types/search.types";

/* ------------------------------------------------------------------ */
/*  Supabase row shapes (typed alternatives to Record<string, unknown>) */
/* ------------------------------------------------------------------ */

/** Row shape returned by searchListings query */
interface SearchListingRow {
  id: string;
  agency_id: string | null;
  current_status: string;
  current_price: number;
  currency: string;
  listing_type: string;
  property_type: string;
  surface_m2: number | null;
  rooms: number | null;
  bathrooms: number | null;
  wilaya_code: string;
  commune_id: number | null;
  published_at: string | null;
  created_at: string;
  reference_number: number;
  listing_translations: { title: string; slug: string; search_vector: unknown }[];
  listing_media: { storage_path: string }[];
  agencies: { name: string } | null;
}

/** Row shape returned by getListingBySlug listing query */
interface ListingDetailRow {
  id: string;
  agency_id: string | null;
  current_status: string;
  current_price: number;
  currency: string;
  listing_type: string;
  property_type: string;
  surface_m2: number | null;
  rooms: number | null;
  bathrooms: number | null;
  wilaya_code: string;
  commune_id: number | null;
  published_at: string | null;
  created_at: string;
  details: Record<string, unknown>;
  reference_number: number;
  agencies: { name: string; slug: string; logo_url: string | null; phone: string | null } | null;
}

/** Row shape for listing_translations query */
interface TranslationRow {
  locale: string;
  title: string;
  description: string;
  slug: string;
}

/** Row shape for listing_media query */
interface MediaRow {
  id: string;
  storage_path: string;
  content_type: string | null;
  is_cover: boolean;
  sort_order: number;
}

/** Row shape for agency query */
interface AgencyRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  email: string | null;
  is_verified: boolean;
  created_at: string;
  theme: string | null;
  primary_color: string | null;
  accent_color: string | null;
  secondary_color: string | null;
}

/** Row shape for agency_branches query */
interface AgencyBranchRow {
  id: string;
  name: string;
  wilaya_code: string;
  commune_id: number | null;
  address_text: string | null;
}

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
      wilaya_code, commune_id, published_at, created_at, reference_number,
      listing_translations!inner(title, slug, search_vector),
      listing_media(storage_path),
      agencies(name)
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
  if (filters.agency_id) {
    query = query.eq("agency_id", filters.agency_id);
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

  // Resolve wilaya names from codes
  const wilayaCodes = [...new Set(data.map((r) => r.wilaya_code as string).filter(Boolean))];
  const communeIds = [...new Set(data.map((r) => r.commune_id as number).filter(Boolean))];

  let wilayaMap: Record<string, string> = {};
  let communeMap: Record<number, string> = {};

  if (wilayaCodes.length > 0) {
    const { data: wRows } = await supabase
      .from("wilayas")
      .select("code, name_fr")
      .in("code", wilayaCodes);
    wilayaMap = Object.fromEntries((wRows ?? []).map((w) => [w.code as string, w.name_fr as string]));
  }

  if (communeIds.length > 0) {
    const { data: cRows } = await supabase
      .from("communes")
      .select("id, name_fr")
      .in("id", communeIds);
    communeMap = Object.fromEntries((cRows ?? []).map((c) => [c.id as number, c.name_fr as string]));
  }

  const results: SearchResultDto[] = data.map((raw) => {
    const row = raw as unknown as SearchListingRow;
    const translation = row.listing_translations?.[0];
    const coverMedia = row.listing_media?.[0];

    return {
      id: row.id,
      agency_id: row.agency_id as string,
      current_status: row.current_status as SearchResultDto["current_status"],
      current_price: row.current_price,
      currency: row.currency ?? "DZD",
      listing_type: row.listing_type as SearchResultDto["listing_type"],
      property_type: row.property_type as SearchResultDto["property_type"],
      surface_m2: row.surface_m2 ?? null,
      rooms: row.rooms ?? null,
      bathrooms: row.bathrooms ?? null,
      wilaya_code: row.wilaya_code,
      wilaya_name: wilayaMap[row.wilaya_code] ?? `Wilaya ${row.wilaya_code}`,
      commune_name: row.commune_id != null ? (communeMap[row.commune_id] ?? null) : null,
      commune_id: row.commune_id ?? null,
      published_at: row.published_at ?? null,
      created_at: row.created_at,
      title: translation?.title ?? "",
      slug: translation?.slug ?? "",
      cover_url: storageUrl(coverMedia?.storage_path ?? null),
      agency_name: row.agencies?.name ?? "",
      relevance_score: null,
      reference_number: row.reference_number,
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
      wilaya_code, commune_id, published_at, created_at, details, reference_number,
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

  // Resolve wilaya and commune names in parallel
  let wilayaName = `Wilaya ${listing.wilaya_code}`;
  let communeName: string | null = null;

  const [wilayaResult, communeResult] = await Promise.all([
    listing.wilaya_code
      ? supabase
          .from("wilayas")
          .select("name_fr")
          .eq("code", listing.wilaya_code)
          .single()
      : Promise.resolve({ data: null }),
    listing.commune_id
      ? supabase
          .from("communes")
          .select("name_fr")
          .eq("id", listing.commune_id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  if (wilayaResult.data) wilayaName = wilayaResult.data.name_fr as string;
  if (communeResult.data) communeName = communeResult.data.name_fr as string;

  const typedListing = listing as unknown as ListingDetailRow;
  const typedTranslations = (allTranslations ?? []) as unknown as TranslationRow[];
  const typedMedia = (media ?? []) as unknown as MediaRow[];

  const currentTranslation = typedTranslations.find((t) => t.locale === locale);

  // Increment view count (fire and forget)
  supabase
    .from("listing_views")
    .insert({ listing_id: listingId })
    .then(() => {
      /* intentionally empty */
    });

  return {
    id: typedListing.id,
    agency_id: typedListing.agency_id as string,
    current_status: typedListing.current_status as ListingDetailPublicDto["current_status"],
    current_price: typedListing.current_price,
    currency: typedListing.currency ?? "DZD",
    listing_type: typedListing.listing_type as ListingDetailPublicDto["listing_type"],
    property_type: typedListing.property_type as ListingDetailPublicDto["property_type"],
    surface_m2: typedListing.surface_m2 ?? null,
    rooms: typedListing.rooms ?? null,
    bathrooms: typedListing.bathrooms ?? null,
    wilaya_code: typedListing.wilaya_code,
    wilaya_name: wilayaName,
    commune_name: communeName,
    commune_id: typedListing.commune_id ?? null,
    published_at: typedListing.published_at ?? null,
    created_at: typedListing.created_at,
    details: typedListing.details ?? {},
    reference_number: typedListing.reference_number,
    title: currentTranslation?.title ?? "",
    description: currentTranslation?.description ?? "",
    slug: currentTranslation?.slug ?? slug,
    media: typedMedia.map(
      (m): ListingMediaDto => ({
        id: m.id,
        storage_path: storageUrl(m.storage_path) ?? m.storage_path,
        content_type: m.content_type ?? null,
        is_cover: m.is_cover,
        sort_order: m.sort_order,
      })
    ),
    agency_name: typedListing.agencies?.name ?? "",
    agency_slug: typedListing.agencies?.slug ?? "",
    agency_logo_url: typedListing.agencies?.logo_url ?? null,
    agency_phone: typedListing.agencies?.phone ?? null,
    translations: typedTranslations.map(
      (t): ListingTranslationPublicDto => ({
        locale: t.locale,
        title: t.title,
        description: t.description,
        slug: t.slug,
      })
    ),
  };
}

/* ------------------------------------------------------------------ */
/*  getWilayas                                                         */
/* ------------------------------------------------------------------ */

export async function getWilayas(
  supabase: SupabaseClient
): Promise<WilayaDto[]> {
  const { data } = await supabase
    .from("wilayas")
    .select("code, name_fr")
    .order("code");
  return (data ?? []).map((w) => ({ code: w.code as string, name: w.name_fr as string }));
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
      "id, name, slug, description, logo_url, cover_url, phone, email, is_verified, created_at, theme, primary_color, accent_color, secondary_color"
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (error || !agency) {
    return null;
  }

  const typedAgency = agency as unknown as AgencyRow;
  const agencyId = typedAgency.id;

  // Fetch branches
  const { data: branches } = await supabase
    .from("agency_branches")
    .select("id, name, wilaya_code, commune_id, address_text")
    .eq("agency_id", agencyId);

  const typedBranches = (branches ?? []) as unknown as AgencyBranchRow[];

  // Fetch listing count
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .eq("current_status", "published")
    .is("deleted_at", null);

  return {
    id: agencyId,
    name: typedAgency.name,
    slug: typedAgency.slug,
    description: typedAgency.description ?? null,
    logo_url: typedAgency.logo_url ?? null,
    cover_url: typedAgency.cover_url ?? null,
    phone: typedAgency.phone ?? null,
    email: typedAgency.email ?? null,
    is_verified: typedAgency.is_verified ?? false,
    created_at: typedAgency.created_at,
    branches: typedBranches.map(
      (b): AgencyBranchPublicDto => ({
        id: b.id,
        name: b.name,
        wilaya_code: b.wilaya_code,
        commune_id: b.commune_id ?? null,
        address_text: b.address_text ?? null,
      })
    ),
    listing_count: count ?? 0,
    theme: typedAgency.theme ?? "minimal",
    primary_color: typedAgency.primary_color ?? null,
    accent_color: typedAgency.accent_color ?? null,
    secondary_color: typedAgency.secondary_color ?? null,
  };
}
