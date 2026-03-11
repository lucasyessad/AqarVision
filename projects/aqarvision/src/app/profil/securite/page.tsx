import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PasswordForm } from '@/components/profile/password-form';

export const metadata: Metadata = {
  title: 'Sécurité — AqarVision',
  description: 'Gérez la sécurité de votre compte.',
};

export default async function SecuritePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/profil/securite');
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <nav className="mb-1 flex items-center gap-2 text-caption text-neutral-400">
            <Link href="/" className="hover:text-neutral-600 transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/profil" className="hover:text-neutral-600 transition-colors">Mon profil</Link>
            <span>/</span>
            <span className="text-neutral-600">Sécurité</span>
          </nav>
          <h1 className="text-heading-lg text-neutral-900">Sécurité du compte</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Change password */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-1.5 text-heading-sm text-neutral-900">Changer le mot de passe</h2>
          <p className="mb-5 text-body-sm text-neutral-500">
            Choisissez un mot de passe fort de 8 caractères minimum.
          </p>
          <PasswordForm />
        </div>

        {/* Delete account */}
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <ShieldAlert className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-heading-sm text-red-700">Supprimer le compte</h2>
              <p className="mt-1.5 text-body-sm text-neutral-600">
                La suppression de votre compte est une action irréversible. Toutes vos données
                (favoris, alertes, historique) seront définitivement effacées.
              </p>
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-body-sm text-amber-800">
                  Pour supprimer définitivement votre compte, veuillez contacter notre support à{' '}
                  <a
                    href="mailto:support@aqarvision.dz"
                    className="font-medium underline underline-offset-2 hover:text-amber-900"
                  >
                    support@aqarvision.dz
                  </a>{' '}
                  en indiquant votre adresse email{' '}
                  <span className="font-medium">{user.email}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
