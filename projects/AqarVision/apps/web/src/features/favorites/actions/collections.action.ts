"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CreateCollectionSchema,
  RenameCollectionSchema,
  DeleteCollectionSchema,
  AssignFavoriteSchema,
} from "../schemas/collections.schema";
import {
  createCollection,
  renameCollection,
  deleteCollection,
  assignFavoriteToCollection,
} from "../services/collections.service";
import type { CollectionDto, ActionResult } from "../types/collections.types";

export async function createCollectionAction(
  _prevState: ActionResult<CollectionDto> | null,
  formData: FormData
): Promise<ActionResult<CollectionDto>> {
  const parsed = CreateCollectionSchema.safeParse({
    name: formData.get("name"),
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

  try {
    const collection = await createCollection(supabase, user.id, parsed.data.name);
    revalidatePath("/[locale]/espace/collections", "page");
    return { success: true, data: collection };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "CREATE_COLLECTION_FAILED",
        message: err instanceof Error ? err.message : "Échec de la création",
      },
    };
  }
}

export async function renameCollectionAction(
  _prevState: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const parsed = RenameCollectionSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
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

  try {
    await renameCollection(supabase, user.id, parsed.data.id, parsed.data.name);
    revalidatePath("/[locale]/espace/collections", "page");
    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "RENAME_COLLECTION_FAILED",
        message: err instanceof Error ? err.message : "Échec du renommage",
      },
    };
  }
}

export async function deleteCollectionAction(
  _prevState: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const parsed = DeleteCollectionSchema.safeParse({
    id: formData.get("id"),
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

  try {
    await deleteCollection(supabase, user.id, parsed.data.id);
    revalidatePath("/[locale]/espace/collections", "page");
    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "DELETE_COLLECTION_FAILED",
        message: err instanceof Error ? err.message : "Échec de la suppression",
      },
    };
  }
}

export async function assignFavoriteAction(
  _prevState: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const collectionIdRaw = formData.get("collection_id");
  const parsed = AssignFavoriteSchema.safeParse({
    favorite_id: formData.get("favorite_id"),
    collection_id: collectionIdRaw === "" || collectionIdRaw === "null" ? null : collectionIdRaw,
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

  try {
    await assignFavoriteToCollection(
      supabase,
      user.id,
      parsed.data.favorite_id,
      parsed.data.collection_id
    );
    revalidatePath("/[locale]/espace/collections", "page");
    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "ASSIGN_FAILED",
        message: err instanceof Error ? err.message : "Échec de l'assignation",
      },
    };
  }
}
