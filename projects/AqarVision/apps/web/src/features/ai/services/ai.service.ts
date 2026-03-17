import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import type { AiJobDto, AiJobStatus, AiJobType } from "../types/ai.types";

const AI_BACKEND_URL = process.env.AI_BACKEND_URL ?? "http://localhost:8000";
const AI_SERVICE_KEY = process.env.AI_SERVICE_KEY ?? "";

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
    .select("id, job_type, status, created_at")
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
/*  Python AI Backend helper                                           */
/* ------------------------------------------------------------------ */

async function callAIBackend<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${AI_BACKEND_URL}/api/v1${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Service-Key": AI_SERVICE_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI Backend error (${response.status}): ${error}`);
  }

  return response.json() as Promise<T>;
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
    const result = await callAIBackend<{ description: string; locale: string }>(
      "/generate/description",
      {
        title: listingId,
        property_type: listing.property_type as string,
        listing_type: listing.listing_type as string,
        wilaya: listing.wilaya_code as string,
        surface_m2: listing.surface_m2 as number | null,
        rooms: listing.rooms as number | null,
        bathrooms: listing.bathrooms as number | null,
        price: listing.current_price as number,
        currency: listing.currency as string,
        details: (listing.details as Record<string, unknown>) ?? {},
        locale,
      }
    );
    const text = result.description;

    await completeJob(supabase, job.id, { text, locale });

    return { text, job_id: job.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    logger.error({ err, agencyId, listingId, jobId: job.id }, "AI description generation failed");
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
): Promise<{ translation: { title: string; description: string }; job_id: string }> {
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

  try {
    // Translate title
    const titleResult = await callAIBackend<{ translated_text: string }>(
      "/translate",
      {
        text: sourceTranslation.title,
        source_locale: sourceLocale,
        target_locale: targetLocale,
      }
    );

    // Translate description
    const descResult = await callAIBackend<{ translated_text: string }>(
      "/translate",
      {
        text: sourceTranslation.description,
        source_locale: sourceLocale,
        target_locale: targetLocale,
      }
    );

    const translation = {
      title: titleResult.translated_text,
      description: descResult.translated_text,
    };

    await completeJob(supabase, job.id, {
      translation,
      source_locale: sourceLocale,
      target_locale: targetLocale,
    });

    return { translation, job_id: job.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    logger.error({ err, agencyId, listingId, jobId: job.id, sourceLocale, targetLocale }, "AI translation failed");
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
    .select("id, listing_id, job_type, status, created_at, completed_at, error_message")
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
