import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import {
  User,
  Building2,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "Vendre · AqarVision" };

export default async function VendrePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}>
        <MarketingHeaderWrapper locale={locale} />
      </Suspense>

      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-zinc-950 px-4 py-20 dark:bg-zinc-900">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-amber-500" />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
            Vendre un bien
          </p>
          <span className="inline-block h-px w-8 bg-amber-500" />
        </div>

        <h1 className="mb-3 text-center font-display text-3xl font-light text-zinc-50 sm:text-4xl">
          Vous êtes...
        </h1>
        <p className="mb-12 text-center text-sm text-zinc-50/40">
          Choisissez votre espace pour publier votre annonce.
        </p>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Particulier */}
          <Link
            href="/AqarChaab/auth/login"
            locale={locale}
            className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-7 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <User className="h-6 w-6 text-white" />
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
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Agence */}
          <Link
            href="/AqarPro/auth/login"
            locale={locale}
            className="group flex flex-col gap-4 rounded-xl border border-amber-500/20 bg-zinc-950/35 p-7 transition-all hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-2xl dark:bg-black/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
              <Building2 className="h-6 w-6 text-amber-500" />
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
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
