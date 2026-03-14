"use client";

import { useState, useActionState } from "react";
import { useTranslations } from "next-intl";
import { createLeadAction } from "../actions/messaging.action";

interface ContactButtonProps {
  listingId: string;
}

export function ContactButton({ listingId }: ContactButtonProps) {
  const t = useTranslations("messaging");
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [state, formAction, isPending] = useActionState(createLeadAction, null);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a365d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a365d]/90 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {t("contact_agency")}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                {t("contact_agency")}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {state?.success ? (
              <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700">
                {t("lead_created")}
              </div>
            ) : (
              <form action={formAction}>
                <input type="hidden" name="listing_id" value={listingId} />
                <input type="hidden" name="source" value="platform" />

                <div className="mb-4">
                  <label
                    htmlFor="contact-message"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t("contact_message")}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder={t("message_placeholder")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#1a365d] focus:outline-none focus:ring-1 focus:ring-[#1a365d]"
                  />
                  <p className="mt-1 text-end text-xs text-gray-400">
                    {message.length}/500
                  </p>
                </div>

                {state?.success === false && (
                  <p className="mb-3 text-sm text-red-600">
                    {state.error.message}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-[#1a365d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1a365d]/90 disabled:opacity-50"
                  >
                    {isPending ? t("sending") : t("send")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
