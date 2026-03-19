import type { SupabaseClient } from "@supabase/supabase-js";

export interface OnboardingProgress {
  logo: boolean;
  first_listing: boolean;
  invite_team: boolean;
  customize_storefront: boolean;
  choose_plan: boolean;
  completed_at: string | null;
}

const DEFAULT_PROGRESS: OnboardingProgress = {
  logo: false,
  first_listing: false,
  invite_team: false,
  customize_storefront: false,
  choose_plan: false,
  completed_at: null,
};

export async function getOnboardingProgress(
  supabase: SupabaseClient,
  agencyId: string
): Promise<OnboardingProgress> {
  const { data } = await supabase
    .from("agencies")
    .select("onboarding_progress")
    .eq("id", agencyId)
    .single();

  if (!data?.onboarding_progress) return DEFAULT_PROGRESS;
  return data.onboarding_progress as OnboardingProgress;
}

export async function updateOnboardingStep(
  supabase: SupabaseClient,
  agencyId: string,
  step: keyof Omit<OnboardingProgress, "completed_at">,
  value: boolean
): Promise<void> {
  const current = await getOnboardingProgress(supabase, agencyId);
  const updated = { ...current, [step]: value };

  // Check if all steps complete
  const allDone =
    updated.logo &&
    updated.first_listing &&
    updated.invite_team &&
    updated.customize_storefront &&
    updated.choose_plan;

  if (allDone && !updated.completed_at) {
    updated.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("agencies")
    .update({ onboarding_progress: updated })
    .eq("id", agencyId);

  if (error) throw error;
}
