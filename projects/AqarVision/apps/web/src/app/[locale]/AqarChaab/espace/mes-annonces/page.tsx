import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { getEffectiveQuota } from "@/features/billing/services/individual-billing.service";

const INDIVIDUAL_ACTIVE_STATUSES = ["draft", "published", "paused", "pending_review"];

interface MesAnnoncesPageProps {
  params: Promise<{ locale: string }>;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Appartement",
  villa: "Villa",
  terrain: "Terrain",
  commercial: "Local commercial",
  office: "Bureau",
  building: "Immeuble",
  farm: "Ferme",
  warehouse: "Entrepôt",
};

const LISTING_TYPE_LABELS: Record<string, string> = {
  sale: "Vente",
  rent: "Location",
  vacation: "Vacances",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "Publiée", color: "#5A8F6E", bg: "rgba(90,143,110,0.10)" },
  draft: { label: "Brouillon", color: "#8A8279", bg: "rgba(138,130,121,0.10)" },
  paused: { label: "Suspendue", color: "#C49A3A", bg: "rgba(196,154,58,0.10)" },
  sold: { label: "Vendue", color: "#5A8F6E", bg: "rgba(90,143,110,0.10)" },
  archived: { label: "Archivée", color: "#8A8279", bg: "rgba(138,130,121,0.10)" },
};

export default async function MesAnnoncesPage({ params }: MesAnnoncesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // layout handles redirect

  const [{ data: listings }, { count: activeCount }, effectiveQuota] = await Promise.all([
    supabase
      .from("listings")
      .select(`
        id, listing_type, property_type, current_status, current_price, currency,
        wilaya_code, surface_m2, rooms, created_at,
        listing_translations(title, slug, locale)
      `)
      .eq("individual_owner_id", user.id)
      .eq("owner_type", "individual")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("individual_owner_id", user.id)
      .eq("owner_type", "individual")
      .in("current_status", INDIVIDUAL_ACTIVE_STATUSES)
      .is("deleted_at", null),
    getEffectiveQuota(supabase, user.id),
  ]);

  const items = listings ?? [];
  const active = activeCount ?? 0;
  const quotaReached = active >= effectiveQuota;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">
            Mes annonces
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {items.length} annonce{items.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Quota bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: effectiveQuota }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${i < active ? "bg-zinc-950" : "bg-zinc-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500">
              <span className="font-semibold text-zinc-900">{active}</span>/{effectiveQuota} actives
            </span>
          </div>

          {quotaReached ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium" style={{ background: "rgba(184,74,58,0.08)", color: "#B84A3A" }}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              Limite atteinte — archivez une annonce pour en créer une nouvelle
            </span>
          ) : (
            <Link
              href={`/${locale}/deposer`}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85 bg-zinc-950 text-zinc-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nouvelle annonce
            </Link>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center bg-white">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
            <svg className="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
            </svg>
          </div>
          <p className="font-medium text-zinc-900">
            Vous n'avez pas encore d'annonces
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Déposez gratuitement votre premier bien immobilier.
          </p>
          <Link
            href={`/${locale}/deposer`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold bg-zinc-950 text-zinc-50"
          >
            Déposer une annonce
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((listing) => {
            const translations = (listing.listing_translations as { title: string; slug: string; locale: string }[]) ?? [];
            const translation = translations.find((t) => t.locale === "fr") ?? translations[0];
            const status = STATUS_CONFIG[listing.current_status as string] ?? {
              label: listing.current_status,
              color: "#71717a",
              bg: "#f4f4f5",
            };

            return (
              <div
                key={listing.id as string}
                className="flex items-center gap-4 rounded-xl p-4 bg-white border border-zinc-200"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                  <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                  </svg>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {LISTING_TYPE_LABELS[listing.listing_type as string]} · {PROPERTY_TYPE_LABELS[listing.property_type as string]}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-medium text-zinc-900">
                    {translation?.title ?? "Sans titre"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {(listing.current_price as number).toLocaleString("fr-DZ")} DZD
                    {listing.surface_m2 ? ` · ${listing.surface_m2} m²` : ""}
                    {listing.rooms ? ` · ${listing.rooms} pièces` : ""}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {translation?.slug && (
                    <Link
                      href={`/${locale}/l/${translation.slug}`}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                      target="_blank"
                    >
                      Voir
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
