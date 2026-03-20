import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight, Home, Bell, Heart, MessageSquare, TrendingUp, Shield } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "AqarChaab — Espace Particulier" };
}


export default async function ChaabPage() {
  const features = [
    { icon: Home,          title: "Déposer une annonce",    description: "Publiez votre bien en quelques minutes — vente, location ou vacances",            color: "text-amber-500 dark:text-amber-400",  bg: "bg-amber-100 dark:bg-amber-900/30" },
    { icon: MessageSquare, title: "Messagerie directe",     description: "Échangez directement avec les agences et les particuliers",                        color: "text-teal-600 dark:text-teal-400",    bg: "bg-teal-100 dark:bg-teal-900/30" },
    { icon: Bell,          title: "Alertes personnalisées", description: "Recevez les nouvelles annonces correspondant à vos critères en temps réel",        color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/30" },
    { icon: Heart,         title: "Favoris & collections",  description: "Sauvegardez et organisez les biens qui vous intéressent",                          color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-100 dark:bg-rose-900/30" },
    { icon: TrendingUp,    title: "Estimation de prix",     description: "Estimez la valeur de votre bien grâce à notre outil d'analyse du marché",          color: "text-green-600 dark:text-green-400",  bg: "bg-green-100 dark:bg-green-900/30" },
    { icon: Shield,        title: "Annonces vérifiées",     description: "Des agences certifiées et des particuliers de confiance à travers les 69 wilayas", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  ] as const;

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 bg-stone-50 dark:bg-stone-950">
        {/* Grain */}
        <div className="bg-noise absolute inset-0 opacity-[0.035] pointer-events-none dark:block hidden" />
        {/* Amber glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-amber-400/10 dark:bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/50 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wider uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            AqarChaab
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
            L&apos;immobilier simplifié<br />
            <span className="text-amber-500 dark:text-amber-400">pour les particuliers</span>
          </h1>
          <p className="mt-6 text-lg text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
            Achetez, louez, vendez — tout ce dont vous avez besoin pour votre projet immobilier en Algérie
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-7 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors duration-fast"
            >
              Créer mon espace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 dark:border-stone-700 px-7 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors duration-fast"
            >
              Explorer les annonces
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 lg:py-24 border-t border-stone-200 dark:border-stone-900">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-50 mb-12">
            Tout pour votre projet immobilier
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-6 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm dark:hover:bg-stone-900 transition-all duration-normal"
                >
                  <div className={`h-10 w-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">{f.title}</h3>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="relative overflow-hidden border-t border-stone-200 dark:border-stone-900 py-20 lg:py-28 bg-stone-50 dark:bg-stone-950">
        <div className="bg-noise absolute inset-0 opacity-[0.035] pointer-events-none dark:block hidden" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-amber-400/8 dark:bg-amber-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl">
            Prêt à trouver votre bien idéal ?
          </h2>
          <p className="mt-3 text-stone-600 dark:text-stone-400">
            Rejoignez des milliers de particuliers qui font confiance à AqarChaab
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors duration-fast"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
