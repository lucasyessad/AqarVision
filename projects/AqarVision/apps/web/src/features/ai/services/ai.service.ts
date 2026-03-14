import type { SupabaseClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import type { AiJobDto, AiJobStatus, AiJobType } from "../types/ai.types";

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

function mapJob(row: Record<string, unknown>): AiJobDto {
  return {
    id: row.id as string,
    agency_id: row.agency_id as string,
    listing_id: (row.listing_id as string) ?? null,
    job_type: row.job_type as AiJobType,
    status: row.status as AiJobStatus,
    source_locale: (row.source_locale as string) ?? null,
    target_locale: (row.target_locale as string) ?? null,
    output_payload:
      (row.output_payload as Record<string, unknown>) ?? null,
    created_at: row.created_at as string,
    completed_at: (row.completed_at as string) ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  Quota                                                              */
/* ------------------------------------------------------------------ */

export async function checkQuota(
  supabase: SupabaseClient,
  agencyId: string
): Promise<{ allowed: boolean; used: number; max: number }> {
  // Get agency plan limits
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_id, plans(max_ai_jobs)")
    .eq("agency_id", agencyId)
    .eq("status", "active")
    .single();

  const plan = subscription?.plans as unknown as Record<string, unknown> | null;
  const maxJobs = (plan?.max_ai_jobs as number) ?? 0;

  // Count jobs this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("ai_jobs")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .gte("created_at", startOfMonth.toISOString());

  const used = count ?? 0;

  return { allowed: used < maxJobs, used, max: maxJobs };
}

/* ------------------------------------------------------------------ */
/*  Job CRUD                                                           */
/* ------------------------------------------------------------------ */

export async function createJob(
  supabase: SupabaseClient,
  agencyId: string,
  listingId: string,
  jobType: AiJobType,
  inputPayload: Record<string, unknown>
): Promise<AiJobDto> {
  const { data, error } = await supabase
    .from("ai_jobs")
    .insert({
      agency_id: agencyId,
      listing_id: listingId,
      job_type: jobType,
      status: "pending",
      source_locale: (inputPayload.source_locale as string) ?? null,
      target_locale: (inputPayload.target_locale as string) ?? null,
      input_payload: inputPayload,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create AI job");
  }

  return mapJob(data as unknown as Record<string, unknown>);
}

export async function completeJob(
  supabase: SupabaseClient,
  jobId: string,
  outputPayload: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from("ai_jobs")
    .update({
      status: "completed",
      output_payload: outputPayload,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function failJob(
  supabase: SupabaseClient,
  jobId: string,
  errorMessage: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_jobs")
    .update({
      status: "failed",
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }
}

/* ------------------------------------------------------------------ */
/*  Claude API helper                                                  */
/* ------------------------------------------------------------------ */

async function callClaude(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}

/* ------------------------------------------------------------------ */
/*  Generate Description                                               */
/* ------------------------------------------------------------------ */

export async function generateDescription(
  supabase: SupabaseClient,
  agencyId: string,
  listingId: string,
  locale: string
): Promise<{ text: string; job_id: string }> {
  // Check quota
  const quota = await checkQuota(supabase, agencyId);
  if (!quota.allowed) {
    throw new Error("QUOTA_EXCEEDED");
  }

  // Get listing data
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(
      `id, listing_type, property_type, current_price, currency,
       surface_m2, rooms, bathrooms, wilaya_code, commune_id, details`
    )
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error("Listing not found");
  }

  // Create job
  const job = await createJob(supabase, agencyId, listingId, "generate_description", {
    source_locale: locale,
    listing_data: listing,
  });

  try {
    const systemPrompt = `You are a professional real estate copywriter specializing in the Algerian property market. Generate compelling, accurate property descriptions in ${locale === "ar" ? "Arabic" : locale === "fr" ? "French" : locale === "es" ? "Spanish" : "English"}. Use a professional yet warm tone. Highlight key features and the property's unique selling points. Do not invent features not provided in the data. Output only the description text, no additional formatting or labels.`;

    const userPrompt = `Generate a real estate listing description for the following property:
- Type: ${listing.property_type}
- Listing type: ${listing.listing_type}
- Price: ${listing.current_price} ${listing.currency}
- Surface: ${listing.surface_m2 ?? "N/A"} m²
- Rooms: ${listing.rooms ?? "N/A"}
- Bathrooms: ${listing.bathrooms ?? "N/A"}
- Wilaya code: ${listing.wilaya_code}
- Details: ${JSON.stringify(listing.details ?? {})}

Write a professional description of 150-250 words.`;

    const text = await callClaude(systemPrompt, userPrompt);

    await completeJob(supabase, job.id, { text, locale });

    return { text, job_id: job.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    await failJob(supabase, job.id, message);
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/*  Translate Listing                                                  */
/* ------------------------------------------------------------------ */

export async function translateListing(
  supabase: SupabaseClient,
  agencyId: string,
  listingId: string,
  sourceLocale: string,
  targetLocale: string
): Promise<{ text: string; job_id: string }> {
  // Check quota
  const quota = await checkQuota(supabase, agencyId);
  if (!quota.allowed) {
    throw new Error("QUOTA_EXCEEDED");
  }

  // Get source translation
  const { data: sourceTranslation, error: translationError } = await supabase
    .from("listing_translations")
    .select("title, description")
    .eq("listing_id", listingId)
    .eq("locale", sourceLocale)
    .single();

  if (translationError || !sourceTranslation) {
    throw new Error(`No ${sourceLocale} translation found for this listing`);
  }

  // Create job
  const job = await createJob(supabase, agencyId, listingId, "translate", {
    source_locale: sourceLocale,
    target_locale: targetLocale,
    source_text: sourceTranslation.description,
    source_title: sourceTranslation.title,
  });

  const localeNames: Record<string, string> = {
    fr: "French",
    ar: "Arabic",
    en: "English",
    es: "Spanish",
  };

  try {
    const systemPrompt = `You are a professional real estate translator specializing in the Algerian property market. Translate the given listing content from ${localeNames[sourceLocale] ?? sourceLocale} to ${localeNames[targetLocale] ?? targetLocale}. Maintain the professional tone and real estate terminology. If translating to Arabic, use Modern Standard Arabic. Output a JSON object with "title" and "description" fields only, no additional text.`;

    const userPrompt = `Translate this real estate listing:

Title: ${sourceTranslation.title}

Description: ${sourceTranslation.description}

Output format: {"title": "...", "description": "..."}`;

    const text = await callClaude(systemPrompt, userPrompt);

    await completeJob(supabase, job.id, {
      text,
      source_locale: sourceLocale,
      target_locale: targetLocale,
    });

    return { text, job_id: job.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    await failJob(supabase, job.id, message);
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/*  Job History                                                        */
/* ------------------------------------------------------------------ */

export async function getJobHistory(
  supabase: SupabaseClient,
  agencyId: string
): Promise<AiJobDto[]> {
  const { data, error } = await supabase
    .from("ai_jobs")
    .select("*")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data.map((row) =>
    mapJob(row as unknown as Record<string, unknown>)
  );
}
