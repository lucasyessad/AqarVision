/**
 * Payment provider configuration.
 *
 * Stripe is NOT available in Algeria currently.
 * This abstraction lets you configure the active provider via env var
 * and switch to Stripe when/if it becomes available.
 *
 * PAYMENT_PROVIDER=stripe    → Stripe Checkout (EUR)
 * PAYMENT_PROVIDER=cib       → CIB carte interbancaire (DZD, virement)
 * PAYMENT_PROVIDER=dahabia   → Dahabia / Algérie Poste (DZD)
 * PAYMENT_PROVIDER=baridimob → BaridiMob mobile (DZD)
 * PAYMENT_PROVIDER=virement  → Virement bancaire manuel (DZD)
 */

export type PaymentProvider = "stripe" | "cib" | "dahabia" | "baridimob" | "virement";

export interface PaymentProviderConfig {
  id: PaymentProvider;
  label: string;
  currency: "EUR" | "DZD";
  /** Is this provider online (automatic) or requires manual validation? */
  automatic: boolean;
  /** Short description shown to user */
  description: string;
  /** Instructions shown after initiating payment (for manual providers) */
  instructions?: string;
}

export const PAYMENT_PROVIDERS: Record<PaymentProvider, PaymentProviderConfig> = {
  stripe: {
    id: "stripe",
    label: "Carte bancaire (Stripe)",
    currency: "EUR",
    automatic: true,
    description: "Paiement sécurisé par carte bancaire internationale",
  },
  cib: {
    id: "cib",
    label: "CIB — Carte Interbancaire",
    currency: "DZD",
    automatic: false,
    description: "Paiement par carte CIB (banques algériennes)",
    instructions:
      "Effectuez votre virement vers le compte ci-dessous en indiquant votre email comme référence. " +
      "Votre commande sera activée sous 24–48 h après réception.",
  },
  dahabia: {
    id: "dahabia",
    label: "Dahabia — Algérie Poste",
    currency: "DZD",
    automatic: false,
    description: "Paiement par carte Dahabia (CCP Algérie Poste)",
    instructions:
      "Effectuez votre virement CCP vers le compte ci-dessous en indiquant votre email comme référence. " +
      "Votre commande sera activée sous 24–48 h.",
  },
  baridimob: {
    id: "baridimob",
    label: "BaridiMob",
    currency: "DZD",
    automatic: false,
    description: "Paiement mobile via BaridiMob (Algérie Poste)",
    instructions:
      "Ouvrez BaridiMob, sélectionnez Virement et utilisez le compte ci-dessous. " +
      "Votre commande sera activée sous 24–48 h.",
  },
  virement: {
    id: "virement",
    label: "Virement bancaire",
    currency: "DZD",
    automatic: false,
    description: "Virement bancaire classique (toutes banques algériennes)",
    instructions:
      "Effectuez un virement bancaire vers le compte ci-dessous en indiquant votre email comme référence. " +
      "Votre commande sera activée sous 48–72 h.",
  },
};

/** Active provider from env — defaults to 'virement' (safe for Algeria) */
export function getActiveProvider(): PaymentProvider {
  const raw = process.env.PAYMENT_PROVIDER ?? "virement";
  if (raw in PAYMENT_PROVIDERS) return raw as PaymentProvider;
  return "virement";
}

export function getActiveProviderConfig(): PaymentProviderConfig {
  return PAYMENT_PROVIDERS[getActiveProvider()];
}

export function isStripeActive(): boolean {
  return getActiveProvider() === "stripe";
}

/**
 * Bank / payment account details for manual providers.
 * Configured via env vars to avoid hardcoding financial data.
 */
export function getPaymentAccountDetails() {
  return {
    bank_name: process.env.PAYMENT_BANK_NAME ?? "Banque à configurer",
    account_name: process.env.PAYMENT_ACCOUNT_NAME ?? "",
    account_number: process.env.PAYMENT_ACCOUNT_NUMBER ?? "",
    rib: process.env.PAYMENT_RIB ?? "",
    ccp: process.env.PAYMENT_CCP ?? "",
    iban: process.env.PAYMENT_IBAN ?? "",
  };
}
