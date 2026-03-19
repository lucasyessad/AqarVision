import type { SupabaseClient } from "@supabase/supabase-js";
import type { Favorite, FavoriteCollection } from "../types/favorites.types";
import type { ListingCard } from "@/features/listings/types/listing.types";

export async function getUserFavorites(
  supabase: SupabaseClient,
  userId: string,
  collectionId?: string | null
): Promise<Favorite[]> {
  let query = supabase
    .from("favorites")
    .select(
      `
      id,
      user_id,
      listing_id,
      collection_id,
      created_at,
      listing:listings(
        id,
        listing_type,
        property_type,
        current_price,
        currency,
        details,
        created_at,
        translations:listing_translations(title, slug, locale),
        media:listing_media(storage_path, is_cover),
        commune:communes(name_fr),
        wilaya:wilayas(name_fr),
        agency:agencies(name, verification_level:verifications(level))
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (collectionId === null) {
    query = query.is("collection_id", null);
  } else if (collectionId) {
    query = query.eq("collection_id", collectionId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const listing = row.listing as Record<string, unknown> | null;
    if (!listing) {
      return {
        id: row.id as string,
        user_id: row.user_id as string,
        listing_id: row.listing_id as string,
        collection_id: row.collection_id as string | null,
        created_at: row.created_at as string,
        listing: {
          id: row.listing_id as string,
          listing_type: "sale",
          property_type: "apartment",
          price: 0,
          currency: "DZD",
          area_m2: 0,
          rooms: null,
          title: "",
          slug: "",
          wilaya_name: "",
          commune_name: "",
          cover_url: null,
          agency_name: null,
          agency_verified_level: null,
          created_at: row.created_at as string,
        } as ListingCard,
      };
    }

    const translations = listing.translations as Array<{
      title: string;
      slug: string;
      locale: string;
    }>;
    const media = listing.media as Array<{
      storage_path: string;
      is_cover: boolean;
    }>;
    const details = listing.details as { area_m2: number; rooms?: number };
    const commune = listing.commune as { name_fr: string } | null;
    const wilaya = listing.wilaya as { name_fr: string } | null;
    const agency = listing.agency as {
      name: string;
      verification_level: Array<{ level: number }> | null;
    } | null;

    const fr = translations?.find((t) => t.locale === "fr");
    const cover = media?.find((m) => m.is_cover);

    return {
      id: row.id as string,
      user_id: row.user_id as string,
      listing_id: row.listing_id as string,
      collection_id: row.collection_id as string | null,
      created_at: row.created_at as string,
      listing: {
        id: listing.id as string,
        listing_type: listing.listing_type as ListingCard["listing_type"],
        property_type: listing.property_type as ListingCard["property_type"],
        price: listing.current_price as number,
        currency: listing.currency as string,
        area_m2: details?.area_m2 ?? 0,
        rooms: details?.rooms ?? null,
        title: fr?.title ?? "",
        slug: fr?.slug ?? "",
        wilaya_name: wilaya?.name_fr ?? "",
        commune_name: commune?.name_fr ?? "",
        cover_url: cover?.storage_path ?? null,
        agency_name: agency?.name ?? null,
        agency_verified_level:
          agency?.verification_level?.[0]?.level ?? null,
        created_at: listing.created_at as string,
      } as ListingCard,
    };
  });
}

export async function getUserCollections(
  supabase: SupabaseClient,
  userId: string
): Promise<FavoriteCollection[]> {
  const { data, error } = await supabase
    .from("favorite_collections")
    .select(
      `
      id,
      user_id,
      name,
      created_at,
      favorites:favorites(count)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const favorites = row.favorites as Array<{ count: number }> | undefined;
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      name: row.name as string,
      created_at: row.created_at as string,
      listings_count: favorites?.[0]?.count ?? 0,
    };
  });
}

export async function toggleFavorite(
  supabase: SupabaseClient,
  userId: string,
  listingId: string
): Promise<{ favorited: boolean }> {
  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return { favorited: false };
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: userId,
    listing_id: listingId,
  });
  if (error) throw error;
  return { favorited: true };
}

export async function createCollection(
  supabase: SupabaseClient,
  userId: string,
  name: string
): Promise<FavoriteCollection> {
  const { data, error } = await supabase
    .from("favorite_collections")
    .insert({ user_id: userId, name })
    .select("id, user_id, name, created_at")
    .single();

  if (error) throw error;
  return { ...data, listings_count: 0 } as FavoriteCollection;
}

export async function moveToCollection(
  supabase: SupabaseClient,
  favoriteId: string,
  collectionId: string | null
): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .update({ collection_id: collectionId })
    .eq("id", favoriteId);

  if (error) throw error;
}
