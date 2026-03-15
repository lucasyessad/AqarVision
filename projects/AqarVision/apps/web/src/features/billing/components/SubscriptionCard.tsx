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
  const barColor = pct > 90 ? "#DC2626" : pct > 70 ? "#D97706" : "var(--coral)";

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--charcoal-700)" }}>{label}</span>
        <span className="text-xs tabular-nums" style={{ color: "var(--charcoal-500)" }}>
          {used} / {isUnlimited ? "∞" : max}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "#E3E8EF" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: isUnlimited ? "3%" : `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    active:    { label: "Actif",     bg: "#F0FDF4", color: "#16A34A" },
    trialing:  { label: "Essai",     bg: "#EFF6FF", color: "#2563EB" },
    past_due:  { label: "Impayé",    bg: "#FFFBEB", color: "#D97706" },
    canceled:  { label: "Annulé",    bg: "#FFF5F5", color: "#DC2626" },
  };
  const cfg = map[status] ?? { label: status, bg: "#F6F9FC", color: "var(--charcoal-600)" };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
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
    <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
      {/* Card header */}
      <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
          Abonnement actuel
        </h2>
        <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>
          Gérez votre plan et votre facturation.
        </p>
      </div>

      {/* Plan info row */}
      <div className="grid grid-cols-1 gap-6 border-b p-6 md:grid-cols-[240px_1fr]" style={{ borderColor: "#E3E8EF" }}>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>Plan</p>
          <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
            Renouvellement le {periodEnd}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
              {subscription.plan.name}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>
              {subscription.plan.price_eur} {t("eur")} / {t("per_month")}
            </p>
          </div>
          <StatusBadge status={subscription.status} />
        </div>
      </div>

      {/* Usage row */}
      <div className="grid grid-cols-1 gap-6 border-b p-6 md:grid-cols-[240px_1fr]" style={{ borderColor: "#E3E8EF" }}>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>Utilisation</p>
          <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
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
      <div className="flex items-center justify-between px-6 py-4" style={{ background: "#F6F9FC" }}>
        <p className="text-xs" style={{ color: "var(--charcoal-500)" }}>
          Factures, paiement et résiliation via le portail Stripe.
        </p>
        <form action={formAction}>
          <input type="hidden" name="agency_id" value={agencyId} />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:opacity-50"
            style={{ borderColor: "#E3E8EF", color: "var(--charcoal-700)", background: "white" }}
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
        <div className="border-t px-6 py-3" style={{ borderColor: "#E3E8EF" }}>
          <p className="text-xs text-red-500">{state.error.message}</p>
        </div>
      )}
    </div>
  );
}
