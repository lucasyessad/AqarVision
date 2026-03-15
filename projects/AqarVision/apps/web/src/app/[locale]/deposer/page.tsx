import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getWilayas } from "@/features/marketplace/services/search.service";
import { DeposerWizardV2 } from "@/features/listings/components/DeposerWizardV2";
import { getEffectiveQuota } from "@/features/billing/services/individual-billing.service";

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
    getWilayas(supabase),
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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-zinc-950">
              Déposer une annonce
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Publiez gratuitement votre bien immobilier sur AqarChaab.
            </p>
          </div>

          {/* Quota badge */}
          <div
            className={[
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
              quotaReached
                ? "border border-red-200 bg-red-50 text-red-700"
                : "border border-green-200 bg-green-50 text-green-700",
            ].join(" ")}
          >
            <span className="font-semibold">{active}/{effectiveQuota}</span>
            <span>annonces actives</span>
          </div>
        </div>

        {quotaReached ? (
          <div
            className="rounded-xl border border-zinc-200 bg-white p-6 text-center"
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50"
            >
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-950">
              Limite atteinte
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Vous avez déjà <strong>{effectiveQuota} annonces actives</strong>.
              Archivez ou supprimez une annonce existante pour en publier une nouvelle.
            </p>
            <a
              href={`/${locale}/AqarChaab/espace/mes-annonces`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-zinc-50"
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
