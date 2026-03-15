import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveQuota } from "@/features/billing/services/individual-billing.service";
import { getActiveProvider, getActiveProviderConfig } from "@/features/billing/config/payment-providers";
import { UpgradePricingClient } from "@/features/billing/components/UpgradePricingClient";

const INDIVIDUAL_ACTIVE_STATUSES = ["draft", "published", "paused", "pending_review"];

interface UpgradePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ checkout?: string }>;
}

export default async function UpgradePage({ params, searchParams }: UpgradePageProps) {
  const { locale } = await params;
  const { checkout } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // layout handles redirect

  const [effectiveQuota, { count: activeCount }, activeSub] = await Promise.all([
    getEffectiveQuota(supabase, user.id),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("individual_owner_id", user.id)
      .eq("owner_type", "individual")
      .in("current_status", INDIVIDUAL_ACTIVE_STATUSES)
      .is("deleted_at", null),
    supabase
      .from("individual_subscriptions")
      .select("plan_slug")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const provider = getActiveProvider();
  const providerConfig = getActiveProviderConfig();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--onyx)" }}>
          Augmenter mon quota
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
          Publiez plus d'annonces sur AqarChaab
        </p>
      </div>

      {/* Checkout result banner */}
      {checkout === "success" && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: "rgba(90,143,110,0.10)", color: "#3D7A5A", border: "1px solid rgba(90,143,110,0.2)" }}
        >
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Paiement reçu — votre quota sera mis à jour sous peu.
        </div>
      )}
      {checkout === "cancel" && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: "rgba(184,74,58,0.08)", color: "#B84A3A", border: "1px solid rgba(184,74,58,0.15)" }}
        >
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Paiement annulé.
        </div>
      )}

      <UpgradePricingClient
        currentQuota={effectiveQuota}
        activeListings={activeCount ?? 0}
        activePlanSlug={activeSub.data?.plan_slug as string | null ?? null}
        provider={provider}
        providerLabel={providerConfig.label}
      />
    </div>
  );
}
