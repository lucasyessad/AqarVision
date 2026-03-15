import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { EstimatorForm } from "@/features/marketplace/components/EstimatorForm";
import { Link } from "@/lib/i18n/navigation";

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
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Estimation gratuite
          </span>
          <h1 className="mt-4 text-3xl font-bold text-zinc-900">
            Estimez votre bien immobilier
          </h1>
          <p className="mt-3 text-base text-gray-500">
            Obtenez une fourchette de prix basée sur les annonces du marché algérien.
          </p>
        </div>

        {/* Form + Result */}
        <EstimatorForm wilayas={wilayaOptions} />

        {/* CTA Agency */}
        <div className="mt-10 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-900/80 p-6 text-white">
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
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500/90"
            >
              Trouver une agence
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
