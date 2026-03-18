"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import {
  toggleFavorite,
  createCollection,
  moveToCollection,
} from "../services/favorite.service";
import { updateTag } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";
import type { FavoriteCollection } from "../types/favorites.types";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export async function toggleFavoriteAction(
  listingId: string
): Promise<ActionResult<{ favorited: boolean }>> {
  if (!listingId) {
    return fail("VALIDATION_ERROR", "ID de l'annonce requis");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Vous devez être connecté");
  }

  try {
    const result = await toggleFavorite(supabase, user.id, listingId);
    updateTag(CacheTags.favorites(user.id));
    return ok(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    return fail("INTERNAL_ERROR", msg);
  }
}

const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Nom requis")
    .max(100, "Nom trop long")
    .transform(sanitizeInput),
});

export async function createCollectionAction(
  name: string
): Promise<ActionResult<FavoriteCollection>> {
  const parsed = createCollectionSchema.safeParse({ name });
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      parsed.error.errors[0]?.message ?? "Données invalides"
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Vous devez être connecté");
  }

  try {
    const collection = await createCollection(
      supabase,
      user.id,
      parsed.data.name
    );
    updateTag(CacheTags.favorites(user.id));
    return ok(collection);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    return fail("INTERNAL_ERROR", msg);
  }
}

export async function moveToCollectionAction(
  favoriteId: string,
  collectionId: string | null
): Promise<ActionResult<void>> {
  if (!favoriteId) {
    return fail("VALIDATION_ERROR", "ID du favori requis");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Vous devez être connecté");
  }

  try {
    await moveToCollection(supabase, favoriteId, collectionId);
    updateTag(CacheTags.favorites(user.id));
    return ok(undefined);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    return fail("INTERNAL_ERROR", msg);
  }
}
