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
      className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
      style={{ background: "rgba(90,143,110,0.15)", color: "#5A8F6E" }}
    >
      {pending ? "…" : "Valider"}
    </button>
  );
}
