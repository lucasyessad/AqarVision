import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight, BarChart3, Users, Building2, CreditCard, Palette, Shield } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "AqarPro — CRM Agence Immobilière" };
}


export default async function ProPage() {
  const t = await getTranslations("marketing");

  const features = [
    { icon: Building2,  title: "Gestion annonces",   description: "Créez, éditez et publiez vos annonces avec un wizard intelligent en 7 étapes", color: "text-teal-600 dark:text-teal-400",     bg: "bg-teal-100 dark:bg-teal-900/30" },
    { icon: Users,      title: "CRM Leads",           description: "Kanban board pour suivre vos prospects et augmenter vos conversions",          color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900/30" },
    { icon: BarChart3,  title: "Analytics",            description: "Statistiques détaillées : vues, leads, contacts, performances par annonce",    color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-100 dark:bg-blue-900/30" },
    { icon: Palette,    title: "Vitrine agence",       description: "10 thèmes professionnels pour votre page agence entièrement personnalisée",    color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { icon: CreditCard, title: "Facturation Stripe",   description: "Paiements sécurisés et gestion automatisée des abonnements",                  color: "text-green-600 dark:text-green-400",   bg: "bg-green-100 dark:bg-green-900/30" },
    { icon: Shield,     title: "Badge vérification",   description: "4 niveaux de confiance pour rassurer vos clients et vous démarquer",          color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900/30" },
  ] as const;

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 bg-stone-50 dark:bg-stone-950">
        {/* Grain */}
        <div className="bg-noise absolute inset-0 opacity-[0.035] pointer-events-none dark:block hidden" />
        {/* Teal glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-teal-500/10 dark:bg-teal-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/50 dark:border-teal-700/50 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-semibold tracking-wider uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
            AqarPro
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
            Digitalisez votre<br />
            <span className="text-teal-600 dark:text-teal-400">agence immobilière</span>
          </h1>
          <p className="mt-6 text-lg text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
            Le CRM tout-en-un pour les agences immobilières algériennes — annonces, leads, analytics, vitrine.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/agency/new"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-7 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors duration-fast"
            >
              Créer mon agence
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 dark:border-stone-700 px-7 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors duration-fast"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 lg:py-24 border-t border-stone-200 dark:border-stone-900">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-50 mb-12">
            Tout ce dont votre agence a besoin
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-teal-500/8 dark:bg-teal-600/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl">
            Prêt à digitaliser votre agence ?
          </h2>
          <p className="mt-3 text-stone-600 dark:text-stone-400">
            Essai gratuit 14 jours — aucune carte bancaire requise
          </p>
          <Link
            href="/agency/new"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors duration-fast"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
