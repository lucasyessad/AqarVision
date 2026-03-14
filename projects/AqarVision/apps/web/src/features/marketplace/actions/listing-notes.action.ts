"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "@/features/marketplace/types/search.types";

const SaveNoteSchema = z.object({
  listing_id: z.string().uuid(),
  content: z.string().max(2000, "Note trop longue (max 2000 caractères)"),
});

export interface NoteDto {
  id: string;
  content: string;
  updated_at: string;
}

export async function saveListingNote(
  _prevState: ActionResult<NoteDto> | null,
  formData: FormData
): Promise<ActionResult<NoteDto>> {
  const parsed = SaveNoteSchema.safeParse({
    listing_id: formData.get("listing_id"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentification requise" },
    };
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("listing_notes")
    .upsert(
      {
        user_id: user.id,
        listing_id: parsed.data.listing_id,
        content: parsed.data.content,
        updated_at: now,
      },
      { onConflict: "user_id,listing_id" }
    )
    .select("id, content, updated_at")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: {
        code: "SAVE_NOTE_FAILED",
        message: error?.message ?? "Échec de la sauvegarde",
      },
    };
  }

  revalidatePath("/[locale]/favorites", "page");

  return {
    success: true,
    data: {
      id: data.id as string,
      content: data.content as string,
      updated_at: data.updated_at as string,
    },
  };
}

export async function getListingNote(
  listingId: string
): Promise<NoteDto | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("listing_notes")
    .select("id, content, updated_at")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id as string,
    content: data.content as string,
    updated_at: data.updated_at as string,
  };
}
