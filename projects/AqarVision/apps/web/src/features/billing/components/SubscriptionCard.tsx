"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { openBillingPortalAction } from "../actions/billing.action";
import type { SubscriptionDto, ActionResult, PortalResult } from "../types/billing.types";

interface SubscriptionCardProps {
  subscription: SubscriptionDto;
  agencyId: string;
  usedListings: number;
  usedAiJobs: number;
}

function UsageBar({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) {
  const isUnlimited = max === -1;
  const pct = isUnlimited ? 0 : Math.min((used / max) * 100, 100);

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {used} / {isUnlimited ? "\u221e" : max}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${
            pct > 90 ? "bg-red-500" : pct > 70 ? "bg-gold" : "bg-blue-night"
          }`}
          style={{ width: isUnlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function SubscriptionCard({
  subscription,
  agencyId,
  usedListings,
  usedAiJobs,
}: SubscriptionCardProps) {
  const t = useTranslations("billing");

  const [state, formAction, isPending] = useActionState<
    ActionResult<PortalResult> | null,
    FormData
  >(openBillingPortalAction, null);

  if (state?.success && state.data.portal_url) {
    window.location.href = state.data.portal_url;
  }

  const periodEnd = new Date(subscription.current_period_end).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-night">
            {subscription.plan.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {subscription.plan.price_eur} {t("eur")} / {t("per_month")}
          </p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          {subscription.status}
        </span>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {t("current_plan")} &middot; {periodEnd}
      </p>

      <div className="mt-6 space-y-4">
        <UsageBar
          label={t("max_listings")}
          used={usedListings}
          max={subscription.plan.max_listings}
        />
        <UsageBar
          label={t("max_ai_jobs")}
          used={usedAiJobs}
          max={subscription.plan.max_ai_jobs}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <form action={formAction}>
          <input type="hidden" name="agency_id" value={agencyId} />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg border border-blue-night px-4 py-2 text-sm font-semibold text-blue-night transition-colors hover:bg-blue-night hover:text-white disabled:opacity-50"
          >
            {isPending ? t("checkout_redirect") : t("manage_subscription")}
          </button>
        </form>
      </div>

      {state && !state.success && (
        <p className="mt-2 text-xs text-red-500">{state.error.message}</p>
      )}
    </div>
  );
}
