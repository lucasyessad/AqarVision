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
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

function mapTranslation(row: Record<string, unknown>): TranslationDto {
  return {
    id: row.id as string,
    locale: row.locale as Locale,
    title: row.title as string,
    description: row.description as string,
    slug: row.slug as string,
  };
}

function mapMedia(row: Record<string, unknown>): MediaDto {
  return {
    id: row.id as string,
    storage_path: row.storage_path as string,
    content_type: row.content_type as string,
    is_cover: row.is_cover as boolean,
    sort_order: row.sort_order as number,
  };
}

function mapListing(
  row: Record<string, unknown>,
  translations: TranslationDto[] = [],
  coverUrl: string | null = null
): ListingDto {
  return {
    id: row.id as string,
    agency_id: row.agency_id as string,
    current_status: row.current_status as ListingStatus,
    current_price: row.current_price as number,
    currency: (row.currency as string) ?? "DZD",
    listing_type: row.listing_type as ListingDto["listing_type"],
    property_type: row.property_type as ListingDto["property_type"],
    surface_m2: (row.surface_m2 as number) ?? null,
    rooms: (row.rooms as number) ?? null,
    bathrooms: (row.bathrooms as number) ?? null,
    wilaya_code: row.wilaya_code as string,
    commune_id: (row.commune_id as number) ?? null,
    version: row.version as number,
    published_at: (row.published_at as string) ?? null,
    created_at: row.created_at as string,
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
      created_by: userId,
    })
    .select("id, current_status")
    .single();

  if (error || !listing) {
    throw new Error(error?.message ?? "Failed to create listing");
  }

  // Insert initial price version
  await supabase.from("price_versions").insert({
    listing_id: listing.id,
    price: data.current_price,
    currency: "DZD",
    changed_by: userId,
  });

  // Insert initial status version
  await supabase.from("status_versions").insert({
    listing_id: listing.id,
    status: "draft",
    changed_by: userId,
  });

  return {
    listing_id: listing.id as string,
    status: listing.current_status as ListingStatus,
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

  if ((current.version as number) !== expectedVersion) {
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

  return mapListing(updated);
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

  const mappedTranslations = (translations ?? []).map((t) =>
    mapTranslation(t as unknown as Record<string, unknown>)
  );

  const mappedMedia = (media ?? []).map((m) =>
    mapMedia(m as unknown as Record<string, unknown>)
  );

  const coverMedia = mappedMedia.find((m) => m.is_cover);
  const agency = listing.agencies as unknown as Record<string, unknown> | null;

  return {
    ...mapListing(
      listing as unknown as Record<string, unknown>,
      mappedTranslations,
      coverMedia?.storage_path ?? null
    ),
    media: mappedMedia,
    agency_name: (agency?.name as string) ?? "",
    agency_slug: (agency?.slug as string) ?? "",
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

  return data.map((row) => {
    const translations = (
      (row.listing_translations as Record<string, unknown>[]) ?? []
    )
      .filter((t) => t.locale === "fr")
      .map(mapTranslation);

    const mediaRows = (row.listing_media as Record<string, unknown>[]) ?? [];
    const cover = mediaRows.find((m) => m.is_cover === true);

    return mapListing(
      row as unknown as Record<string, unknown>,
      translations,
      (cover?.storage_path as string) ?? null
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

  return mapTranslation(translation as unknown as Record<string, unknown>);
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

  return data.map((t) => mapTranslation(t as unknown as Record<string, unknown>));
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

  const locales = (translations ?? []).map((t) => t.locale as string);
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

  if (!listing || (listing.current_price as number) <= 0) {
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
    .update({ current_status: "pending_review" })
    .eq("id", listingId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("status_versions").insert({
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
