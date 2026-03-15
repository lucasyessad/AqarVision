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
      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-zinc-950 px-4 py-20">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-amber-500" />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
            Vendre un bien
          </p>
          <span className="inline-block h-px w-8 bg-amber-500" />
        </div>

        <h1 className="mb-3 font-display text-center text-3xl font-light text-zinc-50 sm:text-4xl">
          Vous êtes…
        </h1>
        <p className="mb-12 text-center text-sm text-zinc-50/40">
          Choisissez votre espace pour publier votre annonce.
        </p>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Particulier */}
          <Link
            href="/AqarChaab/auth/login"
            locale={locale}
            className="group flex flex-col gap-4 rounded-xl p-7 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: "rgba(250,250,250,0.05)",
              border: "1px solid rgba(250,250,250,0.10)",
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(250,250,250,0.08)" }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-50">
                Particulier
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-50/45">
                Vous vendez votre propre bien. Publication gratuite, mise en ligne immédiate.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
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
              background: "rgba(9,9,11,0.35)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(245,158,11,0.15)" }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-50">
                Agence immobilière
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-50/45">
                Vous gérez des mandats pour des clients. Accédez à AqarPro pour publier via votre CRM.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
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
