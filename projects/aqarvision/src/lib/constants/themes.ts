import type { AgencyTheme, FontStyle, ThemeMode, BorderStyle } from '@/types/database';

export interface ThemePreset {
  label: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_style: FontStyle;
  theme_mode: ThemeMode;
  border_style: BorderStyle;
  preview: { bg: string; text: string; accent: string };
}

export const THEMES: Record<Exclude<AgencyTheme, 'custom'>, ThemePreset> = {
  minimal: {
    label: 'Minimal',
    description: 'Ultra-simple et aéré',
    primary_color: '#18181b',
    secondary_color: '#fafafa',
    accent_color: '#18181b',
    font_style: 'modern',
    theme_mode: 'light',
    border_style: 'square',
    preview: { bg: '#ffffff', text: '#18181b', accent: '#71717a' },
  },
  modern: {
    label: 'Moderne',
    description: 'Épuré et contemporain',
    primary_color: '#111827',
    secondary_color: '#f3f4f6',
    accent_color: '#6366f1',
    font_style: 'modern',
    theme_mode: 'light',
    border_style: 'rounded',
    preview: { bg: '#f9fafb', text: '#111827', accent: '#6366f1' },
  },
  professional: {
    label: 'Professionnel',
    description: 'Institutionnel et crédible',
    primary_color: '#0c1b2a',
    secondary_color: '#e2e8f0',
    accent_color: '#2563eb',
    font_style: 'classic',
    theme_mode: 'light',
    border_style: 'rounded',
    preview: { bg: '#ffffff', text: '#0c1b2a', accent: '#2563eb' },
  },
  editorial: {
    label: 'Éditorial',
    description: 'Magazine immobilier élégant',
    primary_color: '#1a1a2e',
    secondary_color: '#f5f3ff',
    accent_color: '#c084fc',
    font_style: 'elegant',
    theme_mode: 'light',
    border_style: 'rounded',
    preview: { bg: '#faf5ff', text: '#1a1a2e', accent: '#c084fc' },
  },
  premium: {
    label: 'Premium',
    description: 'Haut de gamme sobre',
    primary_color: '#1b4332',
    secondary_color: '#d8f3dc',
    accent_color: '#52b788',
    font_style: 'elegant',
    theme_mode: 'light',
    border_style: 'rounded',
    preview: { bg: '#f0fdf4', text: '#1b4332', accent: '#52b788' },
  },
  luxury: {
    label: 'Luxe',
    description: 'Élégant et prestigieux',
    primary_color: '#1a1a2e',
    secondary_color: '#d4af37',
    accent_color: '#d4af37',
    font_style: 'elegant',
    theme_mode: 'dark',
    border_style: 'square',
    preview: { bg: '#1a1a2e', text: '#ffffff', accent: '#d4af37' },
  },
  bold: {
    label: 'Audacieux',
    description: 'Couleurs vives et impactant',
    primary_color: '#7c3aed',
    secondary_color: '#fef3c7',
    accent_color: '#f59e0b',
    font_style: 'modern',
    theme_mode: 'light',
    border_style: 'rounded',
    preview: { bg: '#faf5ff', text: '#7c3aed', accent: '#f59e0b' },
  },
} as const;

export type ThemeKey = keyof typeof THEMES;

/** Liste des 58 wilayas algériennes */
export const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj',
  'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal',
  'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet',
  'El M\'Ghair', 'El Meniaa',
] as const;
