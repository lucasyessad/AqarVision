import { createClient } from "@/lib/supabase/server";
import { getPlans, getAgencySubscription } from "@/features/billing/services/billing.service";
import { PricingTable, SubscriptionCard } from "@/features/billing/components";
import { getTranslations } from "next-intl/server";

export default async function BillingPage() {
  const supabase = await createClient();
  const t = await getTranslations("billing");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">Authentication required</p>
      </div>
    );
  }

  // Get current user's agency (first active membership)
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const agencyId = membership?.agency_id as string | undefined;

  // Fetch plans
  const plans = await getPlans(supabase);

  // Fetch subscription and usage if user has an agency
  let subscription = null;
  let usedListings = 0;
  let usedAiJobs = 0;

  if (agencyId) {
    subscription = await getAgencySubscription(supabase, agencyId);

    // Count current listings
    const { count: listingCount } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .is("deleted_at", null);

    usedListings = listingCount ?? 0;

    // Count AI jobs this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: aiJobCount } = await supabase
      .from("ai_jobs")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .gte("created_at", startOfMonth.toISOString());

    usedAiJobs = aiJobCount ?? 0;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">{t("billing_portal")}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gérez votre abonnement, vos factures et vos options de paiement.
        </p>
      </div>

      {subscription && agencyId && (
        <SubscriptionCard
          subscription={subscription}
          agencyId={agencyId}
          usedListings={usedListings}
          usedAiJobs={usedAiJobs}
        />
      )}

      <PricingTable
        plans={plans}
        currentPlanCode={subscription?.plan.code ?? null}
        agencyId={agencyId ?? null}
      />
    </div>
  );
}
