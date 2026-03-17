import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getWilayas } from "@/features/marketplace/services/search.service";
import { DeposerWizardV2 } from "@/features/listings/components/DeposerWizardV2";
import { getEffectiveQuota } from "@/features/billing/services/individual-billing.service";
import { AlertTriangle } from "lucide-react";

const INDIVIDUAL_ACTIVE_STATUSES = ["draft", "published", "paused", "pending_review"];

export default async function DeposerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/AqarChaab/auth/login?redirect=/${locale}/deposer`);
  }

  const [wilayas, { count: activeCount }, effectiveQuota] = await Promise.all([
    getWilayas(supabase, locale),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("individual_owner_id", user.id)
      .eq("owner_type", "individual")
      .in("current_status", INDIVIDUAL_ACTIVE_STATUSES)
      .is("deleted_at", null),
    getEffectiveQuota(supabase, user.id),
  ]);

  const active = activeCount ?? 0;
  const quotaReached = active >= effectiveQuota;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
              Déposer une annonce
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Publiez gratuitement votre bien immobilier sur AqarChaab.
            </p>
          </div>

          {/* Quota badge */}
          <div
            className={[
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
              quotaReached
                ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                : "border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400",
            ].join(" ")}
          >
            <span className="font-semibold">{active}/{effectiveQuota}</span>
            <span>annonces actives</span>
          </div>
        </div>

        {quotaReached ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
              <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              Limite atteinte
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Vous avez déjà <strong>{effectiveQuota} annonces actives</strong>.
              Archivez ou supprimez une annonce existante pour en publier une nouvelle.
            </p>
            <a
              href={`/${locale}/AqarChaab/espace/mes-annonces`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-zinc-50 transition-opacity hover:opacity-90 dark:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-950 dark:text-zinc-50"
            >
              Gérer mes annonces
            </a>
          </div>
        ) : (
          <DeposerWizardV2 wilayas={wilayas} activeCount={active} quota={effectiveQuota} locale={locale} />
        )}
      </div>
    </div>
  );
}
