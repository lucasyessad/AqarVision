export type AiJobStatus = "pending" | "processing" | "completed" | "failed";

export type AiJobType = "generate_description" | "translate" | "enrich";

export interface AiJobDto {
  id: string;
  agency_id: string;
  listing_id: string | null;
  job_type: AiJobType;
  status: AiJobStatus;
  source_locale: string | null;
  target_locale: string | null;
  output_payload: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

export type { ActionResult } from "@/types/action-result";
