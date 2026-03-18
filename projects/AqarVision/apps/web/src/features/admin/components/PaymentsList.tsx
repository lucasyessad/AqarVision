"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  X,
  User,
  Calendar,
  ExternalLink,
  Banknote,
} from "lucide-react";
import { approvePaymentAction } from "../actions/admin.action";
import type { AdminPayment } from "../types/admin.types";

interface PaymentsListProps {
  initialPayments: AdminPayment[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  pending: {
    label: "En attente",
    icon: Clock,
    color: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  },
  pending_verification: {
    label: "En vérification",
    icon: Clock,
    color: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  },
  verified: {
    label: "Vérifié",
    icon: Check,
    color: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  },
  completed: {
    label: "Complété",
    icon: Check,
    color: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  },
  rejected: {
    label: "Rejeté",
    icon: X,
    color: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  },
  failed: {
    label: "Échoué",
    icon: X,
    color: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  },
};

const providerLabels: Record<string, string> = {
  stripe: "Stripe",
  cib: "CIB",
  dahabia: "Dahabia",
  baridimob: "BaridiMob",
  virement: "Virement",
};

type StatusTab = "all" | "pending" | "verified" | "rejected";

export function PaymentsList({
  initialPayments,
  initialTotal,
  initialPage,
  perPage,
}: PaymentsListProps) {
  const tEmpty = useTranslations("common.empty");
  const [payments, setPayments] = useState(initialPayments);
  const [total] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / perPage);

  const tabs: Array<{ key: StatusTab; label: string }> = [
    { key: "all", label: "Tous" },
    { key: "pending", label: "En attente" },
    { key: "verified", label: "Vérifiés" },
    { key: "rejected", label: "Rejetés" },
  ];

  const filtered = payments.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") {
      return (
        p.payment_status === "pending" ||
        p.payment_status === "pending_verification"
      );
    }
    return p.payment_status === activeTab;
  });

  function handleApprove(paymentId: string) {
    startTransition(async () => {
      const result = await approvePaymentAction(paymentId);
      if (result.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? { ...p, payment_status: "verified" }
              : p
          )
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-stone-100 dark:bg-stone-800 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_100px_100px_100px_120px_100px] gap-4 px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Utilisateur
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Montant
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Provider
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Statut
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Date
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Actions
          </span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
            <p className="text-sm text-stone-400 dark:text-stone-500">
              {tEmpty("noPayments")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filtered.map((payment) => {
              const status =
                statusConfig[payment.payment_status] ?? statusConfig["pending"];
              const StatusIcon = status?.icon ?? Clock;
              const isPendingPayment =
                payment.payment_status === "pending" ||
                payment.payment_status === "pending_verification";

              return (
                <div
                  key={payment.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_100px_100px_100px_120px_100px] gap-2 md:gap-4 px-4 py-3 items-center hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  {/* User */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 shrink-0">
                      <User className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {payment.user
                          ? `${payment.user.first_name} ${payment.user.last_name}`
                          : "Utilisateur inconnu"}
                      </p>
                      <p className="text-xs text-stone-400 dark:text-stone-500 truncate">
                        {payment.pack_type ??
                          payment.subscription_type ??
                          "-"}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-1">
                    <Banknote className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500 md:hidden" />
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {new Intl.NumberFormat("fr-DZ", {
                        style: "currency",
                        currency: payment.currency,
                        maximumFractionDigits: 0,
                      }).format(payment.amount)}
                    </span>
                  </div>

                  {/* Provider */}
                  <div>
                    <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                      {providerLabels[payment.provider] ?? payment.provider}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        status?.color
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status?.label}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                    <Calendar className="h-3.5 w-3.5 hidden md:block" />
                    <span>
                      {new Date(payment.created_at).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isPendingPayment && (
                      <button
                        type="button"
                        onClick={() => handleApprove(payment.id)}
                        disabled={isPending}
                        className="rounded-md bg-green-50 dark:bg-green-950 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Approuver
                      </button>
                    )}
                    {payment.receipt_url && (
                      <a
                        href={payment.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                        title="Voir le reçu"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Page {page} sur {totalPages} ({total} paiements)
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
