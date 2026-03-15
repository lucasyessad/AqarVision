import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default async function ProPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const features = [
    {
      icon: (
        <svg
          className="h-7 w-7 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
      ),
      title: "Kanban Leads",
      description:
        "Visualisez et gérez vos prospects en temps réel avec un tableau kanban intuitif. Suivez chaque opportunité de la prise de contact jusqu'à la signature.",
    },
    {
      icon: (
        <svg
          className="h-7 w-7 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      ),
      title: "Analytics & Statistiques",
      description:
        "Mesurez vos performances : vues, taux de conversion, évolution du prix au m². Prenez des décisions éclairées grâce aux données en temps réel.",
    },
    {
      icon: (
        <svg
          className="h-7 w-7 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      ),
      title: "Rédaction IA",
      description:
        "Générez des descriptions d'annonces professionnelles et traduisez-les en arabe, français, anglais et espagnol en un clic grâce à l'IA Claude.",
    },
    {
      icon: (
        <svg
          className="h-7 w-7 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
          />
        </svg>
      ),
      title: "Thèmes personnalisables",
      description:
        "Personnalisez l'apparence de votre espace pro avec votre logo, vos couleurs et votre identité visuelle pour une expérience client cohérente.",
    },
    {
      icon: (
        <svg
          className="h-7 w-7 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      ),
      title: "Multi-agences & Équipes",
      description:
        "Gérez plusieurs agences ou succursales depuis un seul compte. Invitez vos agents, assignez des rôles et collaborez en temps réel.",
    },
    {
      icon: (
        <svg
          className="h-7 w-7 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      ),
      title: "Messagerie intégrée",
      description:
        "Centralisez tous vos échanges avec les acheteurs et locataires. Ne manquez plus aucune demande, même en déplacement.",
    },
  ];

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}><MarketingHeaderWrapper locale={locale} /></Suspense>

      <main>
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-blue-night px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(212,175,55,0.2),_transparent_60%)]"
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold">
              AqarPro
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              La plateforme CRM immobilier pour les agences algériennes
            </h1>
            <p className="mt-6 text-lg text-blue-200">
              Publiez, gérez et analysez vos annonces immobilières depuis un
              espace unique. Conçu pour les 58 wilayas d&apos;Algérie.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                locale={locale}
                className="rounded-xl bg-gold px-8 py-3.5 font-semibold text-blue-night transition-opacity hover:opacity-90"
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

        {/* ─── Features ───────────────────────────────────────────────────── */}
        <section className="bg-off-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-blue-night sm:text-3xl">
                Tout ce dont votre agence a besoin
              </h2>
              <p className="mt-3 text-gray-500">
                Des outils puissants pour accélérer vos ventes et fidéliser vos
                clients.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-night/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-blue-night">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Social proof ───────────────────────────────────────────────── */}
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-blue-night sm:text-3xl">
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
                  <p className="text-3xl font-bold text-blue-night">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing teaser ─────────────────────────────────────────────── */}
        <section className="bg-off-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-blue-night sm:text-3xl">
              Des tarifs adaptés à chaque agence
            </h2>
            <p className="mt-4 text-gray-500">
              Du plan Starter pour les indépendants au plan Enterprise pour les
              réseaux multi-agences. Commencez gratuitement, évoluez sans
              friction.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                locale={locale}
                className="rounded-xl border-2 border-blue-night px-8 py-3 font-semibold text-blue-night transition-colors hover:bg-blue-night hover:text-white"
              >
                Voir tous les tarifs
              </Link>
              <Link
                href="/auth/register"
                locale={locale}
                className="rounded-xl bg-blue-night px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
              >
                Démarrer gratuitement
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ──────────────────────────────────────────────────── */}
        <section className="bg-blue-night px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Prêt à transformer votre agence ?
            </h2>
            <p className="mt-4 text-blue-200">
              Créez votre compte en 2 minutes. Aucune carte bancaire requise.
            </p>
            <Link
              href="/auth/register"
              locale={locale}
              className="mt-8 inline-flex items-center rounded-xl bg-gold px-8 py-3.5 font-semibold text-blue-night transition-opacity hover:opacity-90"
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
