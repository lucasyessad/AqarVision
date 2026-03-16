import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import type {
  ListingDto,
  ListingDetailDto,
  TranslationDto,
  MediaDto,
  CreateListingResult,
  ListingStatus,
} from "../types/listing.types";
import type {
  CreateListingInput,
  UpdateListingInput,
  UpsertTranslationInput,
  Locale,
} from "../schemas/listing.schema";

/* ------------------------------------------------------------------ */
/*  Select clauses                                                     */
/* ------------------------------------------------------------------ */

const LISTING_SELECT = `
  id, agency_id, current_status, current_price, currency,
  listing_type, property_type, surface_m2, rooms, bathrooms,
  wilaya_code, commune_id, version, published_at, created_at
`;

const TRANSLATION_SELECT = "id, locale, title, description, slug";

/* ------------------------------------------------------------------ */
/*  Supabase row shapes                                                */
/* ------------------------------------------------------------------ */

interface ListingRow {
  id: string;
  agency_id: string;
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
  version: number;
  published_at: string | null;
  created_at: string;
}

interface ListingWithRelationsRow extends ListingRow {
  agencies: { name: string; slug: string } | null;
  listing_translations?: TranslationRow[];
  listing_media?: MediaRow[];
}

interface TranslationRow {
  id: string;
  locale: string;
  title: string;
  description: string;
  slug: string;
}

interface MediaRow {
  id: string;
  storage_path: string;
  content_type: string;
  is_cover: boolean;
  sort_order: number;
}

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

function mapTranslation(row: TranslationRow): TranslationDto {
  return {
    id: row.id,
    locale: row.locale as Locale,
    title: row.title,
    description: row.description,
    slug: row.slug,
  };
}

function mapMedia(row: MediaRow): MediaDto {
  return {
    id: row.id,
    storage_path: row.storage_path,
    content_type: row.content_type,
    is_cover: row.is_cover,
    sort_order: row.sort_order,
  };
}

function mapListing(
  row: ListingRow,
  translations: TranslationDto[] = [],
  coverUrl: string | null = null
): ListingDto {
  return {
    id: row.id,
    agency_id: row.agency_id,
    current_status: row.current_status as ListingStatus,
    current_price: row.current_price,
    currency: row.currency ?? "DZD",
    listing_type: row.listing_type as ListingDto["listing_type"],
    property_type: row.property_type as ListingDto["property_type"],
    surface_m2: row.surface_m2 ?? null,
    rooms: row.rooms ?? null,
    bathrooms: row.bathrooms ?? null,
    wilaya_code: row.wilaya_code,
    commune_id: row.commune_id ?? null,
    version: row.version,
    published_at: row.published_at ?? null,
    created_at: row.created_at,
    translations,
    cover_url: coverUrl,
  };
}

/* ------------------------------------------------------------------ */
/*  Service functions                                                  */
/* ------------------------------------------------------------------ */

export async function create(
  supabase: SupabaseClient,
  userId: string,
  data: CreateListingInput
): Promise<CreateListingResult> {
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      agency_id: data.agency_id,
      branch_id: data.branch_id ?? null,
      listing_type: data.listing_type,
      property_type: data.property_type,
      current_price: data.current_price,
      wilaya_code: data.wilaya_code,
      commune_id: data.commune_id ?? null,
      surface_m2: data.surface_m2 ?? null,
      rooms: data.rooms ?? null,
      bathrooms: data.bathrooms ?? null,
      details: data.details ?? null,
      current_status: "draft",
      currency: "DZD",
      version: 1,
    })
    .select("id, current_status")
    .single();

  if (error || !listing) {
    throw new Error(error?.message ?? "Failed to create listing");
  }

  // Insert initial price version
  await supabase.from("listing_price_versions").insert({
    listing_id: listing.id,
    price: data.current_price,
    currency: "DZD",
    changed_by: userId,
  });

  // Insert initial status version
  await supabase.from("listing_status_versions").insert({
    listing_id: listing.id,
    status: "draft",
    changed_by: userId,
  });

  const created = listing as unknown as { id: string; current_status: string };
  return {
    listing_id: created.id,
    status: created.current_status as ListingStatus,
  };
}

