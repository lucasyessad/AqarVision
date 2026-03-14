import type { SupabaseClient } from "@supabase/supabase-js";
import type { FavoriteDto, NoteDto, SavedSearchDto } from "../types/favorites.types";

/**
 * Toggles a favorite: inserts if not present, deletes if already present.
 * Returns { favorited: true } when added, { favorited: false } when removed.
 */
export async function toggleFavorite(
  supabase: SupabaseClient,
  userId: string,
  listingId: string
): Promise<{ favorited: boolean }> {
  // Check if favorite already exists
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }

    return { favorited: false };
  }

  // Add favorite
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, listing_id: listingId });

  if (error) {
    throw new Error(error.message);
  }

  return { favorited: true };
}

/**
 * Returns all favorites for a user, ordered by most recent.
 */
export async function getUserFavorites(
  supabase: SupabaseClient,
  userId: string
): Promise<FavoriteDto[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id, listing_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/**
 * Saves or updates a note on a listing.
 * Uses upsert on (user_id, listing_id) to allow one note per listing per user.
 */
export async function saveNote(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  body: string
): Promise<NoteDto> {
  const { data, error } = await supabase
    .from("notes")
    .upsert(
      {
        user_id: userId,
        listing_id: listingId,
        body: body.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,listing_id" }
    )
    .select("id, listing_id, body, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save note");
  }

  return data;
}

/**
 * Returns all notes for a user, ordered by most recent update.
 */
export async function getUserNotes(
  supabase: SupabaseClient,
  userId: string
): Promise<NoteDto[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("id, listing_id, body, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/**
 * Saves a new search with name and filters.
 */
export async function saveSearch(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  filters: Record<string, unknown>
): Promise<SavedSearchDto> {
  const { data, error } = await supabase
    .from("saved_searches")
    .insert({
      user_id: userId,
      name: name.trim(),
      filters,
    })
    .select("id, name, filters, notify, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save search");
  }

  return data;
}

/**
 * Returns all saved searches for a user, ordered by most recent.
 */
export async function getUserSearches(
  supabase: SupabaseClient,
  userId: string
): Promise<SavedSearchDto[]> {
  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, name, filters, notify, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/**
 * Deletes a saved search by ID (only if owned by the user via RLS).
 */
export async function deleteSavedSearch(
  supabase: SupabaseClient,
  userId: string,
  searchId: string
): Promise<void> {
  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", searchId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
