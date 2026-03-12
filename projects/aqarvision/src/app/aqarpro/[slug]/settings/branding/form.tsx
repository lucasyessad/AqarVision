'use client';

import { useState, useTransition, useCallback } from 'react';
import Image from 'next/image';
import {
  updateAgencyBranding,
  updateAgencyCoverImage,
  updateAgencyLogo,
  updateAgencyWilayas,
} from '@/lib/actions';
import { THEMES, WILAYAS, type ThemeKey } from '@/lib/constants';
import { THEME_REGISTRY, type ThemeId } from '@/lib/themes/registry';
import { ThemePicker } from '@/components/dashboard/theme-picker';
import type { Agency, AgencyWilaya, AgencyTheme, AgencyPlan } from '@/types/database';
import {
  Palette,
  Building2,
  Sliders,
  MapPin,
  Map,
  Crown,
  Plus,
  Trash2,
  Check,
  Star,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface BrandingFormProps {
  agency: Agency;
  isEnterprise: boolean;
  initialWilayas: AgencyWilaya[];
}

interface WilayaEntry {
  wilaya: string;
  address: string;
  is_headquarters: boolean;
}

// ─── Section wrapper ────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white p-6 ${className}`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
          <Icon className="h-4.5 w-4.5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-body-sm font-semibold text-neutral-900">{title}</h2>
          <p className="text-caption text-neutral-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Input helpers ──────────────────────────────────────────────────

function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-caption font-medium text-neutral-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-caption text-neutral-400">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-body-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400/30';

const selectClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-body-sm text-neutral-900 transition-colors hover:border-neutral-300 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400/30';

// ─── Main Form ──────────────────────────────────────────────────────

export function BrandingForm({ agency, isEnterprise, initialWilayas }: BrandingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(agency.cover_image_url);
  const [logoPreview, setLogoPreview] = useState<string | null>(agency.logo_url);

  // Theme state
  const [selectedTheme, setSelectedTheme] = useState<AgencyTheme>(agency.theme || 'modern');
  const [primaryColor, setPrimaryColor] = useState(agency.primary_color);
  const [accentColor, setAccentColor] = useState(agency.accent_color || '');
  const [borderStyle, setBorderStyle] = useState(agency.border_style || 'rounded');

  // Multi-wilayas state
  const [wilayas, setWilayas] = useState<WilayaEntry[]>(
    initialWilayas.length > 0
      ? initialWilayas.map((w) => ({
          wilaya: w.wilaya,
          address: w.address || '',
          is_headquarters: w.is_headquarters,
        }))
      : agency.wilaya
        ? [{ wilaya: agency.wilaya, address: agency.address || '', is_headquarters: true }]
        : []
  );

  // Apply theme preset
  const handleThemeSelect = useCallback(
    (key: AgencyTheme) => {
      setSelectedTheme(key);
      // Apply color preset from constants
      if (key !== 'custom' && key in THEMES) {
        const preset = THEMES[key as ThemeKey];
        setPrimaryColor(preset.primary_color);
        setAccentColor(preset.accent_color);
        setBorderStyle(preset.border_style);
      }
    },
    []
  );

  // Wilayas management
  const addWilaya = () => {
    setWilayas((prev) => [...prev, { wilaya: '', address: '', is_headquarters: false }]);
  };

  const removeWilaya = (index: number) => {
    setWilayas((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWilaya = (index: number, field: keyof WilayaEntry, value: string | boolean) => {
    setWilayas((prev) =>
      prev.map((w, i) => {
        if (i !== index) {
          if (field === 'is_headquarters' && value === true) {
            return { ...w, is_headquarters: false };
          }
          return w;
        }
        return { ...w, [field]: value };
      })
    );
  };

  // Form submit
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(
      [...formData.entries()]
        .filter(([k]) => !['__proto__', 'constructor', 'prototype'].includes(k))
        .map(([k, v]) => [k, v === '' ? null : v])
    );

    // Add state-managed fields
    data.theme = selectedTheme;
    data.primary_color = primaryColor;
    data.accent_color = accentColor || null;
    data.border_style = borderStyle;

    startTransition(async () => {
      // Save branding
      const result = await updateAgencyBranding(agency.id, data);
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Erreur' });
        return;
      }

      // Save wilayas if any
      if (wilayas.length > 0 && wilayas.some((w) => w.wilaya)) {
        const validWilayas = wilayas.filter((w) => w.wilaya);
        const wilayaResult = await updateAgencyWilayas(agency.id, validWilayas);
        if (!wilayaResult.success) {
          setMessage({ type: 'error', text: wilayaResult.error || 'Erreur wilayas' });
          return;
        }
      }

      setMessage({ type: 'success', text: 'Branding mis à jour avec succès' });
    });
  }

  // File uploads
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('logo', file);
    startTransition(async () => {
      const result = await updateAgencyLogo(agency.id, formData);
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || "Erreur lors de l'upload du logo" });
        setLogoPreview(agency.logo_url);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      {/* Left: Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message */}
        {message && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-body-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' && <Check className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        {/* ── Section 1: Theme Picker ── */}
        <Section
          icon={Palette}
          title="Thème de votre vitrine"
          description="Choisissez un template structurel pour votre site"
        >
          <ThemePicker
            selectedTheme={selectedTheme}
            agencyPlan={(agency.active_plan || 'starter') as AgencyPlan}
            onSelect={handleThemeSelect}
          />
        </Section>

        {/* ── Section 2: Identity ── */}
        <Section
          icon={Building2}
          title="Identité"
          description="Informations générales de votre agence"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nom de l'agence *" htmlFor="name">
                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={agency.name}
                  required
                  className={inputClass}
                />
              </FormField>
              <FormField label="Slogan" htmlFor="slogan" hint="Max 120 caractères">
                <input
                  id="slogan"
                  name="slogan"
                  type="text"
                  defaultValue={agency.slogan || ''}
                  maxLength={120}
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Description" htmlFor="description">
              <textarea
                id="description"
                name="description"
                defaultValue={agency.description || ''}
                rows={4}
                maxLength={2000}
                className={inputClass}
              />
            </FormField>

            {/* Logo upload */}
            <div>
              <label className="mb-1.5 block text-caption font-medium text-neutral-700">
                Logo de l&apos;agence
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-neutral-200">
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
                    <Building2 className="h-5 w-5 text-neutral-400" />
                  </div>
                )}
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-caption font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                    Changer le logo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-caption text-neutral-400">JPEG, PNG ou WebP. Max 5 Mo.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Langue du site" htmlFor="locale">
                <select
                  id="locale"
                  name="locale"
                  defaultValue={agency.locale ?? 'fr'}
                  className={selectClass}
                >
                  <option value="fr">Fran&ccedil;ais</option>
                  <option value="ar">العربية (Arabe)</option>
                  <option value="en">English</option>
                </select>
              </FormField>
              <FormField label="Registre de commerce" htmlFor="registre_commerce">
                <input
                  id="registre_commerce"
                  name="registre_commerce"
                  type="text"
                  defaultValue={agency.registre_commerce || ''}
                  className={inputClass}
                />
              </FormField>
            </div>
          </div>
        </Section>

        {/* ── Section 3: Customization ── */}
        <Section
          icon={Sliders}
          title="Personnalisation"
          description="Couleurs et style de votre vitrine"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Couleur principale">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-neutral-200"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className={`${inputClass} w-28 font-mono text-caption`}
                    pattern="^#[0-9a-fA-F]{6}$"
                  />
                </div>
              </FormField>

              <FormField label="Couleur d'accent">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor || primaryColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-neutral-200"
                  />
                  <input
                    type="text"
                    value={accentColor || ''}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="Auto"
                    className={`${inputClass} w-28 font-mono text-caption`}
                  />
                </div>
              </FormField>

              <FormField label="Style des bordures">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBorderStyle('rounded')}
                    className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 text-caption font-medium transition-colors ${
                      borderStyle === 'rounded'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <div className="h-4 w-4 rounded-md border-2 border-current" />
                    Arrondi
                  </button>
                  <button
                    type="button"
                    onClick={() => setBorderStyle('square')}
                    className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 text-caption font-medium transition-colors ${
                      borderStyle === 'square'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <div className="h-4 w-4 border-2 border-current" />
                    Droit
                  </button>
                </div>
              </FormField>
            </div>
          </div>
        </Section>

        {/* ── Section 4: Coordinates ── */}
        <Section
          icon={MapPin}
          title="Coordonnées"
          description="Vos informations de contact"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Téléphone" htmlFor="phone">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  defaultValue={agency.phone || ''}
                  placeholder="+213 XX XX XX XX"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Email" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={agency.email || ''}
                  className={inputClass}
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Site web" htmlFor="website">
                <input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={agency.website || ''}
                  placeholder="https://..."
                  className={inputClass}
                />
              </FormField>
              <FormField label="Adresse" htmlFor="address">
                <input
                  id="address"
                  name="address"
                  type="text"
                  defaultValue={agency.address || ''}
                  className={inputClass}
                />
              </FormField>
            </div>
            {/* Keep wilaya as hidden field for backward compat — managed by multi-wilayas */}
            <input type="hidden" name="wilaya" value={wilayas.find((w) => w.is_headquarters)?.wilaya || wilayas[0]?.wilaya || agency.wilaya || ''} />
          </div>
        </Section>

        {/* ── Section 5: Multi-Wilayas ── */}
        <Section
          icon={Map}
          title="Zones de couverture"
          description="Les wilayas où votre agence est présente"
        >
          <div className="space-y-3">
            {wilayas.map((entry, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  entry.is_headquarters
                    ? 'border-primary-200 bg-primary-50/50'
                    : 'border-neutral-200'
                }`}
              >
                <div className="flex-1 grid gap-3 sm:grid-cols-2">
                  <select
                    value={entry.wilaya}
                    onChange={(e) => updateWilaya(index, 'wilaya', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Sélectionner une wilaya</option>
                    {WILAYAS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={entry.address}
                    onChange={(e) => updateWilaya(index, 'address', e.target.value)}
                    placeholder="Adresse locale (optionnel)"
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1.5">
                  <button
                    type="button"
                    title={entry.is_headquarters ? 'Siège principal' : 'Définir comme siège'}
                    onClick={() => updateWilaya(index, 'is_headquarters', true)}
                    className={`rounded-md p-1.5 transition-colors ${
                      entry.is_headquarters
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-neutral-400 hover:text-primary-500'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${entry.is_headquarters ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    type="button"
                    title="Supprimer"
                    onClick={() => removeWilaya(index)}
                    className="rounded-md p-1.5 text-neutral-400 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addWilaya}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 py-2.5 text-caption font-medium text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600"
            >
              <Plus className="h-4 w-4" />
              Ajouter une wilaya
            </button>
          </div>
        </Section>

        {/* ── Section 6: Enterprise Premium ── */}
        {isEnterprise && (
          <Section
            icon={Crown}
            title="Branding Premium Enterprise"
            description="Options exclusives du plan Enterprise"
            className="border-accent-400/30 bg-gradient-to-br from-accent-400/5 to-white"
          >
            <div className="space-y-5">
              {/* Cover image upload */}
              <div>
                <label className="mb-1.5 block text-caption font-medium text-neutral-700">
                  Image de couverture
                </label>
                {coverPreview && (
                  <div className="relative mb-3 aspect-[21/9] w-full overflow-hidden rounded-lg border border-neutral-200">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-caption font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                  Changer l&apos;image de couverture
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-caption text-neutral-400">JPEG, PNG ou WebP. Max 10 Mo.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Style du hero" htmlFor="hero_style">
                  <select
                    id="hero_style"
                    name="hero_style"
                    defaultValue={agency.hero_style}
                    className={selectClass}
                  >
                    <option value="color">Couleur unie</option>
                    <option value="cover">Image de couverture</option>
                    <option value="video">Vidéo</option>
                  </select>
                </FormField>
                <FormField label="URL vidéo hero" htmlFor="hero_video_url">
                  <input
                    id="hero_video_url"
                    name="hero_video_url"
                    type="url"
                    defaultValue={agency.hero_video_url || ''}
                    placeholder="https://youtube.com/watch?v=..."
                    className={inputClass}
                  />
                </FormField>
              </div>

              <FormField label="Tagline premium" htmlFor="tagline" hint="Max 200 caractères">
                <textarea
                  id="tagline"
                  name="tagline"
                  defaultValue={agency.tagline || ''}
                  maxLength={200}
                  rows={2}
                  placeholder="Un sous-titre élégant pour votre agence..."
                  className={inputClass}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Couleur secondaire">
                  <div className="flex items-center gap-3">
                    <input
                      name="secondary_color"
                      type="color"
                      defaultValue={agency.secondary_color || '#c9a84c'}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-neutral-200"
                    />
                  </div>
                </FormField>
                <FormField label="Typographie" htmlFor="font_style">
                  <select
                    id="font_style"
                    name="font_style"
                    defaultValue={agency.font_style}
                    className={selectClass}
                  >
                    <option value="modern">Modern (Sans-serif)</option>
                    <option value="classic">Classic (Playfair)</option>
                    <option value="elegant">Elegant (Cormorant)</option>
                  </select>
                </FormField>
                <FormField label="Mode thème" htmlFor="theme_mode">
                  <select
                    id="theme_mode"
                    name="theme_mode"
                    defaultValue={agency.theme_mode}
                    className={selectClass}
                  >
                    <option value="dark">Sombre luxe</option>
                    <option value="light">Clair</option>
                  </select>
                </FormField>
              </div>

              {/* Stats */}
              <div>
                <h3 className="mb-3 text-caption font-semibold text-accent-600">
                  Statistiques affichées
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField label="Années d'expérience" htmlFor="stats_years">
                    <input
                      id="stats_years"
                      name="stats_years"
                      type="number"
                      min={0}
                      defaultValue={agency.stats_years ?? ''}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Biens vendus" htmlFor="stats_properties_sold">
                    <input
                      id="stats_properties_sold"
                      name="stats_properties_sold"
                      type="number"
                      min={0}
                      defaultValue={agency.stats_properties_sold ?? ''}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Clients satisfaits" htmlFor="stats_clients">
                    <input
                      id="stats_clients"
                      name="stats_clients"
                      type="number"
                      min={0}
                      defaultValue={agency.stats_clients ?? ''}
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>

              {/* Social URLs */}
              <div>
                <h3 className="mb-3 text-caption font-semibold text-accent-600">
                  Réseaux sociaux
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField label="Instagram" htmlFor="instagram_url">
                    <input
                      id="instagram_url"
                      name="instagram_url"
                      type="url"
                      defaultValue={agency.instagram_url || ''}
                      placeholder="https://instagram.com/..."
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Facebook" htmlFor="facebook_url">
                    <input
                      id="facebook_url"
                      name="facebook_url"
                      type="url"
                      defaultValue={agency.facebook_url || ''}
                      placeholder="https://facebook.com/..."
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="TikTok" htmlFor="tiktok_url">
                    <input
                      id="tiktok_url"
                      name="tiktok_url"
                      type="url"
                      defaultValue={agency.tiktok_url || ''}
                      placeholder="https://tiktok.com/@..."
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary-600 px-8 py-3 text-body-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>

      {/* Right: Live Preview */}
      <div className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <h3 className="text-caption font-semibold text-neutral-500 uppercase tracking-wider">
            Aperçu en direct
          </h3>
          <BrandingPreview
            agency={agency}
            coverPreview={coverPreview}
            logoPreview={logoPreview}
            primaryColor={primaryColor}
            accentColor={accentColor || primaryColor}
            borderStyle={borderStyle}
            themeName={selectedTheme}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Live Preview ───────────────────────────────────────────────────

function BrandingPreview({
  agency,
  coverPreview,
  logoPreview,
  primaryColor,
  accentColor,
  borderStyle,
  themeName,
}: {
  agency: Agency;
  coverPreview: string | null;
  logoPreview: string | null;
  primaryColor: string;
  accentColor: string;
  borderStyle: string;
  themeName: AgencyTheme;
}) {
  const cardRadius = borderStyle === 'rounded' ? '0.75rem' : '0';
  const smallRadius = borderStyle === 'rounded' ? '6px' : '0';
  const badgeRadius = borderStyle === 'rounded' ? '4px' : '0';

  return (
    <div
      className="overflow-hidden border border-neutral-200 bg-white"
      style={{ borderRadius: cardRadius }}
    >
      {/* Mini hero */}
      <div
        className="relative flex flex-col items-center justify-center px-4 py-10 text-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {coverPreview && (
          <>
            <Image
              src={coverPreview}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}
        <div className="relative z-10">
          {logoPreview && (
            <Image
              src={logoPreview}
              alt=""
              width={40}
              height={40}
              className="mx-auto mb-3 object-cover"
              style={{ borderRadius: smallRadius }}
              unoptimized
            />
          )}
          <p className="text-body-sm font-bold">{agency.name}</p>
          {agency.slogan && (
            <p className="mt-1 text-caption text-white/70">{agency.slogan}</p>
          )}
        </div>
      </div>

      {/* Mini property card */}
      <div className="p-3">
        <div
          className="border border-neutral-200 overflow-hidden"
          style={{ borderRadius: cardRadius }}
        >
          <div className="h-20 bg-neutral-100 relative">
            <span
              className="absolute top-2 left-2 px-1.5 py-0.5 text-white text-[10px] font-semibold"
              style={{ backgroundColor: accentColor, borderRadius: badgeRadius }}
            >
              VENTE
            </span>
          </div>
          <div className="p-2.5">
            <p className="text-caption font-semibold text-neutral-900">Appartement F3</p>
            <p className="text-[10px] text-neutral-400">Alger, Bab Ezzouar</p>
            <p className="mt-1 text-caption font-bold" style={{ color: accentColor }}>
              12 500 000 DA
            </p>
          </div>
        </div>
      </div>

      {/* Mini CTA */}
      <div className="px-3 pb-3">
        <div
          className="py-2 text-center text-[10px] font-semibold text-white"
          style={{ backgroundColor: accentColor, borderRadius: smallRadius }}
        >
          Contacter l&apos;agence
        </div>
      </div>

      {/* Theme label */}
      <div className="border-t border-neutral-100 px-3 py-2 text-center">
        <p className="text-[10px] text-neutral-400">
          Thème : {themeName === 'custom' ? 'Personnalisé' : (THEME_REGISTRY[themeName as ThemeId]?.name.fr || THEMES[themeName as ThemeKey]?.label || themeName)}
        </p>
      </div>
    </div>
  );
}
