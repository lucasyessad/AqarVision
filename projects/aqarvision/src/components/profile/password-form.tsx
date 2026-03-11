'use client';

import { useState, useTransition } from 'react';
import { changePassword } from '@/lib/actions/profile';

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    startTransition(async () => {
      const result = await changePassword(newPassword);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-body-sm text-emerald-800">
          Mot de passe mis à jour avec succès.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="new_password" className="mb-1.5 block text-body-sm font-medium text-neutral-700">
          Nouveau mot de passe
        </label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-body-md text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Minimum 8 caractères"
        />
      </div>

      <div>
        <label htmlFor="confirm_password" className="mb-1.5 block text-body-sm font-medium text-neutral-700">
          Confirmer le mot de passe
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-body-md text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Répétez le nouveau mot de passe"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? 'Mise à jour...' : 'Changer le mot de passe'}
        </button>
      </div>
    </form>
  );
}
