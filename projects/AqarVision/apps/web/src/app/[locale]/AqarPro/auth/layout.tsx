import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { Link } from "@/lib/i18n/navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AqarProAuthLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-4">
        {/* Back to homepage */}
        <Link
          href="/"
          locale={locale}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <AqarBrandLogo product="Vision" size="sm" onDark />
        </Link>

        {/* Current branch */}
        <AqarBrandLogo product="Pro" size="sm" onDark />
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1">

        {/* Left branding panel — hidden on mobile */}
        <div className="hidden flex-col justify-between border-r border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-12 lg:flex lg:w-1/2">
          <div>
            <AqarBrandLogo product="Pro" size="lg" onDark className="mb-16" />
            <h2 className="font-display text-4xl font-light leading-snug text-zinc-50">
              <span className="italic">La plateforme</span>
              <br />
              <span className="font-semibold">des agences</span>
              <br />
              immobilières
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Gérez vos annonces, vos leads et vos performances depuis un seul espace professionnel.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Publication illimitée d'annonces",
              "CRM leads & messagerie",
              "Analytiques & statistiques marché",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <p className="text-sm text-zinc-500">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
