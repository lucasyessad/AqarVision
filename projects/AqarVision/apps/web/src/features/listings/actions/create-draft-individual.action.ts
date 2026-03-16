"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { ok, fail } from "@/types/action-result";
import { DraftListingSchema } from "../schemas/individual-listing-v2.schema";
import { getEffectiveQuota } from "@/features/billing/services/individual-billing.service";
import type { ActionResult } from "@/types/action-result";

export interface DraftListingResult {
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

export async function createDraftIndividualListingAction(
  data: unknown
): Promise<ActionResult<DraftListingResult>> {
  const parsed = DraftListingSchema.safeParse(data);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      parsed.error.errors.map((e) => e.message).join(", ")
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Connexion requise");
  }

  const d = parsed.data;

  // Quota check
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
    return fail(
      "QUOTA_EXCEEDED",
      `Vous avez atteint votre limite de ${effectiveQuota} annonces actives. Archivez une annonce ou augmentez votre quota.`
    );
  }

  // Build location point if coordinates provided
  const locationValue =
    d.latitude !== undefined && d.longitude !== undefined
      ? `POINT(${d.longitude} ${d.latitude})`
      : null;

  // Insert draft listing
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
      address_text: d.address_text ?? null,
      ...(locationValue ? { location: locationValue } : {}),
      surface_m2: d.surface_m2 ?? null,
      floor: d.floor ?? null,
      total_floors: d.total_floors ?? null,
      year_built: d.year_built ?? null,
      rooms: d.rooms ?? null,
      bathrooms: d.bathrooms ?? null,
      details: d.details,
      current_status: "draft",
      version: 1,
    })
    .select("id")
    .single();

  if (listingError || !listing) {
    logger.error({ err: listingError }, "createDraft: listing insert failed");
    return fail("CREATE_FAILED", "Erreur lors de la création du brouillon. Veuillez réessayer.");
  }

  const listingId = listing.id as string;
  const slug = `${slugify(d.title)}-${listingId.slice(0, 8)}`;

  // Insert French translation
  const { error: translationError } = await supabase
    .from("listing_translations")
    .insert({
      listing_id: listingId,
      locale: "fr",
      title: d.title,
      description: d.description,
      slug,
    });

  if (translationError) {
    logger.error({ err: translationError, listingId }, "createDraft: translation insert failed");
    // Soft-delete orphan listing
    await supabase
      .from("listings")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", listingId);

    return fail(
      "TRANSLATION_FAILED",
      "Erreur lors de l'enregistrement de la description. Veuillez réessayer."
    );
  }

  // Record initial price and status versions
  await Promise.all([
    supabase.from("listing_price_versions").insert({
      listing_id: listingId,
      price: d.current_price,
      currency: "DZD",
      changed_by: user.id,
    }),
    supabase.from("listing_status_versions").insert({
      listing_id: listingId,
      status: "draft",
      changed_by: user.id,
    }),
  ]);

  revalidatePath("/[locale]/search", "page");
  revalidatePath("/[locale]/AqarPro/dashboard/listings", "page");

  return ok({ listing_id: listingId, slug });
}
