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

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const isUnlimited = max === -1;
  const pct = isUnlimited ? 0 : Math.min((used / max) * 100, 100);
  const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-amber-500";

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
          {used} / {isUnlimited ? "∞" : max}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: isUnlimited ? "3%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active:    { label: "Actif",     className: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" },
    trialing:  { label: "Essai",     className: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
    past_due:  { label: "Impayé",    className: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
    canceled:  { label: "Annulé",    className: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400" };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
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
    month: "long",
    year: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      {/* Card header */}
      <div className="border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          Abonnement actuel
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Gérez votre plan et votre facturation.
        </p>
      </div>

      {/* Plan info row */}
      <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 dark:border-zinc-700 p-6 md:grid-cols-[240px_1fr]">
        <div>
          <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Plan</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Renouvellement le {periodEnd}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {subscription.plan.name}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {subscription.plan.price_eur} {t("eur")} / {t("per_month")}
            </p>
          </div>
          <StatusBadge status={subscription.status} />
        </div>
      </div>

      {/* Usage row */}
      <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 dark:border-zinc-700 p-6 md:grid-cols-[240px_1fr]">
        <div>
          <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Utilisation</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Quotas du mois en cours.
          </p>
        </div>
        <div className="space-y-4">
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
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 px-6 py-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Factures, paiement et résiliation via le portail Stripe.
        </p>
        <form action={formAction}>
          <input type="hidden" name="agency_id" value={agencyId} />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirection…
              </>
            ) : (
              <>
                {t("manage_subscription")}
                <svg className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>

      {state && !state.success && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 px-6 py-3">
          <p className="text-xs text-red-500 dark:text-red-400">{state.error.message}</p>
        </div>
      )}
    </div>
  );
}
