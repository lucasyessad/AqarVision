import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight, Home, Bell, Heart, MessageSquare, TrendingUp, Shield } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "AqarChaab — Espace Particulier" };
}

export default async function ChaabPage() {
  const features = [
    { icon: Home, title: "Déposer une annonce", description: "Publiez votre bien en quelques minutes — vente, location ou vacances" },
    { icon: MessageSquare, title: "Messagerie directe", description: "Échangez directement avec les agences et les particuliers" },
    { icon: Bell, title: "Alertes personnalisées", description: "Recevez les nouvelles annonces correspondant à vos critères en temps réel" },
    { icon: Heart, title: "Favoris & collections", description: "Sauvegardez et organisez les biens qui vous intéressent" },
    { icon: TrendingUp, title: "Estimation de prix", description: "Estimez la valeur de votre bien grâce à notre outil d'analyse du marché" },
    { icon: Shield, title: "Annonces vérifiées", description: "Des agences certifiées et des particuliers de confiance à travers les 69 wilayas" },
  ] as const;

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen">
      {/* Hero */}
      <section className="bg-stone-900 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="text-sm font-medium text-amber-400">AqarChaab</span>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            L'immobilier simplifié pour les particuliers
          </h1>
          <p className="mt-4 text-lg text-stone-300">
            Achetez, louez, vendez — tout ce dont vous avez besoin pour votre projet immobilier en Algérie
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors duration-fast"
            >
              Créer mon espace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-md border border-stone-500 px-6 py-3 text-sm font-medium text-stone-300 hover:bg-stone-800 transition-colors duration-fast"
            >
              Explorer les annonces
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 mb-12">
            Tout pour votre projet immobilier
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 hover:shadow-card-hover transition-shadow duration-normal"
                >
                  <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <h3 className="text-md font-semibold text-stone-900 dark:text-stone-100">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-stone-900 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white">
            Prêt à trouver votre bien idéal ?
          </h2>
          <p className="mt-3 text-stone-300">
            Rejoignez des milliers de particuliers qui font confiance à AqarChaab
          </p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors duration-fast"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
