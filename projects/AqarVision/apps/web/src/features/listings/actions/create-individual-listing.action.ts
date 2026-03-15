"use server";

import { createClient } from "@/lib/supabase/server";
import { IndividualListingSchema } from "../schemas/individual-listing.schema";
import { getEffectiveQuota } from "@/features/billing/services/individual-billing.service";
import type { ActionResult } from "../types/listing.types";

export interface CreateIndividualListingResult {
  listing_id: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

const INDIVIDUAL_ACTIVE_STATUSES = ["draft", "published", "paused", "pending_review"];

export async function createIndividualListingAction(
  _prevState: ActionResult<CreateIndividualListingResult> | null,
  formData: FormData
): Promise<ActionResult<CreateIndividualListingResult>> {
  const raw = {
    listing_type: formData.get("listing_type"),
    property_type: formData.get("property_type"),
    wilaya_code: formData.get("wilaya_code") as string,
    commune_id: formData.get("commune_id") ? Number(formData.get("commune_id")) : undefined,
    title: formData.get("title") as string,
    current_price: Number(formData.get("current_price")),
    surface_m2: formData.get("surface_m2") ? Number(formData.get("surface_m2")) : undefined,
    rooms: formData.get("rooms") ? Number(formData.get("rooms")) : undefined,
    bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : undefined,
    details: formData.get("details") ? JSON.parse(formData.get("details") as string) : {},
  };

  const parsed = IndividualListingSchema.safeParse(raw);
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Connexion requise" },
    };
  }

  const d = parsed.data;

  // Quota check — dynamic quota (free + packs + subscription)
  const [effectiveQuota, { count: activeCount }] = await Promise.all([
    getEffectiveQuota(supabase, user.id),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("individual_owner_id", user.id)
      .eq("owner_type", "individual")
      .in("current_status", INDIVIDUAL_ACTIVE_STATUSES)
      .is("deleted_at", null),
  ]);

  if ((activeCount ?? 0) >= effectiveQuota) {
    return {
      success: false,
      error: {
        code: "QUOTA_EXCEEDED",
        message: `Vous avez atteint votre limite de ${effectiveQuota} annonces actives. Archivez une annonce ou augmentez votre quota dans votre espace.`,
      },
    };
  }

  // Insert listing with owner_type='individual'
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      owner_type: "individual",
      individual_owner_id: user.id,
      agency_id: null,
      listing_type: d.listing_type,
      property_type: d.property_type,
      current_price: d.current_price,
      currency: "DZD",
      wilaya_code: d.wilaya_code,
      commune_id: d.commune_id ?? null,
      surface_m2: d.surface_m2 ?? null,
      rooms: d.rooms ?? null,
      bathrooms: d.bathrooms ?? null,
      details: d.details,
      current_status: "published",
      version: 1,
    })
    .select("id")
    .single();

  if (listingError || !listing) {
    return {
      success: false,
      error: {
        code: "CREATE_FAILED",
        message: listingError?.message ?? "Erreur lors de la création",
      },
    };
  }

  const listingId = listing.id as string;
  const slug = `${slugify(d.title)}-${listingId.slice(0, 8)}`;

  // Insert French translation with auto-generated slug
  const { error: translationError } = await supabase
    .from("listing_translations")
    .insert({
      listing_id: listingId,
      locale: "fr",
      title: d.title,
      description: "",
      slug,
    });

  if (translationError) {
    // Translation failed — soft-delete the listing to avoid orphan
    await supabase
      .from("listings")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", listingId);

    return {
      success: false,
      error: {
        code: "TRANSLATION_FAILED",
        message: translationError.message,
      },
    };
  }

  // Record initial price and status versions
  await Promise.all([
    supabase.from("price_versions").insert({
      listing_id: listingId,
      price: d.current_price,
      currency: "DZD",
      changed_by: user.id,
    }),
    supabase.from("status_versions").insert({
      listing_id: listingId,
      status: "published",
      changed_by: user.id,
    }),
  ]);

  return { success: true, data: { listing_id: listingId, slug } };
}
