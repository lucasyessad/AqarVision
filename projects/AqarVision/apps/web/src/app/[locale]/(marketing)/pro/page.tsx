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
    { icon: Building2, title: "Gestion annonces", description: "Créez, éditez et publiez vos annonces avec un wizard intelligent" },
    { icon: Users, title: "CRM Leads", description: "Kanban board pour suivre vos prospects et augmenter vos conversions" },
    { icon: BarChart3, title: "Analytics", description: "Statistiques détaillées : vues, leads, contacts, performances" },
    { icon: Palette, title: "Vitrine agence", description: "10 thèmes professionnels pour votre page agence personnalisée" },
    { icon: CreditCard, title: "Facturation Stripe", description: "Paiements sécurisés et gestion automatisée des abonnements" },
    { icon: Shield, title: "Badge vérification", description: "4 niveaux de confiance pour rassurer vos clients" },
  ] as const;

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen">
      {/* Hero */}
      <section className="bg-stone-900 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="text-sm font-medium text-teal-400">AqarPro</span>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Digitalisez votre agence immobilière
          </h1>
          <p className="mt-4 text-lg text-stone-300">
            Le CRM tout-en-un pour les agences immobilières algériennes
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/agency/new"
              className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors duration-fast"
            >
              Créer mon agence
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-md border border-stone-500 px-6 py-3 text-sm font-medium text-stone-300 hover:bg-stone-800 transition-colors duration-fast"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 mb-12">
            Tout ce dont votre agence a besoin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 hover:shadow-card-hover transition-shadow duration-normal"
                >
                  <div className="h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
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
    </div>
  );
}
