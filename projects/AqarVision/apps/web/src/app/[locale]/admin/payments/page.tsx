import { createClient } from "@/lib/supabase/server";
import { ConfirmPaymentButton } from "./ConfirmPaymentButton";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const [{ data: pendingPacks }, { data: pendingSubs }] = await Promise.all([
    supabase
      .from("individual_listing_packs")
      .select(`
        id, pack_slug, extra_slots, payment_provider, created_at,
        user:users(id, email)
      `)
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("individual_subscriptions")
      .select(`
        id, plan_slug, max_listings, payment_provider, created_at,
        user:users(id, email)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const totalPending = (pendingPacks?.length ?? 0) + (pendingSubs?.length ?? 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white dark:text-zinc-50">Paiements en attente</h1>
        <p className="mt-1 text-sm text-white/50 dark:text-zinc-400">
          {totalPending === 0
            ? "Aucun paiement en attente de validation."
            : `${totalPending} paiement${totalPending > 1 ? "s" : ""} à valider manuellement.`}
        </p>
      </div>

      {/* Pending packs */}
      {(pendingPacks?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40 dark:text-zinc-500">
            Packs d&apos;emplacements
          </h2>
          <div className="space-y-2">
            {pendingPacks!.map((pack) => {
              const u = pack.user as unknown as { id: string; email: string } | null;
              return (
                <div
                  key={pack.id as string}
                  className="flex flex-wrap items-center gap-4 rounded-xl bg-white/[0.04] dark:bg-zinc-800/50 border border-white/[0.08] dark:border-zinc-700 px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 dark:text-zinc-100">{u?.email ?? "—"}</p>
                    <p className="text-xs text-white/40 dark:text-zinc-400">
                      {pack.pack_slug as string} · +{pack.extra_slots as number} emplacements · via {pack.payment_provider as string}
                    </p>
                    <p className="text-xs text-white/30 dark:text-zinc-500">
                      {new Date(pack.created_at as string).toLocaleString("fr-DZ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-500">
                      En attente
                    </span>
                    <ConfirmPaymentButton id={pack.id as string} type="pack" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pending subscriptions */}
      {(pendingSubs?.length ?? 0) > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40 dark:text-zinc-500">
            Abonnements
          </h2>
          <div className="space-y-2">
            {pendingSubs!.map((sub) => {
              const u = sub.user as unknown as { id: string; email: string } | null;
              return (
                <div
                  key={sub.id as string}
                  className="flex flex-wrap items-center gap-4 rounded-xl bg-white/[0.04] dark:bg-zinc-800/50 border border-white/[0.08] dark:border-zinc-700 px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 dark:text-zinc-100">{u?.email ?? "—"}</p>
                    <p className="text-xs text-white/40 dark:text-zinc-400">
                      {sub.plan_slug as string} · {sub.max_listings as number} annonces max · via {sub.payment_provider as string}
                    </p>
                    <p className="text-xs text-white/30 dark:text-zinc-500">
                      {new Date(sub.created_at as string).toLocaleString("fr-DZ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-500">
                      En attente
                    </span>
                    <ConfirmPaymentButton id={sub.id as string} type="subscription" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {totalPending === 0 && (
        <div className="rounded-xl bg-white/[0.02] dark:bg-zinc-800/30 border border-dashed border-white/[0.08] dark:border-zinc-700 py-16 text-center">
          <p className="text-sm text-white/40 dark:text-zinc-500">Aucun paiement en attente</p>
        </div>
      )}
    </div>
  );
}