export async function update(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  expectedVersion: number,
  data: Partial<Omit<CreateListingInput, "agency_id">>
): Promise<ListingDto> {
  // Check version for optimistic locking
  const { data: current, error: fetchError } = await supabase
    .from("listings")
    .select("version")
    .eq("id", listingId)
    .single();

  if (fetchError || !current) {
    throw new Error("Listing not found");
  }

  const currentRow = current as unknown as { version: number };
  if (currentRow.version !== expectedVersion) {
    const err = new Error("Version conflict — listing was modified by another user");
    err.name = "OPTIMISTIC_LOCK_CONFLICT";
    throw err;
  }

  const updatePayload: Record<string, unknown> = {
    version: expectedVersion + 1,
  };

  if (data.branch_id !== undefined) updatePayload.branch_id = data.branch_id;
  if (data.listing_type !== undefined) updatePayload.listing_type = data.listing_type;
  if (data.property_type !== undefined) updatePayload.property_type = data.property_type;
  if (data.current_price !== undefined) updatePayload.current_price = data.current_price;
  if (data.wilaya_code !== undefined) updatePayload.wilaya_code = data.wilaya_code;
  if (data.commune_id !== undefined) updatePayload.commune_id = data.commune_id;
  if (data.surface_m2 !== undefined) updatePayload.surface_m2 = data.surface_m2;
  if (data.rooms !== undefined) updatePayload.rooms = data.rooms;
  if (data.bathrooms !== undefined) updatePayload.bathrooms = data.bathrooms;
  if (data.details !== undefined) updatePayload.details = data.details;

  const { data: updated, error: updateError } = await supabase
    .from("listings")
    .update(updatePayload)
    .eq("id", listingId)
    .eq("version", expectedVersion)
    .select(LISTING_SELECT)
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message ?? "Failed to update listing");
  }

  // Create revision record
  await supabase.from("listing_revisions").insert({
    listing_id: listingId,
    version: expectedVersion + 1,
    changed_by: userId,
    changes: updatePayload,
  });

  return mapListing(updated as unknown as ListingRow);
}

export async function getById(
  supabase: SupabaseClient,
  listingId: string
): Promise<ListingDetailDto | null> {
  const { data: listing, error } = await supabase
    .from("listings")
    .select(`${LISTING_SELECT}, agencies(name, slug)`)
    .eq("id", listingId)
    .is("deleted_at", null)
    .single();

  if (error || !listing) {
    return null;
  }

  const { data: translations } = await supabase
    .from("listing_translations")
    .select(TRANSLATION_SELECT)
    .eq("listing_id", listingId);

  const { data: media } = await supabase
    .from("listing_media")
    .select("id, storage_path, content_type, is_cover, sort_order")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  const typedListing = listing as unknown as ListingWithRelationsRow;
  const typedTranslations = (translations ?? []) as unknown as TranslationRow[];
  const typedMedia = (media ?? []) as unknown as MediaRow[];

  const mappedTranslations = typedTranslations.map(mapTranslation);
  const mappedMedia = typedMedia.map(mapMedia);

  const coverMedia = mappedMedia.find((m) => m.is_cover);

  return {
    ...mapListing(
      typedListing,
      mappedTranslations,
      coverMedia?.storage_path ?? null
    ),
    media: mappedMedia,
    agency_name: typedListing.agencies?.name ?? "",
    agency_slug: typedListing.agencies?.slug ?? "",
  };
}

