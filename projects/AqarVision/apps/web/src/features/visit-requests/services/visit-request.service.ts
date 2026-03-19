import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateVisitRequestInput } from "../schemas/visit-request.schema";
import type { VisitRequest } from "../types/visit-request.types";

export async function createVisitRequest(
  supabase: SupabaseClient,
  input: CreateVisitRequestInput,
  requesterId: string | null
): Promise<VisitRequest> {
  const { data, error } = await supabase
    .from("visit_requests")
    .insert({
      listing_id: input.listing_id,
      agency_id: input.agency_id,
      requester_user_id: requesterId,
      requester_name: input.name,
      requester_phone: input.phone,
      requester_email: input.email || null,
      preferred_date: input.preferred_date,
      preferred_time_slot: input.preferred_time_slot,
      message: input.message ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as VisitRequest;
}

export async function getVisitRequests(
  supabase: SupabaseClient,
  agencyId: string,
  status?: string
): Promise<VisitRequest[]> {
  let query = supabase
    .from("visit_requests")
    .select(
      `
      *,
      listing:listings(
        translations:listing_translations(title, locale),
        address
      )
    `
    )
    .eq("agency_id", agencyId)
    .order("preferred_date", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((vr: Record<string, unknown>) => {
    const listing = vr.listing as {
      translations?: Array<{ title: string; locale: string }>;
      address?: string;
    } | null;
    const fr = listing?.translations?.find((t) => t.locale === "fr");
    return {
      ...vr,
      listing_title: fr?.title ?? null,
      listing_address: listing?.address ?? null,
    } as VisitRequest;
  });
}

export async function updateVisitRequestStatus(
  supabase: SupabaseClient,
  requestId: string,
  status: VisitRequest["status"]
): Promise<void> {
  const { error } = await supabase
    .from("visit_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) throw error;
}
