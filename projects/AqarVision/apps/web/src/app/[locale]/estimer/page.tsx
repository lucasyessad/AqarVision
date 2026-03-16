import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { EstimatorForm } from "@/features/marketplace/components/EstimatorForm";
import { Link } from "@/lib/i18n/navigation";
import {
  BarChart3,
  ArrowRight,
} from "lucide-react";

interface EstimerPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Estimer votre bien immobilier",
  description:
    "Obtenez une estimation gratuite du prix de votre bien immobilier en Algérie.",
};

export default async function EstimerPage({ params }: EstimerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  // Fetch all wilayas for the select
  const { data: wilayas } = await supabase
    .from("wilayas")
    .select("code, name_fr")
    .order("code");

  const wilayaOptions = (wilayas ?? []).map((w) => ({
    code: (w as Record<string, unknown>).code as string,
    name: (w as Record<string, unknown>).name_fr as string,
  }));

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500 dark:bg-amber-500/20 dark:text-amber-400">
            <BarChart3 className="h-3.5 w-3.5" />
            Estimation gratuite
          </span>
          <h1 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Estimez votre bien immobilier
          </h1>
          <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
            Obtenez une fourchette de prix basée sur les annonces du marché algérien.
          </p>
        </div>

        {/* Form + Result */}
        <EstimatorForm wilayas={wilayaOptions} />

        {/* CTA Agency */}
        <div className="mt-10 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 text-white dark:from-zinc-800 dark:to-zinc-700">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">
                Besoin d&apos;une évaluation précise ?
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Contactez une agence agréée pour une expertise sur-place.
              </p>
            </div>
            <Link
              href="/agences"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 dark:hover:bg-amber-400"
            >
              Trouver une agence
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
