'use client';

import { Phone, Mail, MessageCircle } from 'lucide-react';
import { useState, useTransition, type FormEvent } from 'react';
import { createLead } from '@/lib/actions/leads';
import { MESSAGES } from '@/config';

interface ContactPanelProps {
  agencyId: string;
  agencyName: string;
  agencyPhone: string | null;
  agencyEmail: string | null;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: string;
}

export function ContactPanel({
  agencyId,
  agencyName,
  agencyPhone,
  agencyEmail,
  propertyId,
  propertyTitle,
  propertyPrice,
}: ContactPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappMessage = MESSAGES.whatsappProperty(agencyName, propertyTitle, propertyPrice);
  const whatsappUrl = agencyPhone
    ? `https://wa.me/${agencyPhone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('agency_id', agencyId);
    formData.set('property_id', propertyId);
    formData.set('source', 'aqarsearch');

    startTransition(async () => {
      const data: Record<string, unknown> = Object.fromEntries(formData);
      const result = await createLead(data);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Erreur lors de l\'envoi.');
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">Message envoyé avec succès !</p>
        <p className="mt-1 text-sm text-green-600">L&apos;agence vous recontactera rapidement.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Contacter {agencyName}</h3>

      {/* Quick actions */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        {agencyPhone && (
          <a
            href={`tel:${agencyPhone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Phone className="h-4 w-4" />
            Appeler
          </a>
        )}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        {agencyEmail && (
          <a
            href={`mailto:${agencyEmail}?subject=${encodeURIComponent(`Demande: ${propertyTitle}`)}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
        )}
      </div>

      {/* Contact form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name"
          type="text"
          required
          minLength={2}
          placeholder="Votre nom"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="phone"
          type="tel"
          required
          minLength={9}
          placeholder="0555 XX XX XX"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="email"
          type="email"
          placeholder="votre@email.com (optionnel)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <textarea
          name="message"
          rows={3}
          maxLength={2000}
          placeholder="Votre message..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 ${isPending ? 'opacity-50' : ''}`}
        >
          {isPending ? 'Envoi...' : 'Envoyer le message'}
        </button>
      </form>
    </div>
  );
}
