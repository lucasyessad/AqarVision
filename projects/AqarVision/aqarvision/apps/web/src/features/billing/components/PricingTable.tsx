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

  // Redirect on success
  if (state?.success && state.data.checkout_url) {
    window.location.href = state.data.checkout_url;
  }

  const indicativeDzd = Math.round(plan.price_eur * EUR_TO_DZD_INDICATIVE);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
        isCurrent
          ? "border-gold"
          : isPopular
            ? "border-blue-night"
            : "border-gray-200"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 inset-inline-start-1/2 -translate-x-1/2 rounded-full bg-blue-night px-4 py-1 text-xs font-semibold text-white">
          Popular
        </span>
      )}

      {isCurrent && (
        <span className="absolute -top-3 inset-inline-start-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-semibold text-white">
          {t("current_plan")}
        </span>
      )}

      <h3 className="text-lg font-bold text-blue-night">{plan.name}</h3>

      <div className="mt-4">
        <span className="text-3xl font-bold text-blue-night">
          {plan.price_eur}
        </span>
        <span className="text-sm text-gray-500">
          {" "}
          {t("eur")} / {t("per_month")}
        </span>
      </div>

      <p className="mt-1 text-xs text-gray-400">
        ~{indicativeDzd.toLocaleString()} DZD ({t("per_month")})
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        <li className="flex items-center gap-2 text-sm text-gray-700">
          <CheckIcon />
          {plan.max_listings === -1
            ? t("unlimited")
            : `${plan.max_listings} ${t("max_listings")}`}
        </li>
        <li className="flex items-center gap-2 text-sm text-gray-700">
          <CheckIcon />
          {plan.max_ai_jobs === -1
            ? t("unlimited")
            : `${plan.max_ai_jobs} ${t("max_ai_jobs")}`}
        </li>
      </ul>

      <div className="mt-6">
        {plan.code === "enterprise" ? (
          <a
            href="mailto:contact@aqarvision.com"
            className="block w-full rounded-lg border-2 border-blue-night px-4 py-2.5 text-center text-sm font-semibold text-blue-night transition-colors hover:bg-blue-night hover:text-white"
          >
            {t("contact_sales")}
          </a>
        ) : isCurrent ? (
          <button
            type="button"
            disabled
            className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-400"
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
              className="w-full rounded-lg bg-blue-night px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-opacity-90 disabled:opacity-50"
            >
              {isPending ? t("checkout_redirect") : t("subscribe")}
            </button>
          </form>
        ) : (
          <a
            href="/auth/login"
            className="block w-full rounded-lg bg-blue-night px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-opacity-90"
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

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-gold"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function PricingTable({ plans, currentPlanCode, agencyId }: PricingTableProps) {
  const t = useTranslations("billing");

  return (
    <section>
      <h2 className="mb-8 text-center text-2xl font-bold text-blue-night">
        {t("pricing_title")}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}
