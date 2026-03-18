import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateListingInput } from "../schemas/listing.schema";
import type { Listing, ListingCard } from "../types/listing.types";

export async function createListing(
  supabase: SupabaseClient,
  input: CreateListingInput,
  ownerType: "agency" | "individual",
  ownerId: string
): Promise<Listing> {
  const { data, error } = await supabase.rpc("create_listing_atomic", {
    p_listing_type: input.listing_type,
    p_property_type: input.property_type,
    p_owner_type: ownerType,
    p_owner_id: ownerId,
    p_wilaya_code: input.wilaya_code,
    p_commune_id: input.commune_id,
    p_address: input.address ?? null,
    p_latitude: input.latitude ?? null,
    p_longitude: input.longitude ?? null,
    p_details: input.details,
    p_price: input.price,
    p_currency: input.currency,
    p_translations: input.translations,
    p_contact_phone: input.contact_phone ?? null,
    p_show_phone: input.show_phone,
    p_accept_messages: input.accept_messages,
  });

  if (error) throw error;
  return data as Listing;
}

export async function getListingBySlug(
  supabase: SupabaseClient,
  slug: string,
  locale: string
): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listing_translations")
    .select(
      `
      listing:listings(
        *,
        translations:listing_translations(*),
        media:listing_media(*)
      )
    `
    )
    .eq("slug", slug)
    .eq("locale", locale)
    .single();

  if (error || !data?.listing) return null;
  return data.listing as unknown as Listing;
}

export async function getAgencyListings(
  supabase: SupabaseClient,
  agencyId: string,
  {
    status,
    page = 1,
    limit = 20,
  }: { status?: string; page?: number; limit?: number } = {}
): Promise<{ listings: ListingCard[]; total: number }> {
  let query = supabase
    .from("listings")
    .select(
      `
      id,
      listing_type,
      property_type,
      price,
      currency,
      details,
      status,
      created_at,
      translations:listing_translations(title, slug, locale),
      media:listing_media(storage_path, is_cover),
      commune:communes(name_fr),
      wilaya:wilayas(name_fr)
    `,
      { count: "exact" }
    )
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  const listings: ListingCard[] = (data ?? []).map((item: Record<string, unknown>) => {
    const translations = item.translations as Array<{ title: string; slug: string; locale: string }>;
    const media = item.media as Array<{ storage_path: string; is_cover: boolean }>;
    const details = item.details as { area_m2: number; rooms?: number };
    const commune = item.commune as { name_fr: string } | null;
    const wilaya = item.wilaya as { name_fr: string } | null;
    const fr = translations?.find((t) => t.locale === "fr");
    const cover = media?.find((m) => m.is_cover);

    return {
      id: item.id as string,
      listing_type: item.listing_type as ListingCard["listing_type"],
      property_type: item.property_type as ListingCard["property_type"],
      price: item.price as number,
      currency: item.currency as string,
      area_m2: details?.area_m2 ?? 0,
      rooms: details?.rooms ?? null,
      title: fr?.title ?? "",
      slug: fr?.slug ?? "",
      wilaya_name: wilaya?.name_fr ?? "",
      commune_name: commune?.name_fr ?? "",
      cover_url: cover?.storage_path ?? null,
      latitude: (item.latitude as number) ?? null,
      longitude: (item.longitude as number) ?? null,
      agency_name: null,
      agency_verified_level: null,
      created_at: item.created_at as string,
    };
  });

  return { listings, total: count ?? 0 };
}

export async function saveDraft(
  supabase: SupabaseClient,
  listingId: string | null,
  data: Partial<CreateListingInput>,
  ownerType: "agency" | "individual",
  ownerId: string
): Promise<string> {
  if (listingId) {
    const { error } = await supabase
      .from("listings")
      .update({
        ...data,
        status: "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (error) throw error;
    return listingId;
  }

  const { data: newListing, error } = await supabase
    .from("listings")
    .insert({
      listing_type: data.listing_type ?? "sale",
      property_type: data.property_type ?? "apartment",
      owner_type: ownerType,
      ...(ownerType === "agency"
        ? { agency_id: ownerId }
        : { user_id: ownerId }),
      status: "draft",
      price: data.price ?? 0,
      currency: data.currency ?? "DZD",
      details: data.details ?? {},
      wilaya_code: data.wilaya_code ?? "",
      commune_id: data.commune_id ?? 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  return newListing.id;
}
