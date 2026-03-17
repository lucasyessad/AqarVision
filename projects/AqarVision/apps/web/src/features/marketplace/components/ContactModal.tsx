"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

type LeadType = "info" | "visit" | "offer" | "urgent";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  agencyName: string | null;
  onSubmit: (data: { leadType: LeadType; message: string; phone: string }) => Promise<void>;
}

const LEAD_TYPES: LeadType[] = ["info", "visit", "offer", "urgent"];

export function ContactModal({
  open,
  onClose,
  listingTitle,
  agencyName,
  onSubmit,
}: ContactModalProps) {
  const t = useTranslations("listings");
  const [leadType, setLeadType] = useState<LeadType>("info");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await onSubmit({ leadType, message, phone });
      onClose();
      setMessage("");
      setPhone("");
      setLeadType("info");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {t("contact")}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {agencyName ? agencyName : listingTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Lead type chips */}
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("lead_type_label")}
            </p>
            <div className="flex flex-wrap gap-2">
              {LEAD_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLeadType(type)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    leadType === type
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {t(`lead_type_${type}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("your_message")}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder={t("message_placeholder")}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("phone_label")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder="05XX XX XX XX"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !message.trim()}
            className="flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
          >
            {isPending ? t("sending") : t("send_message")}
          </button>
        </form>
      </div>
    </div>
  );
}
