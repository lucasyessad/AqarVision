import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "Vendre · AqarVision" };

export default async function VendrePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}><MarketingHeaderWrapper locale={locale} /></Suspense>
      <main
        className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-20"
        style={{ background: "var(--onyx)" }}
      >
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-block h-px w-8" style={{ background: "var(--or)" }} />
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--or)" }}>
            Vendre un bien
          </p>
          <span className="inline-block h-px w-8" style={{ background: "var(--or)" }} />
        </div>

        <h1
          className="mb-3 text-center text-3xl font-light sm:text-4xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ivoire)" }}
        >
          Vous êtes…
        </h1>
        <p className="mb-12 text-center text-sm" style={{ color: "rgba(253,251,247,0.4)" }}>
          Choisissez votre espace pour publier votre annonce.
        </p>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Particulier */}
          <Link
            href="/AqarChaab/auth/login"
            locale={locale}
            className="group flex flex-col gap-4 rounded-xl p-7 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: "rgba(253,251,247,0.05)",
              border: "1px solid rgba(253,251,247,0.10)",
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(253,251,247,0.08)" }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: "var(--ivoire)" }}>
                Particulier
              </p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "rgba(253,251,247,0.45)" }}>
                Vous vendez votre propre bien. Publication gratuite, mise en ligne immédiate.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--or)" }}>
              Créer mon annonce
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>

          {/* Agence */}
          <Link
            href="/AqarPro/auth/login"
            locale={locale}
            className="group flex flex-col gap-4 rounded-xl p-7 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: "rgba(26,54,93,0.35)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(212,175,55,0.15)" }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#d4af37" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: "var(--ivoire)" }}>
                Agence immobilière
              </p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "rgba(253,251,247,0.45)" }}>
                Vous gérez des mandats pour des clients. Accédez à AqarPro pour publier via votre CRM.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#d4af37" }}>
              Espace AqarPro
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        </div>
      </main>
      <MarketingFooter locale={locale} />
    </>
  );
}
