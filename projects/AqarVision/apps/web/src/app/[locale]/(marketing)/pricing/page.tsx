import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("billing");
  return {
    title: t("pricing_title"),
    description: "Découvrez nos offres : Starter gratuit, Pro à 2 900 DA/mois, et Enterprise sur mesure.",
  };
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className ?? ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

interface PlanInfo {
  name: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

const PLANS: PlanInfo[] = [
  {
    name: "Starter",
    price: "Gratuit",
    description: "Pour les agences qui démarrent sur AqarVision.",
    features: [
      "5 annonces actives",
      "Support par email",
      "Vitrine agence basique",
    ],
    cta: "Commencer gratuitement",
    ctaHref: "/fr/auth/signup",
  },
  {
    name: "Pro",
    price: "2 900 DA",
    priceSuffix: "/ mois",
    description: "Tout ce qu'il faut pour développer votre activité.",
    features: [
      "50 annonces actives",
      "CRM leads intégré",
      "Analytiques avancées",
      "Thèmes Pro personnalisables",
      "Descriptions IA automatiques",
    ],
    cta: "Passer au Pro",
    ctaHref: "/fr/auth/signup?plan=pro",
    highlighted: true,
    badge: "Recommandé",
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    description: "Pour les grandes agences et réseaux immobiliers.",
    features: [
      "Annonces illimitées",
      "Accès API complet",
      "Support dédié prioritaire",
      "Thèmes exclusifs sur mesure",
      "Intégration personnalisée",
    ],
    cta: "Contactez-nous",
    ctaHref: "mailto:contact@aqarvision.dz",
  },
];

export default async function PricingPage() {
  const t = await getTranslations("billing");

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          {t("pricing_title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
          Des offres adaptées à chaque agence, de la vitrine gratuite
          aux solutions enterprise sur mesure.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border transition-shadow hover:shadow-lg ${
              plan.highlighted
                ? "border-amber-500 border-2 shadow-amber-100 dark:border-amber-400 dark:shadow-amber-950/20"
                : "border-zinc-200 dark:border-zinc-700"
            } bg-white dark:bg-zinc-900`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                <span className="rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-white dark:bg-amber-400 dark:text-zinc-900">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Plan header */}
            <div className="p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {plan.priceSuffix}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                {plan.description}
              </p>
            </div>

            {/* Divider */}
            <div className="mx-8 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Features */}
            <div className="flex-1 space-y-4 p-8">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckIcon
                    className={
                      plan.highlighted
                        ? "text-amber-500 dark:text-amber-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="p-8 pt-0">
              <a
                href={plan.ctaHref}
                className={`flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-400 dark:text-zinc-900 dark:hover:bg-amber-300"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-12 flex items-center justify-center gap-2 text-center">
        <svg
          className="h-4 w-4 shrink-0 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Tous les plans incluent un essai de 14 jours. Sans engagement, annulable à tout moment.
        </p>
      </div>
    </div>
  );
}
