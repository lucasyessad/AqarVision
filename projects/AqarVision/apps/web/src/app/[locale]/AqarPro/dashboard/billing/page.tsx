import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { CreditCard, Check, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { getAgencyForUser } from "@/lib/auth/get-agency-for-user";
import { getCurrentSubscription } from "@/features/billing/actions/billing.action";
import { getPlans } from "@/features/billing/services/billing.service";
import { BillingActionsClient } from "./billing-actions-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("billing") };
}

export default async function BillingPage() {
  const t = await getTranslations("nav");
  const tBilling = await getTranslations("billing");

  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const agencyCtx = await getAgencyForUser(user.id);
  if (!agencyCtx) redirect("/AqarPro/dashboard");

  const supabase = await createClient();

  // Fetch plans from DB
  let plans: Array<{
    id: string;
    name: string;
    price_monthly_dzd: number;
    max_listings: number;
    max_photos_per_listing: number;
    max_team_members: number;
    stripe_price_id: string | null;
  }> = [];
  try {
    plans = (await getPlans(supabase)) ?? [];
  } catch {
    // fallback
  }

  // Fetch current subscription
  let subscription: {
    id: string;
    status: string;
    current_period_end: string;
    plan: { id: string; name: string } | null;
  } | null = null;
  try {
    const raw = await getCurrentSubscription(agencyCtx.agencyId);
    if (raw) {
      subscription = {
        id: raw.id as string,
        status: raw.status as string,
        current_period_end: raw.current_period_end as string,
        plan: raw.plan as { id: string; name: string } | null,
      };
    }
  } catch {
    // no subscription
  }

  const currentPlanId = subscription?.plan?.id ?? null;
  const isTrialing = subscription?.status === "trialing";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("billing")}
      </h1>

      {/* Current subscription */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {subscription?.plan?.name ?? tBilling("noPlan")}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isTrialing
                  ? tBilling("trialActive")
                  : subscription
                    ? tBilling("activeUntil", {
                        date: new Date(subscription.current_period_end).toLocaleDateString(),
                      })
                    : tBilling("noActiveSubscription")}
              </p>
            </div>
          </div>
          {subscription && (
            <BillingActionsClient
              agencyId={agencyCtx.agencyId}
              action="portal"
            />
          )}
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isHighlighted = plan.name.toLowerCase().includes("pro") && !plan.name.toLowerCase().includes("enterprise");

          return (
            <div
              key={plan.id}
              className={`rounded-lg border p-6 ${
                isHighlighted
                  ? "border-teal-600 dark:border-teal-400 bg-white dark:bg-stone-900 ring-1 ring-teal-600/20 dark:ring-teal-400/20"
                  : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              }`}
            >
              {isHighlighted && (
                <span className="inline-block mb-3 rounded-full bg-teal-50 dark:bg-teal-950 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300">
                  {tBilling("popular")}
                </span>
              )}
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                {plan.name}
              </h3>
              <p className="mt-2">
                <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {plan.price_monthly_dzd.toLocaleString("fr-FR")}
                </span>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  {" "}DZD/{tBilling("month")}
                </span>
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  {plan.max_listings === -1 ? tBilling("unlimitedListings") : tBilling("maxListings", { count: plan.max_listings })}
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  {tBilling("maxPhotos", { count: plan.max_photos_per_listing })}
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  {plan.max_team_members === -1 ? tBilling("unlimitedTeam") : tBilling("maxTeam", { count: plan.max_team_members })}
                </li>
              </ul>
              <div className="mt-6">
                {isCurrent ? (
                  <span className="block w-full text-center rounded-md border border-stone-300 dark:border-stone-600 px-4 py-2.5 text-sm font-medium text-stone-400 dark:text-stone-500">
                    {tBilling("currentPlan")}
                  </span>
                ) : (
                  <BillingActionsClient
                    agencyId={agencyCtx.agencyId}
                    action="checkout"
                    planId={plan.id}
                    highlighted={isHighlighted}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
