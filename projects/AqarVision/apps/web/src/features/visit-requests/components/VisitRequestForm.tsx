"use client";

import { useState } from "react";
import { submitVisitRequestAction } from "../actions/submit-visit-request.action";

interface VisitRequestFormProps {
  listingId: string;
  agencyId: string;
}

export function VisitRequestForm({ listingId, agencyId }: VisitRequestFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    visitorName: "",
    visitorPhone: "",
    visitorEmail: "",
    message: "",
    requestedDate: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await submitVisitRequestAction({
      listingId,
      agencyId,
      visitorName: form.visitorName,
      visitorPhone: form.visitorPhone,
      visitorEmail: form.visitorEmail || undefined,
      message: form.message || undefined,
      requestedDate: form.requestedDate || undefined,
    });

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error.message);
    }

    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mb-3 flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-6 w-6 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>
        <h3 className="text-base font-semibold text-emerald-800">
          Demande envoyée !
        </h3>
        <p className="mt-1 text-sm text-emerald-700">
          L'agence vous contactera prochainement pour confirmer la visite.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-base font-semibold text-blue-night">
        Demander une visite
      </h3>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Visitor name */}
      <div>
        <label htmlFor="vr-name" className="mb-1 block text-sm font-medium text-gray-700">
          Nom complet <span className="text-red-500">*</span>
        </label>
        <input
          id="vr-name"
          name="visitorName"
          type="text"
          required
          value={form.visitorName}
          onChange={handleChange}
          placeholder="Votre nom"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-night focus:outline-none focus:ring-1 focus:ring-blue-night/20"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="vr-phone" className="mb-1 block text-sm font-medium text-gray-700">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <input
          id="vr-phone"
          name="visitorPhone"
          type="tel"
          required
          value={form.visitorPhone}
          onChange={handleChange}
          placeholder="0555 00 00 00"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-night focus:outline-none focus:ring-1 focus:ring-blue-night/20"
        />
      </div>

      {/* Email (optional) */}
      <div>
        <label htmlFor="vr-email" className="mb-1 block text-sm font-medium text-gray-700">
          Email{" "}
          <span className="text-xs font-normal text-gray-400">(optionnel)</span>
        </label>
        <input
          id="vr-email"
          name="visitorEmail"
          type="email"
          value={form.visitorEmail}
          onChange={handleChange}
          placeholder="votre@email.com"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-night focus:outline-none focus:ring-1 focus:ring-blue-night/20"
        />
      </div>

      {/* Requested date (optional) */}
      <div>
        <label htmlFor="vr-date" className="mb-1 block text-sm font-medium text-gray-700">
          Date souhaitée{" "}
          <span className="text-xs font-normal text-gray-400">(optionnel)</span>
        </label>
        <input
          id="vr-date"
          name="requestedDate"
          type="date"
          value={form.requestedDate}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-night focus:outline-none focus:ring-1 focus:ring-blue-night/20"
        />
      </div>

      {/* Message (optional) */}
      <div>
        <label htmlFor="vr-message" className="mb-1 block text-sm font-medium text-gray-700">
          Message{" "}
          <span className="text-xs font-normal text-gray-400">(optionnel)</span>
        </label>
        <textarea
          id="vr-message"
          name="message"
          rows={3}
          value={form.message}
          onChange={handleChange}
          placeholder="Précisions sur la visite..."
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-night focus:outline-none focus:ring-1 focus:ring-blue-night/20"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-night px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-night/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Envoi en cours..." : "Envoyer la demande"}
      </button>
    </form>
  );
}
