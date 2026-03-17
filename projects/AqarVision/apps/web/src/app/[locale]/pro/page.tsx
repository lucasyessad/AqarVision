import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import {
  LayoutGrid,
  BarChart3,
  Sparkles,
  Paintbrush,
  Users,
  MessageCircle,
} from "lucide-react";

export default async function ProPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const features = [
    {
      icon: <LayoutGrid className="h-7 w-7 text-amber-500 dark:text-amber-400" />,
      title: "Kanban Leads",
      description:
        "Visualisez et gérez vos prospects en temps réel avec un tableau kanban intuitif. Suivez chaque opportunité de la prise de contact jusqu'à la signature.",
    },
    {
      icon: <BarChart3 className="h-7 w-7 text-amber-500 dark:text-amber-400" />,
      title: "Analytics & Statistiques",
      description:
        "Mesurez vos performances : vues, taux de conversion, évolution du prix au m². Prenez des décisions éclairées grâce aux données en temps réel.",
    },
    {
      icon: <Sparkles className="h-7 w-7 text-amber-500 dark:text-amber-400" />,
      title: "Rédaction IA",
      description:
        "Générez des descriptions d'annonces professionnelles et traduisez-les en arabe, français, anglais et espagnol en un clic grâce à l'IA Claude.",
    },
    {
      icon: <Paintbrush className="h-7 w-7 text-amber-500 dark:text-amber-400" />,
      title: "Thèmes personnalisables",
      description:
        "Personnalisez l'apparence de votre espace pro avec votre logo, vos couleurs et votre identité visuelle pour une expérience client cohérente.",
    },
    {
      icon: <Users className="h-7 w-7 text-amber-500 dark:text-amber-400" />,
      title: "Multi-agences & Équipes",
      description:
        "Gérez plusieurs agences ou succursales depuis un seul compte. Invitez vos agents, assignez des rôles et collaborez en temps réel.",
    },
    {
      icon: <MessageCircle className="h-7 w-7 text-amber-500 dark:text-amber-400" />,
      title: "Messagerie intégrée",
      description:
        "Centralisez tous vos échanges avec les acheteurs et locataires. Ne manquez plus aucune demande, même en déplacement.",
    },
  ];

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}>
        <MarketingHeaderWrapper locale={locale} />
      </Suspense>

      <main>
        {/* -- Hero -------------------------------------------------------- */}
        <section className="relative overflow-hidden bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8 lg:py-28 dark:bg-zinc-900">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(245,158,11,0.15),_transparent_60%)]"
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-500 dark:text-amber-400">
              AqarPro
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              La plateforme CRM immobilier pour les agences algériennes
            </h1>
            <p className="mt-6 text-lg text-zinc-400 dark:text-zinc-300">
              Publiez, gérez et analysez vos annonces immobilières depuis un
              espace unique. Conçu pour les 58 wilayas d&apos;Algérie.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                locale={locale}
                className="rounded-xl bg-amber-500 px-8 py-3.5 font-semibold text-zinc-950 dark:text-zinc-50 transition-colors hover:bg-amber-400"
              >
                Démarrer gratuitement
              </Link>
              <Link
                href="/pricing"
                locale={locale}
                className="rounded-xl border border-white/20 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Voir les tarifs
              </Link>
            </div>
          </div>
        </section>

        {/* -- Features ---------------------------------------------------- */}
        <section className="bg-zinc-50 dark:bg-zinc-800 px-4 py-16 sm:px-6 lg:px-8 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl dark:text-zinc-50">
                Tout ce dont votre agence a besoin
              </h2>
              <p className="mt-3 text-zinc-500 dark:text-zinc-400">
                Des outils puissants pour accélérer vos ventes et fidéliser vos
                clients.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-950/5 dark:bg-zinc-50/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 dark:text-zinc-50">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- Social proof ------------------------------------------------ */}
        <section className="bg-white dark:bg-zinc-900 px-4 py-16 sm:px-6 lg:px-8 dark:bg-zinc-900">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl dark:text-zinc-50">
              Rejoignez 320+ agences partenaires
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: "320+", label: "Agences actives" },
                { value: "12k+", label: "Annonces publiées" },
                { value: "48", label: "Wilayas couvertes" },
                { value: "4.8/5", label: "Note moyenne" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 dark:text-zinc-50">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- Pricing teaser ---------------------------------------------- */}
        <section className="bg-zinc-50 dark:bg-zinc-800 px-4 py-16 sm:px-6 lg:px-8 dark:bg-zinc-950">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl dark:text-zinc-50">
              Des tarifs adaptés à chaque agence
            </h2>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400">
              Du plan Starter pour les indépendants au plan Enterprise pour les
              réseaux multi-agences. Commencez gratuitement, évoluez sans
              friction.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                locale={locale}
                className="rounded-xl border-2 border-zinc-900 px-8 py-3 font-semibold text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-900 hover:text-white dark:border-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:text-zinc-900 dark:text-zinc-100"
              >
                Voir tous les tarifs
              </Link>
              <Link
                href="/auth/register"
                locale={locale}
                className="rounded-xl bg-zinc-900 px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90 dark:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-900 dark:text-zinc-100"
              >
                Démarrer gratuitement
              </Link>
            </div>
          </div>
        </section>

        {/* -- Final CTA --------------------------------------------------- */}
        <section className="bg-zinc-950 px-4 py-16 sm:px-6 lg:px-8 dark:bg-zinc-900">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Prêt à transformer votre agence ?
            </h2>
            <p className="mt-4 text-zinc-400 dark:text-zinc-300">
              Créez votre compte en 2 minutes. Aucune carte bancaire requise.
            </p>
            <Link
              href="/auth/register"
              locale={locale}
              className="mt-8 inline-flex items-center rounded-xl bg-amber-500 px-8 py-3.5 font-semibold text-zinc-950 dark:text-zinc-50 transition-colors hover:bg-amber-400"
            >
              Démarrer gratuitement →
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
