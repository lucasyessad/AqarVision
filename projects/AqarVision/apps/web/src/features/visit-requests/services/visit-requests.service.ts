import type { SupabaseClient } from "@supabase/supabase-js";
import type { VisitRequestDto, VisitRequestStatus } from "../types/visit-requests.types";

/* ------------------------------------------------------------------ */
/*  submitVisitRequest — create visit_request + associated lead         */
/* ------------------------------------------------------------------ */

export async function submitVisitRequest(
  supabase: SupabaseClient,
  data: {
    listingId: string;
    agencyId: string;
    visitorName: string;
    visitorPhone: string;
    visitorEmail?: string;
    message?: string;
    requestedDate?: string;
  }
): Promise<{ visit_request_id: string; lead_id: string | null }> {
  // Try to create an anonymous lead first (best-effort — no user required)
  let leadId: string | null = null;

  try {
    // Get authenticated user if any, to associate the lead
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: lead } = await supabase
        .from("leads")
        .insert({
          listing_id: data.listingId,
          agency_id: data.agencyId,
          sender_user_id: user.id,
          source: "platform",
          status: "new",
          notes: JSON.stringify([]),
        })
        .select("id")
        .single();

      leadId = lead?.id ?? null;
    }
  } catch {
    // Anonymous submission — no lead created
    leadId = null;
  }

  // Create the visit request
  const { data: visitRequest, error } = await supabase
    .from("visit_requests")
    .insert({
      listing_id: data.listingId,
      agency_id: data.agencyId,
      lead_id: leadId,
      visitor_name: data.visitorName,
      visitor_phone: data.visitorPhone,
      visitor_email: data.visitorEmail || null,
      message: data.message || null,
      requested_date: data.requestedDate || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !visitRequest) {
    throw new Error(error?.message ?? "Failed to submit visit request");
  }

  return { visit_request_id: visitRequest.id as string, lead_id: leadId };
}

/* ------------------------------------------------------------------ */
/*  getVisitRequestsByAgency — list requests with listing info          */
/* ------------------------------------------------------------------ */

export async function getVisitRequestsByAgency(
  supabase: SupabaseClient,
  agencyId: string,
  statusFilter?: VisitRequestStatus
): Promise<VisitRequestDto[]> {
  let query = supabase
    .from("visit_requests")
    .select(`
      id,
      listing_id,
      agency_id,
      lead_id,
      visitor_name,
      visitor_phone,
      visitor_email,
      message,
      requested_date,
      status,
      created_at,
      updated_at,
      listings!inner (
        listing_translations (
          title,
          locale
        )
      )
    `)
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to fetch visit requests");
  }

  return data.map((row) => {
    const listing = row.listings as unknown as Record<string, unknown>;
    const translations = listing.listing_translations as unknown as Array<{
      title: string;
      locale: string;
    }>;
    const translation =
      translations?.find((t) => t.locale === "fr") ?? translations?.[0];

    return {
      id: row.id as string,
      listing_id: row.listing_id as string,
      agency_id: row.agency_id as string,
      lead_id: (row.lead_id as string | null) ?? null,
      visitor_name: row.visitor_name as string,
      visitor_phone: row.visitor_phone as string,
      visitor_email: (row.visitor_email as string | null) ?? null,
      message: (row.message as string | null) ?? null,
      requested_date: (row.requested_date as string | null) ?? null,
      status: row.status as VisitRequestStatus,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      listing_title: translation?.title ?? "—",
    };
  });
}

/* ------------------------------------------------------------------ */
/*  updateVisitRequestStatus — change the status of a visit request     */
/* ------------------------------------------------------------------ */

export async function updateVisitRequestStatus(
  supabase: SupabaseClient,
  requestId: string,
  status: VisitRequestStatus
): Promise<{ id: string; status: VisitRequestStatus }> {
  const { data, error } = await supabase
    .from("visit_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .select("id, status")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update visit request status");
  }

  return {
    id: data.id as string,
    status: data.status as VisitRequestStatus,
  };
}
