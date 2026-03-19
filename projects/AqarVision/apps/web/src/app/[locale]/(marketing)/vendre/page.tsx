import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight, Shield, TrendingUp, Clock } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Vendre votre bien" };
}

export default async function VendrePage() {
  const t = await getTranslations("marketing");

  const benefits = [
    { icon: TrendingUp, title: "Visibilité maximale", description: "Touchez des milliers d'acheteurs potentiels à travers l'Algérie" },
    { icon: Shield, title: "Sécurité", description: "Vos données sont protégées et vos transactions sécurisées" },
    { icon: Clock, title: "Rapidité", description: "Publiez votre annonce en moins de 5 minutes" },
  ] as const;

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen">
      {/* Hero */}
      <section className="bg-stone-900 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Vendez votre bien immobilier
          </h1>
          <p className="mt-4 text-lg text-stone-300">
            Simple, rapide et efficace
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/deposer"
              className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-500 transition-colors duration-fast"
            >
              Déposer une annonce
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/estimer"
              className="inline-flex items-center gap-2 rounded-md border border-stone-500 px-6 py-3 text-sm font-medium text-stone-300 hover:bg-stone-800 transition-colors duration-fast"
            >
              Estimer mon bien
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-md font-semibold text-stone-900 dark:text-stone-100">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
