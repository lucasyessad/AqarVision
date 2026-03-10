'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { updateAgencyBranding, updateAgencyCoverImage } from '@/lib/actions';
import type { Agency } from '@/types/database';

interface BrandingFormProps {
  agency: Agency;
  isEnterprise: boolean;
}

export function BrandingForm({ agency, isEnterprise }: BrandingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(agency.cover_image_url);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(
      [...formData.entries()].map(([k, v]) => [k, v === '' ? null : v])
    );

    startTransition(async () => {
      const result = await updateAgencyBranding(agency.id, data);
      setMessage(
        result.success
          ? { type: 'success', text: 'Branding mis à jour avec succès' }
          : { type: 'error', text: result.error || 'Erreur' }
      );
    });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locale
    setCoverPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('cover', file);

    startTransition(async () => {
      const result = await updateAgencyCoverImage(agency.id, formData);
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || "Erreur lors de l'upload" });
        setCoverPreview(agency.cover_image_url);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Message */}
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* === Section basique (tous les plans) === */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Informations générales</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nom de l&apos;agence *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={agency.name}
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="slogan" className="mb-1 block text-sm font-medium">
              Slogan
            </label>
            <input
              id="slogan"
              name="slogan"
              type="text"
              defaultValue={agency.slogan || ''}
              maxLength={120}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={agency.description || ''}
            rows={4}
            maxLength={2000}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="primary_color" className="mb-1 block text-sm font-medium">
              Couleur principale
            </label>
            <input
              id="primary_color"
              name="primary_color"
              type="color"
              defaultValue={agency.primary_color}
              className="h-10 w-20 cursor-pointer rounded border"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={agency.email || ''}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Téléphone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={agency.phone || ''}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="website" className="mb-1 block text-sm font-medium">
              Site web
            </label>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={agency.website || ''}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-medium">
              Adresse
            </label>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={agency.address || ''}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="wilaya" className="mb-1 block text-sm font-medium">
              Wilaya
            </label>
            <input
              id="wilaya"
              name="wilaya"
              type="text"
              defaultValue={agency.wilaya || ''}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* === Section Enterprise (luxury) === */}
      {isEnterprise && (
        <div className="space-y-6 rounded-xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✦</span>
            <h2 className="text-lg font-semibold text-amber-900">
              Branding Premium Enterprise
            </h2>
          </div>

          {/* Cover image upload */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Image de couverture
            </label>
            {coverPreview && (
              <div className="relative mb-3 aspect-[21/9] w-full overflow-hidden rounded-lg">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverUpload}
              className="text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">JPEG, PNG ou WebP. Max 10 Mo.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Hero style */}
            <div>
              <label htmlFor="hero_style" className="mb-1 block text-sm font-medium">
                Style du hero
              </label>
              <select
                id="hero_style"
                name="hero_style"
                defaultValue={agency.hero_style}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="color">Couleur unie</option>
                <option value="cover">Image de couverture</option>
                <option value="video">Vidéo</option>
              </select>
            </div>

            {/* Video URL */}
            <div>
              <label htmlFor="hero_video_url" className="mb-1 block text-sm font-medium">
                URL vidéo hero
              </label>
              <input
                id="hero_video_url"
                name="hero_video_url"
                type="url"
                defaultValue={agency.hero_video_url || ''}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label htmlFor="tagline" className="mb-1 block text-sm font-medium">
              Tagline premium
            </label>
            <textarea
              id="tagline"
              name="tagline"
              defaultValue={agency.tagline || ''}
              maxLength={200}
              rows={2}
              placeholder="Un sous-titre élégant pour votre agence..."
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Secondary color */}
            <div>
              <label htmlFor="secondary_color" className="mb-1 block text-sm font-medium">
                Couleur secondaire
              </label>
              <input
                id="secondary_color"
                name="secondary_color"
                type="color"
                defaultValue={agency.secondary_color || '#c9a84c'}
                className="h-10 w-20 cursor-pointer rounded border"
              />
            </div>

            {/* Font style */}
            <div>
              <label htmlFor="font_style" className="mb-1 block text-sm font-medium">
                Typographie
              </label>
              <select
                id="font_style"
                name="font_style"
                defaultValue={agency.font_style}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="modern">Modern (Sans-serif)</option>
                <option value="classic">Classic (Playfair)</option>
                <option value="elegant">Elegant (Cormorant)</option>
              </select>
            </div>

            {/* Theme mode */}
            <div>
              <label htmlFor="theme_mode" className="mb-1 block text-sm font-medium">
                Mode thème
              </label>
              <select
                id="theme_mode"
                name="theme_mode"
                defaultValue={agency.theme_mode}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="dark">Sombre luxe</option>
                <option value="light">Clair</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-amber-800">
              Statistiques affichées
            </h3>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="stats_years" className="mb-1 block text-sm font-medium">
                  Années d&apos;expérience
                </label>
                <input
                  id="stats_years"
                  name="stats_years"
                  type="number"
                  min={0}
                  defaultValue={agency.stats_years ?? ''}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="stats_properties_sold" className="mb-1 block text-sm font-medium">
                  Biens vendus
                </label>
                <input
                  id="stats_properties_sold"
                  name="stats_properties_sold"
                  type="number"
                  min={0}
                  defaultValue={agency.stats_properties_sold ?? ''}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="stats_clients" className="mb-1 block text-sm font-medium">
                  Clients satisfaits
                </label>
                <input
                  id="stats_clients"
                  name="stats_clients"
                  type="number"
                  min={0}
                  defaultValue={agency.stats_clients ?? ''}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview (Enterprise) */}
      {isEnterprise && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Aperçu en direct</h2>
          <div
            className="relative overflow-hidden rounded-xl"
            style={{ minHeight: '280px' }}
          >
            <BrandingPreview agency={agency} coverPreview={coverPreview} />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </form>
  );
}

/** Mini preview of how the luxury hero will look */
function BrandingPreview({
  agency,
  coverPreview,
}: {
  agency: Agency;
  coverPreview: string | null;
}) {
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;

  return (
    <div
      className={`relative flex h-[280px] flex-col items-center justify-center rounded-xl px-6 text-center ${
        isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      {/* Cover background */}
      {coverPreview && (
        <>
          <Image
            src={coverPreview}
            alt="Aperçu couverture"
            fill
            className="rounded-xl object-cover"
          />
          <div
            className={`absolute inset-0 rounded-xl ${
              isDark
                ? 'bg-gradient-to-b from-black/60 via-black/40 to-black/80'
                : 'bg-gradient-to-b from-white/50 via-white/30 to-white/70'
            }`}
          />
        </>
      )}

      <div className="relative z-10">
        {agency.logo_url && (
          <Image
            src={agency.logo_url}
            alt="Logo"
            width={60}
            height={60}
            className="mx-auto mb-4 h-16 w-16 rounded-full object-cover shadow-lg"
          />
        )}
        <h3 className="font-display-classic text-2xl">{agency.name}</h3>
        <div
          className="mx-auto mt-3 h-0.5 w-16"
          style={{ backgroundColor: accentColor }}
        />
        {(agency.tagline || agency.slogan) && (
          <p className="mt-3 text-sm opacity-80">{agency.tagline || agency.slogan}</p>
        )}
      </div>
    </div>
  );
}
