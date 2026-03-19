import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Check, Zap } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Upgrade" };
}

export default async function UpgradePage() {
  const tBilling = await getTranslations("billing");
  const plans = [
    {
      name: "Gratuit",
      price: "0",
      features: ["2 annonces", "3 photos/annonce"],
      current: true,
    },
    {
      name: "Chaab Plus",
      price: "990",
      features: ["4 annonces", "10 photos/annonce", "Alertes illimitées"],
      current: false,
      highlighted: true,
    },
    {
      name: "Chaab Pro",
      price: "1 990",
      features: ["6 annonces", "15 photos/annonce", "Alertes illimitées", "Badge prioritaire"],
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Zap className="mx-auto h-8 w-8 text-amber-400 mb-2" />
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Passez au niveau supérieur
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Plus d&apos;annonces, plus de visibilité
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border p-5 ${
              plan.highlighted
                ? "border-teal-600 dark:border-teal-400 bg-white dark:bg-stone-900"
                : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
            }`}
          >
            <h3 className="text-md font-semibold text-stone-900 dark:text-stone-100">
              {plan.name}
            </h3>
            <p className="mt-2">
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {plan.price}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400"> DZD/{tBilling("month")}</span>
            </p>
            <ul className="mt-3 space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                  <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={plan.current}
              className={`mt-4 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors duration-fast ${
                plan.current
                  ? "border border-stone-300 dark:border-stone-600 text-stone-400 cursor-default"
                  : plan.highlighted
                    ? "bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 dark:hover:bg-teal-600"
                    : "border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
              }`}
            >
              {plan.current ? tBilling("currentPlan") : tBilling("choosePlan")}
            </button>
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <div className="max-w-lg mx-auto">
        <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
          Moyens de paiement
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["Stripe", "CIB", "Dahabia", "BaridiMob", "Virement"].map((method) => (
            <div
              key={method}
              className="rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-center text-xs text-stone-600 dark:text-stone-400"
            >
              {method}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
