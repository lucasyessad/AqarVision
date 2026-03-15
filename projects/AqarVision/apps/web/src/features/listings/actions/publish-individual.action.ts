"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { ok, fail } from "@/types/action-result";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";
import type { ActionResult } from "@/types/action-result";

export interface PublishResult {
  listing_id: string;
  slug: string;
}

const PublishInputSchema = z.object({
  listing_id: z.string().uuid(),
  contact_phone: z.string().min(9).max(15).transform(sanitizeInput).optional(),
  show_phone: z.boolean().default(true),
  accept_messages: z.boolean().default(true),
});

export async function publishIndividualListingAction(
  data: unknown
): Promise<ActionResult<PublishResult>> {
  const parsed = PublishInputSchema.safeParse(data);
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

  const { listing_id, contact_phone, show_phone, accept_messages } = parsed.data;

  // Verify ownership and current status
  const { data: listing } = await supabase
    .from("listings")
    .select("id, current_status, individual_owner_id, owner_type")
    .eq("id", listing_id)
    .single();

  if (!listing || listing.owner_type !== "individual" || listing.individual_owner_id !== user.id) {
    return fail("NOT_FOUND", "Annonce introuvable ou accès refusé.");
  }

  if (listing.current_status === "published") {
    // Already published — return success with slug
    const { data: trans } = await supabase
      .from("listing_translations")
      .select("slug")
      .eq("listing_id", listing_id)
      .eq("locale", "fr")
      .single();
    return ok({ listing_id, slug: trans?.slug ?? listing_id });
  }

  // Verify at least 1 photo
  const { count: mediaCount } = await supabase
    .from("listing_media")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listing_id);

  if ((mediaCount ?? 0) === 0) {
    return fail(
      "NO_PHOTOS",
      "Veuillez ajouter au moins une photo avant de publier votre annonce."
    );
  }

  // Publish
  const { error: updateError } = await supabase
    .from("listings")
    .update({
      current_status: "published",
      contact_phone: contact_phone ?? null,
      show_phone,
      accept_messages,
    })
    .eq("id", listing_id)
    .eq("individual_owner_id", user.id);

  if (updateError) {
    logger.error({ err: updateError, listingId: listing_id }, "publishIndividual: update failed");
    return fail("PUBLISH_FAILED", "Erreur lors de la publication. Veuillez réessayer.");
  }

  // Record status version
  await supabase.from("status_versions").insert({
    listing_id,
    status: "published",
    changed_by: user.id,
  });

  // Fetch slug for redirect
  const { data: trans } = await supabase
    .from("listing_translations")
    .select("slug")
    .eq("listing_id", listing_id)
    .eq("locale", "fr")
    .single();

  return ok({ listing_id, slug: trans?.slug ?? listing_id });
}
