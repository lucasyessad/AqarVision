"use client";

import { useTransition } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createCheckoutAction,
  createPortalAction,
} from "@/features/billing/actions/billing.action";

interface Props {
  agencyId: string;
  action: "checkout" | "portal";
  planId?: string;
  highlighted?: boolean;
}

export function BillingActionsClient({
  agencyId,
  action,
  planId,
  highlighted,
}: Props) {
  const t = useTranslations("billing");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (action === "checkout" && planId) {
        const result = await createCheckoutAction(agencyId, planId);
        if (result.success) {
          window.location.href = result.data.url;
        }
      } else if (action === "portal") {
        const result = await createPortalAction(agencyId);
        if (result.success) {
          window.location.href = result.data.url;
        }
      }
    });
  }

  if (action === "portal") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 dark:border-stone-600 px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-fast disabled:opacity-50"
      >
        <ExternalLink className="h-4 w-4" />
        {t("manageSubscription")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors duration-fast disabled:opacity-50 ${
        highlighted
          ? "bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 dark:hover:bg-teal-600"
          : "border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
      }`}
    >
      {isPending ? t("processing") : t("choosePlan")}
    </button>
  );
}
