"use client";

import { useTransition } from "react";
import {
  confirmPackPaymentAction,
  confirmSubscriptionPaymentAction,
} from "@/features/admin/actions/platform-settings.action";

interface ConfirmPaymentButtonProps {
  id: string;
  type: "pack" | "subscription";
}

export function ConfirmPaymentButton({ id, type }: ConfirmPaymentButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const action = type === "pack" ? confirmPackPaymentAction : confirmSubscriptionPaymentAction;
      await action(id);
    });
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={pending}
      className="rounded-lg bg-green-500/15 px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 transition-opacity hover:opacity-80 disabled:opacity-40"
    >
      {pending ? "…" : "Valider"}
    </button>
  );
}
