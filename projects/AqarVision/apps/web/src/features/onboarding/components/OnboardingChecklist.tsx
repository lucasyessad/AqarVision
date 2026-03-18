"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Check, Image, Building2, UserPlus, Palette, CreditCard, X } from "lucide-react";
import { useState } from "react";

interface OnboardingProgress {
  logo: boolean;
  first_listing: boolean;
  invite_team: boolean;
  customize_storefront: boolean;
  choose_plan: boolean;
  completed_at: string | null;
}

interface OnboardingChecklistProps {
  progress: OnboardingProgress;
  onDismiss?: () => void;
}

const STEPS = [
  { key: "addLogo" as const, field: "logo" as const, icon: Image, href: "/AqarPro/dashboard/settings" },
  { key: "publishListing" as const, field: "first_listing" as const, icon: Building2, href: "/AqarPro/dashboard/listings" },
  { key: "inviteTeam" as const, field: "invite_team" as const, icon: UserPlus, href: "/AqarPro/dashboard/team" },
  { key: "customizeStorefront" as const, field: "customize_storefront" as const, icon: Palette, href: "/AqarPro/dashboard/settings" },
  { key: "choosePlan" as const, field: "choose_plan" as const, icon: CreditCard, href: "/AqarPro/dashboard/billing" },
] as const;

export function OnboardingChecklist({ progress, onDismiss }: OnboardingChecklistProps) {
  const t = useTranslations("dashboard.onboarding");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || progress.completed_at) return null;

  const completedCount = STEPS.filter((s) => progress[s.field]).length;
  const percentage = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-md font-semibold text-stone-900 dark:text-stone-100">
            {t("title")}
          </h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {completedCount}/{STEPS.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-fast"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-600 dark:bg-teal-400 transition-all duration-slow"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Steps */}
      <ul className="mt-5 space-y-3">
        {STEPS.map((step) => {
          const done = progress[step.field];
          const Icon = step.icon;
          return (
            <li key={step.key}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-fast",
                  done
                    ? "text-stone-400 dark:text-stone-500"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full shrink-0",
                    done
                      ? "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400"
                      : "border border-stone-300 dark:border-stone-600 text-stone-400 dark:text-stone-500"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                <span className={cn(done && "line-through")}>{t(step.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
