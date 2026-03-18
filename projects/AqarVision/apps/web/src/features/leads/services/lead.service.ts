import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateLeadInput } from "../schemas/lead.schema";
import type { Lead } from "../types/lead.types";

export async function createLead(
  supabase: SupabaseClient,
  input: CreateLeadInput,
  senderId: string | null
): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .insert({
      agency_id: input.agency_id,
      listing_id: input.listing_id,
      sender_user_id: senderId,
      sender_name: input.name,
      sender_phone: input.phone,
      sender_email: input.email || null,
      lead_type: input.lead_type,
      source: "platform",
      status: "new",
      score: 0,
      heat_score: 30, // New lead < 24h = +30 base
    })
    .select()
    .single();

  if (error) throw error;

  // Create conversation + first message
  const { data: conversation } = await supabase
    .from("conversations")
    .insert({
      listing_id: input.listing_id,
      agency_id: input.agency_id,
    })
    .select("id")
    .single();

  if (conversation) {
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: senderId,
      content: input.message,
    });
  }

  return data as Lead;
}

export async function getLeadsByAgency(
  supabase: SupabaseClient,
  agencyId: string
): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select(
      `
      *,
      listing:listings(
        translations:listing_translations(title, locale)
      )
    `
    )
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((lead: Record<string, unknown>) => {
    const listing = lead.listing as { translations?: Array<{ title: string; locale: string }> } | null;
    const fr = listing?.translations?.find(
      (t) => t.locale === "fr"
    );
    return {
      ...lead,
      listing_title: fr?.title ?? null,
      notes: (lead.notes as Lead["notes"]) ?? [],
    } as Lead;
  });
}

export async function updateLeadStatus(
  supabase: SupabaseClient,
  leadId: string,
  status: Lead["status"]
): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  if (error) throw error;
}

export function calculateHeatScore(signals: {
  createdAt: Date;
  messagesCount: number;
  hasVisitRequest: boolean;
  budgetMeetsPrice: boolean;
  source: string;
  isQualified: boolean;
}): number {
  let score = 0;
  const now = new Date();
  const diffHours =
    (now.getTime() - signals.createdAt.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) score += 30;
  else if (diffHours < 168) score += 15;

  if (signals.messagesCount >= 3) score += 20;
  if (signals.hasVisitRequest) score += 25;
  if (signals.budgetMeetsPrice) score += 10;
  if (signals.source === "platform") score += 5;
  if (signals.isQualified) score += 20;

  return Math.min(score, 100);
}
