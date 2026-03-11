'use client';

import { useState, useTransition } from 'react';
import { updateProfile } from '@/lib/actions/profile';

interface ProfileFormProps {
  initialValues?: {
    full_name?: string | null;
    phone?: string | null;
    wilaya?: string | null;
    locale?: string | null;
  };
}

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj',
  'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane',
];

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      wilaya: formData.get('wilaya') as string,
      locale: formData.get('locale') as string,
    };

    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-body-sm text-emerald-800">
          Profil mis à jour avec succès.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="mb-1.5 block text-body-sm font-medium text-neutral-700">
          Nom complet
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          maxLength={100}
          defaultValue={initialValues?.full_name ?? ''}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-body-md text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Votre nom complet"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-body-sm font-medium text-neutral-700">
          Téléphone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={20}
          defaultValue={initialValues?.phone ?? ''}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-body-md text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="+213 5XX XX XX XX"
        />
      </div>

      <div>
        <label htmlFor="wilaya" className="mb-1.5 block text-body-sm font-medium text-neutral-700">
          Wilaya
        </label>
        <select
          id="wilaya"
          name="wilaya"
          defaultValue={initialValues?.wilaya ?? ''}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-body-md text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">Sélectionner une wilaya</option>
          {WILAYAS.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="locale" className="mb-1.5 block text-body-sm font-medium text-neutral-700">
          Langue préférée
        </label>
        <select
          id="locale"
          name="locale"
          defaultValue={initialValues?.locale ?? 'fr'}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-body-md text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="fr">Français</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}
