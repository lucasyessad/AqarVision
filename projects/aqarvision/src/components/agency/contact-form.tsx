'use client';

import { useState, useTransition } from 'react';
import { createLead } from '@/lib/actions/leads';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';
import { PLANS } from '@/config';

interface ContactFormProps {
  agency: Agency;
  propertyId?: string;
}

export function ContactForm({ agency, propertyId }: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const t = getTranslations(agency.locale ?? 'fr');
  const isDark = agency.theme_mode === 'dark';
  const isEnterprise = agency.active_plan === PLANS.ENTERPRISE;
  const accentColor = agency.secondary_color || agency.primary_color;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      agency_id: agency.id,
      property_id: propertyId || null,
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email') || null,
      message: formData.get('message') || null,
      source: propertyId ? 'property_detail' : 'contact_form',
    };

    startTransition(async () => {
      const result = await createLead(data);
      if (result.success) {
        setMessage({ type: 'success', text: t('form.success') });
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage({ type: 'error', text: result.error || t('form.error') });
      }
    });
  }

  const inputClass = isEnterprise && isDark
    ? 'w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20'
    : 'w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  const labelClass = isEnterprise && isDark
    ? 'mb-1 block text-sm font-medium text-gray-300'
    : 'mb-1 block text-sm font-medium text-gray-700';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? isEnterprise && isDark
                ? 'border border-green-500/20 bg-green-500/10 text-green-300'
                : 'border border-green-200 bg-green-50 text-green-800'
              : isEnterprise && isDark
                ? 'border border-red-500/20 bg-red-500/10 text-red-300'
                : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className={labelClass}>
            {t('form.name')} *
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            required
            minLength={2}
            placeholder={t('form.namePlaceholder')}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lead-phone" className={labelClass}>
            {t('form.phone')} *
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            required
            minLength={9}
            placeholder={t('form.phonePlaceholder')}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="lead-email" className={labelClass}>
          {t('form.email')}
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          placeholder={t('form.emailPlaceholder')}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="lead-message" className={labelClass}>
          {t('form.message')}
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder={t('form.messagePlaceholder')}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full rounded-lg px-8 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
          isEnterprise ? 'hover:opacity-90' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        style={isEnterprise ? { backgroundColor: accentColor } : undefined}
      >
        {isPending ? t('form.sending') : t('form.submit')}
      </button>
    </form>
  );
}
