import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollectionDto } from "../types/collections.types";

export async function getUserCollections(
  supabase: SupabaseClient,
  userId: string
): Promise<CollectionDto[]> {
  const { data, error } = await supabase
    .from("favorite_collections")
    .select("id, name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Count favorites per collection
  const ids = (data ?? []).map((c) => c.id as string);
  if (ids.length === 0) return [];

  const { data: counts } = await supabase
    .from("favorites")
    .select("collection_id")
    .in("collection_id", ids)
    .eq("user_id", userId);

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    const cid = row.collection_id as string;
    countMap[cid] = (countMap[cid] ?? 0) + 1;
  }

  return (data ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    created_at: c.created_at as string,
    favorite_count: countMap[c.id as string] ?? 0,
  }));
}

export async function createCollection(
  supabase: SupabaseClient,
  userId: string,
  name: string
): Promise<CollectionDto> {
  const { data, error } = await supabase
    .from("favorite_collections")
    .insert({ user_id: userId, name: name.trim() })
    .select("id, name, created_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Création échouée");

  return {
    id: data.id as string,
    name: data.name as string,
    created_at: data.created_at as string,
    favorite_count: 0,
  };
}

export async function renameCollection(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  name: string
): Promise<void> {
  const { error } = await supabase
    .from("favorite_collections")
    .update({ name: name.trim() })
    .eq("id", collectionId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function deleteCollection(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string
): Promise<void> {
  const { error } = await supabase
    .from("favorite_collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function assignFavoriteToCollection(
  supabase: SupabaseClient,
  userId: string,
  favoriteId: string,
  collectionId: string | null
): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .update({ collection_id: collectionId })
    .eq("id", favoriteId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
