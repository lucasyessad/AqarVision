import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  LeadDto,
  LeadsByStatus,
  LeadStatus,
  LeadNoteDto,
} from "../types/leads.types";

/* ------------------------------------------------------------------ */
/*  getLeadsByAgency — Fetch and group leads by status                  */
/* ------------------------------------------------------------------ */

export async function getLeadsByAgency(
  supabase: SupabaseClient,
  agencyId: string
): Promise<LeadsByStatus> {
  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      listing_id,
      agency_id,
      sender_user_id,
      status,
      source,
      score,
      notes,
      created_at,
      updated_at,
      listings!inner (
        listing_translations (
          title,
          locale
        )
      ),
      profiles:sender_user_id (
        full_name,
        phone
      )
    `)
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to fetch leads");
  }

  const grouped: LeadsByStatus = {
    new: [],
    contacted: [],
    qualified: [],
    closed: [],
  };

  for (const row of data) {
    const listing = row.listings as unknown as Record<string, unknown>;
    const translations = listing.listing_translations as unknown as Array<{
      title: string;
      locale: string;
    }>;
    const translation =
      translations?.find((t) => t.locale === "fr") ?? translations?.[0];
    const listingTitle = translation?.title ?? "—";

    const profile = row.profiles as unknown as Record<string, unknown> | null;
    const contactName = (profile?.full_name as string | null) ?? "—";
    const contactPhone = (profile?.phone as string | null) ?? null;

    // Parse notes from JSONB
    const rawNotes = (row.notes as unknown as LeadNoteDto[] | null) ?? [];

    const lead: LeadDto = {
      id: row.id as string,
      listing_id: row.listing_id as string,
      agency_id: row.agency_id as string,
      sender_user_id: row.sender_user_id as string,
      status: row.status as LeadStatus,
      source: row.source as "platform" | "whatsapp" | "phone",
      score: (row.score as number | null) ?? null,
      notes: rawNotes,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      listing_title: listingTitle,
      contact_name: contactName,
      contact_phone: contactPhone,
    };

    const statusKey = lead.status as keyof LeadsByStatus;
    if (statusKey in grouped) {
      grouped[statusKey].push(lead);
    }
  }

  return grouped;
}

/* ------------------------------------------------------------------ */
/*  updateLeadStatus — Update a lead's CRM status                       */
/* ------------------------------------------------------------------ */

export async function updateLeadStatus(
  supabase: SupabaseClient,
  leadId: string,
  status: LeadStatus
): Promise<{ id: string; status: LeadStatus; updated_at: string }> {
  const { data, error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .select("id, status, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update lead status");
  }

  return {
    id: data.id as string,
    status: data.status as LeadStatus,
    updated_at: data.updated_at as string,
  };
}

/* ------------------------------------------------------------------ */
/*  addLeadNote — Append a note to the lead's JSONB notes array         */
/* ------------------------------------------------------------------ */

export async function addLeadNote(
  supabase: SupabaseClient,
  leadId: string,
  note: string,
  authorId: string
): Promise<LeadNoteDto[]> {
  // Fetch current notes + author profile
  const [leadResult, profileResult] = await Promise.all([
    supabase.from("leads").select("notes").eq("id", leadId).single(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", authorId)
      .single(),
  ]);

  if (leadResult.error || !leadResult.data) {
    throw new Error(leadResult.error?.message ?? "Lead not found");
  }

  const currentNotes =
    (leadResult.data.notes as unknown as LeadNoteDto[] | null) ?? [];
  const authorName =
    (profileResult.data?.full_name as string | null) ?? "Agent";

  const newNote: LeadNoteDto = {
    id: crypto.randomUUID(),
    body: note.trim(),
    author_id: authorId,
    author_name: authorName,
    created_at: new Date().toISOString(),
  };

  const updatedNotes = [...currentNotes, newNote];

  const { error: updateError } = await supabase
    .from("leads")
    .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return updatedNotes;
}
