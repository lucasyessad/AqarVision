import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { User, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { getProfile } from '@/lib/actions/profile';
import { ProfileForm } from '@/components/profile/profile-form';

export const metadata: Metadata = {
  title: 'Mon profil — AqarVision',
  description: 'Gérez vos informations personnelles.',
};

export default async function ProfilPage() {
  const { profile, user, error } = await getProfile();

  if (!user) {
    redirect('/login?redirectTo=/profil');
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <nav className="mb-1 flex items-center gap-2 text-caption text-neutral-400">
            <Link href="/" className="hover:text-neutral-600 transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-neutral-600">Mon profil</span>
          </nav>
          <h1 className="text-heading-lg text-neutral-900">Mon profil</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Profile overview card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-primary-100">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name ?? 'Avatar'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-8 w-8 text-primary-400" />
                </div>
              )}
            </div>

            {/* Info summary */}
            <div className="min-w-0 flex-1">
              <h2 className="text-heading-sm text-neutral-900 truncate">
                {profile?.full_name ?? 'Utilisateur'}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5 text-body-sm text-neutral-500">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1.5 text-body-sm text-neutral-500">
                    <Phone className="h-3.5 w-3.5" />
                    {profile.phone}
                  </span>
                )}
                {profile?.wilaya && (
                  <span className="flex items-center gap-1.5 text-body-sm text-neutral-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.wilaya}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-5 text-heading-sm text-neutral-900">Informations personnelles</h2>
          <ProfileForm
            initialValues={{
              full_name: profile?.full_name,
              phone: profile?.phone,
              wilaya: profile?.wilaya,
              locale: profile?.locale,
            }}
          />
        </div>

        {/* Security link */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                <Shield className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-body-md font-medium text-neutral-900">Sécurité du compte</p>
                <p className="text-body-sm text-neutral-500">Gérez votre mot de passe et la sécurité</p>
              </div>
            </div>
            <Link
              href="/profil/securite"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-body-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Gérer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