export async function getByAgency(
  supabase: SupabaseClient,
  agencyId: string,
  filters?: { status?: string; listing_type?: string; property_type?: string }
): Promise<ListingDto[]> {
  let query = supabase
    .from("listings")
    .select(`${LISTING_SELECT}, listing_translations(${TRANSLATION_SELECT}), listing_media(id, storage_path, is_cover)`)
    .eq("agency_id", agencyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("current_status", filters.status);
  }
  if (filters?.listing_type) {
    query = query.eq("listing_type", filters.listing_type);
  }
  if (filters?.property_type) {
    query = query.eq("property_type", filters.property_type);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((raw) => {
    const row = raw as unknown as ListingWithRelationsRow;
    const translations = (row.listing_translations ?? [])
      .filter((t) => t.locale === "fr")
      .map(mapTranslation);

    const mediaRows = row.listing_media ?? [];
    const cover = mediaRows.find((m) => m.is_cover === true);

    return mapListing(
      row,
      translations,
      cover?.storage_path ?? null
    );
  });
}

export async function upsertTranslation(
  supabase: SupabaseClient,
  listingId: string,
  data: Omit<UpsertTranslationInput, "listing_id">
): Promise<TranslationDto> {
  const { data: translation, error } = await supabase
    .from("listing_translations")
    .upsert(
      {
        listing_id: listingId,
        locale: data.locale,
        title: data.title,
        description: data.description,
        slug: data.slug,
      },
      { onConflict: "listing_id,locale" }
    )
    .select(TRANSLATION_SELECT)
    .single();

  if (error || !translation) {
    throw new Error(error?.message ?? "Failed to upsert translation");
  }

  return mapTranslation(translation as unknown as TranslationRow);
}

export async function getTranslations(
  supabase: SupabaseClient,
  listingId: string
): Promise<TranslationDto[]> {
  const { data, error } = await supabase
    .from("listing_translations")
    .select(TRANSLATION_SELECT)
    .eq("listing_id", listingId);

  if (error || !data) {
    return [];
  }

  return (data as unknown as TranslationRow[]).map(mapTranslation);
}

export async function canPublish(
  supabase: SupabaseClient,
  listingId: string
): Promise<{ canPublish: boolean; missing: string[] }> {
  const missing: string[] = [];

  // Check translations
  const { data: translations } = await supabase
    .from("listing_translations")
    .select("locale")
    .eq("listing_id", listingId);

  const locales = (translations ?? []).map((t) => (t as unknown as { locale: string }).locale);
  if (!locales.includes("fr")) missing.push("french_translation");
  if (!locales.includes("ar")) missing.push("arabic_translation");

  // Check cover media
  const { data: coverMedia } = await supabase
    .from("listing_media")
    .select("id")
    .eq("listing_id", listingId)
    .eq("is_cover", true)
    .limit(1);

  if (!coverMedia || coverMedia.length === 0) {
    missing.push("cover_media");
  }

  // Check price
  const { data: listing } = await supabase
    .from("listings")
    .select("current_price")
    .eq("id", listingId)
    .single();

  const priceRow = listing as unknown as { current_price: number } | null;
  if (!priceRow || priceRow.current_price <= 0) {
    missing.push("price_set");
  }

  return { canPublish: missing.length === 0, missing };
}

export async function submitForReview(
  supabase: SupabaseClient,
  userId: string,
  listingId: string
): Promise<void> {
  const check = await canPublish(supabase, listingId);
  if (!check.canPublish) {
    throw new Error(`Cannot publish: missing ${check.missing.join(", ")}`);
  }

  const { error } = await supabase
    .from("listings")
    .update({ current_status: "published", published_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("listing_status_versions").insert({
    listing_id: listingId,
    status: "pending_review",
    changed_by: userId,
  });
}

export async function changePrice(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  newPrice: number,
  expectedVersion: number,
  reason?: string
): Promise<void> {
  const { error } = await supabase.rpc("change_listing_price", {
    p_listing_id: listingId,
    p_new_price: newPrice,
    p_expected_version: expectedVersion,
    p_changed_by: userId,
    p_reason: reason ?? null,
  });

  if (error) {
    if (error.message.includes("version") || error.message.includes("conflict")) {
      logger.warn({ listingId, userId, expectedVersion }, "Optimistic lock conflict on price change");
      const err = new Error("Price was changed by another user");
      err.name = "OPTIMISTIC_LOCK_CONFLICT";
      throw err;
    }
    logger.error({ err: error, listingId, userId }, "changePrice RPC failed");
    throw new Error(error.message);
  }
}

export async function softDelete(
  supabase: SupabaseClient,
  listingId: string
): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) {
    throw new Error(error.message);
  }
}
