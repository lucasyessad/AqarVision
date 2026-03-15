"use client";

import { useActionState, useEffect, useState } from "react";
import {
  startPackCheckoutAction,
  startIndividualSubscriptionAction,
} from "../actions/individual-billing.action";
import type { IndividualCheckoutResult } from "../services/individual-billing.service";
import type { ActionResult } from "../types/billing.types";
import { LISTING_PACKS, INDIVIDUAL_PLANS } from "../config/individual-plans";
import type { PaymentProvider } from "../config/payment-providers";

interface UpgradePricingClientProps {
  currentQuota: number;
  activeListings: number;
  activePlanSlug: string | null;
  provider: PaymentProvider;
  providerLabel: string;
}

// ---------------------------------------------------------------------------
// Manual payment instructions modal
// ---------------------------------------------------------------------------

function ManualPaymentModal({
  result,
  onClose,
}: {
  result: IndividualCheckoutResult;
  onClose: () => void;
}) {
  const acc = result.account_details;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,13,13,0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ background: "#FFFFFF", border: "1px solid var(--ivoire-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 transition-colors hover:bg-[#F6F1EA]"
          style={{ color: "var(--text-muted)" }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(90,143,110,0.1)" }}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#3D7A5A" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold" style={{ color: "var(--onyx)" }}>
          Instructions de paiement
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Montant : <strong style={{ color: "var(--text-dark)" }}>{result.amount_da}</strong>
        </p>

        {result.instructions && (
          <p className="mt-3 rounded-lg p-3 text-sm" style={{ background: "var(--ivoire-deep)", color: "var(--text-body)" }}>
            {result.instructions}
          </p>
        )}

        {acc && (acc.rib || acc.ccp || acc.account_number) && (
          <div className="mt-4 space-y-2 rounded-lg border p-4" style={{ borderColor: "var(--ivoire-border)" }}>
            {acc.bank_name && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Banque</span>
                <span className="font-medium" style={{ color: "var(--text-dark)" }}>{acc.bank_name}</span>
              </div>
            )}
            {acc.account_name && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Titulaire</span>
                <span className="font-medium" style={{ color: "var(--text-dark)" }}>{acc.account_name}</span>
              </div>
            )}
            {acc.rib && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>RIB</span>
                <span className="font-mono font-medium" style={{ color: "var(--text-dark)" }}>{acc.rib}</span>
              </div>
            )}
            {acc.ccp && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>CCP</span>
                <span className="font-mono font-medium" style={{ color: "var(--text-dark)" }}>{acc.ccp}</span>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
          Votre commande sera activée après validation manuelle (24–72 h).
          Conservez la preuve de virement.
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold"
          style={{ background: "var(--onyx)", color: "var(--ivoire)" }}
        >
          Compris
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function UpgradePricingClient({
  currentQuota,
  activeListings,
  activePlanSlug,
  provider,
  providerLabel,
}: UpgradePricingClientProps) {
  const [packState, packAction, packPending] = useActionState<ActionResult<IndividualCheckoutResult> | null, FormData>(
    startPackCheckoutAction,
    null
  );
  const [subState, subAction, subPending] = useActionState<ActionResult<IndividualCheckoutResult> | null, FormData>(
    startIndividualSubscriptionAction,
    null
  );

  const [manualResult, setManualResult] = useState<IndividualCheckoutResult | null>(null);

  // Stripe: redirect on success
  useEffect(() => {
    if (packState?.success && packState.data.checkout_url) {
      window.location.href = packState.data.checkout_url;
    } else if (packState?.success && !packState.data.checkout_url) {
      setManualResult(packState.data);
    }
  }, [packState]);

  useEffect(() => {
    if (subState?.success && subState.data.checkout_url) {
      window.location.href = subState.data.checkout_url;
    } else if (subState?.success && !subState.data.checkout_url) {
      setManualResult(subState.data);
    }
  }, [subState]);

  const isLoading = packPending || subPending;

  return (
    <>
      {manualResult && (
        <ManualPaymentModal result={manualResult} onClose={() => setManualResult(null)} />
      )}

      {/* Provider badge */}
      <div
        className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
        style={{ background: "rgba(138,130,121,0.08)", color: "var(--text-muted)" }}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
        Moyen de paiement actif : <strong>{providerLabel}</strong>
      </div>

      {/* Error feedback */}
      {(packState?.success === false || subState?.success === false) && (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-sm"
          style={{ background: "rgba(184,74,58,0.08)", color: "#B84A3A" }}
        >
          {packState?.success === false ? packState.error.message : subState?.success === false ? subState.error.message : null}
        </div>
      )}

      {/* ── Section 1: Subscriptions ─────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-1 text-xl font-semibold" style={{ color: "var(--onyx)" }}>
          Abonnements mensuels
        </h2>
        <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
          Remplace votre quota gratuit. Résiliable à tout moment.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {INDIVIDUAL_PLANS.map((plan) => {
            const isActive = activePlanSlug === plan.slug;
            return (
              <div
                key={plan.slug}
                className="relative rounded-xl p-5"
                style={{
                  background: "#FFFFFF",
                  border: `1.5px solid ${isActive ? "var(--onyx)" : "var(--ivoire-border)"}`,
                }}
              >
                {plan.badge && (
                  <span
                    className="absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: "var(--onyx)", color: "var(--ivoire)" }}
                  >
                    {plan.badge}
                  </span>
                )}
                {isActive && (
                  <span
                    className="absolute left-4 top-4 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: "rgba(90,143,110,0.12)", color: "#3D7A5A" }}
                  >
                    Actif
                  </span>
                )}

                <p className={`font-semibold text-sm ${isActive || plan.badge ? "mt-6" : ""}`} style={{ color: "var(--text-muted)" }}>
                  {plan.label}
                </p>
                <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
                  {plan.description}
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold" style={{ color: "var(--onyx)" }}>
                    {provider === "stripe" ? `${plan.price_eur} €` : plan.price_da_display}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>/mois</span>
                </div>

                <ul className="mt-4 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-body)" }}>
                      <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#3D7A5A" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <form action={subAction} className="mt-5">
                  <input type="hidden" name="plan_slug" value={plan.slug} />
                  <button
                    type="submit"
                    disabled={isLoading || isActive}
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
                    style={
                      isActive
                        ? { background: "rgba(90,143,110,0.1)", color: "#3D7A5A" }
                        : { background: "var(--onyx)", color: "var(--ivoire)" }
                    }
                  >
                    {isActive ? "Plan actuel" : subPending ? "Chargement…" : "S'abonner"}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 2: One-time packs ────────────────────────────────────── */}
      <section>
        <h2 className="mb-1 text-xl font-semibold" style={{ color: "var(--onyx)" }}>
          Packs d'emplacements supplémentaires
        </h2>
        <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
          Achat unique — slots permanents qui s'ajoutent à votre quota.
          Actuellement : <strong style={{ color: "var(--text-dark)" }}>{activeListings}/{currentQuota} annonces actives</strong>.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {LISTING_PACKS.map((pack) => (
            <div
              key={pack.slug}
              className="relative rounded-xl p-5"
              style={{
                background: "#FFFFFF",
                border: `1.5px solid ${pack.badge ? "var(--onyx)" : "var(--ivoire-border)"}`,
              }}
            >
              {pack.badge && (
                <span
                  className="absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: "var(--onyx)", color: "var(--ivoire)" }}
                >
                  {pack.badge}
                </span>
              )}

              <p className="font-semibold text-sm" style={{ color: "var(--text-dark)" }}>
                {pack.label}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                +{pack.extra_slots} emplacements
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold" style={{ color: "var(--onyx)" }}>
                  {provider === "stripe" ? `${pack.price_eur} €` : pack.price_da_display}
                </span>
                {provider === "stripe" && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {pack.price_da_display}
                  </span>
                )}
              </div>

              <form action={packAction} className="mt-5">
                <input type="hidden" name="pack_slug" value={pack.slug} />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
                  style={{ background: "var(--onyx)", color: "var(--ivoire)" }}
                >
                  {packPending ? "Chargement…" : "Acheter"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
