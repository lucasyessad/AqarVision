"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { startCheckoutAction } from "../actions/billing.action";
import type { PlanDto, ActionResult, CheckoutResult } from "../types/billing.types";

const EUR_TO_DZD_INDICATIVE = 145;

interface PricingTableProps {
  plans: PlanDto[];
  currentPlanCode?: string | null;
  agencyId?: string | null;
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function PlanCard({
  plan,
  isCurrent,
  agencyId,
  isPopular,
  t,
}: {
  plan: PlanDto;
  isCurrent: boolean;
  agencyId: string | null;
  isPopular: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [state, formAction, isPending] = useActionState<
    ActionResult<CheckoutResult> | null,
    FormData
  >(startCheckoutAction, null);

  if (state?.success && state.data.checkout_url) {
    window.location.href = state.data.checkout_url;
  }

  const indicativeDzd = Math.round(plan.price_eur * EUR_TO_DZD_INDICATIVE);

  const isEnterprise = plan.code === "enterprise";

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-lg border bg-white dark:bg-zinc-900 transition-shadow hover:shadow-md ${
        isCurrent ? "border-rose-500 border-2" : isPopular ? "border-zinc-900 border-2" : "border-gray-200"
      }`}
    >
      {/* Popular / Current ribbon */}
      {(isPopular || isCurrent) && (
        <div
          className={`px-6 py-2 text-center text-xs font-semibold text-white ${
            isCurrent ? "bg-rose-500" : "bg-zinc-900"
          }`}
        >
          {isCurrent ? t("current_plan") : "Recommandé"}
        </div>
      )}

      {/* Plan header */}
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{plan.name}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            {isEnterprise ? "—" : `${plan.price_eur} €`}
          </span>
          {!isEnterprise && (
            <span className="text-xs text-zinc-500">/ {t("per_month")}</span>
          )}
        </div>
        {!isEnterprise && (
          <p className="mt-1 text-xs text-zinc-400">
            ~{new Intl.NumberFormat("fr-FR").format(indicativeDzd)} DZD / {t("per_month")}
          </p>
        )}
        {isEnterprise && (
          <p className="mt-1 text-xs text-zinc-500">
            Tarif sur devis
          </p>
        )}
      </div>

      {/* Features */}
      <div className="flex-1 space-y-3 p-6">
        <div className="flex items-center gap-2.5 text-sm text-zinc-700">
          <span className="text-rose-500"><CheckIcon /></span>
          {plan.max_listings === -1
            ? t("unlimited")
            : `${plan.max_listings} ${t("max_listings")}`}
        </div>
      </div>

      {/* CTA footer */}
      <div className="border-t border-gray-200 bg-zinc-50 dark:bg-zinc-800 p-6">
        {isEnterprise ? (
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@aqarvision.dz"}`}
            className="flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-white dark:bg-zinc-900"
          >
            {t("contact_sales")}
          </a>
        ) : isCurrent ? (
          <button
            type="button"
            disabled
            className="w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-zinc-400"
          >
            {t("current_plan")}
          </button>
        ) : agencyId ? (
          <form action={formAction}>
            <input type="hidden" name="agency_id" value={agencyId} />
            <input type="hidden" name="plan_code" value={plan.code} />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("checkout_redirect")}
                </>
              ) : t("subscribe")}
            </button>
          </form>
        ) : (
          <a
            href="/AqarChaab/auth/login"
            className="flex w-full items-center justify-center rounded-md bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
          >
            {t("subscribe")}
          </a>
        )}

        {state && !state.success && (
          <p className="mt-2 text-xs text-red-500">{state.error.message}</p>
        )}
      </div>
    </div>
  );
}

export function PricingTable({ plans, currentPlanCode, agencyId }: PricingTableProps) {
  const t = useTranslations("billing");

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:bg-zinc-900">
      {/* Card header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {t("pricing_title")}
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Choisissez le plan adapté à votre agence. Changez à tout moment.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={currentPlanCode === plan.code}
            agencyId={agencyId ?? null}
            isPopular={plan.code === "pro"}
            t={t}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-3 border-t border-gray-200 bg-zinc-50 dark:bg-zinc-800 px-6 py-4">
        <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs text-zinc-500">
          Les prix en DZD sont indicatifs. La facturation s&apos;effectue en EUR via Stripe.
        </p>
      </div>
    </div>
  );
}
