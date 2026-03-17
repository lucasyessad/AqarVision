/**
 * Algeria geographic data — Types
 *
 * 69 wilayas (reform 2025) + 1 541 communes.
 * 4 locales: FR, AR, EN, ES.
 *
 * Sources:
 *   - Structure: github.com/S450R1/algeria-cities-2025
 *   - GPS:       github.com/Mohamed-gp/algeria_69_wilayas
 */

export type Locale = "fr" | "ar" | "en" | "es";

export interface Wilaya {
  /** Two-digit code ("01"–"69") */
  code: string;
  /** Numeric ID (1–69) */
  id: number;
  /** French / Latin name */
  name_fr: string;
  /** Arabic name */
  name_ar: string;
  /** English name */
  name_en: string;
  /** Spanish name */
  name_es: string;
  /** Latitude of capital */
  lat: number | null;
  /** Longitude of capital */
  lng: number | null;
  /** Geographic region (Sahara, Tell, North, etc.) */
  region: string | null;
  /** Phone area code */
  phone_code: string | null;
  /** Postal code prefix */
  postal_code: string | null;
  /** Is coastal wilaya */
  coastal: boolean;
  /** Added in 2025 reform */
  new_2025: boolean;
}

export interface Commune {
  /** Commune ID (1–1541) */
  id: number;
  /** Parent wilaya numeric ID */
  wilaya_id: number;
  /** Parent wilaya two-digit code */
  wilaya_code: string;
  /** French / Latin name */
  name_fr: string;
  /** Arabic name */
  name_ar: string;
  /** English name */
  name_en: string;
  /** Spanish name */
  name_es: string;
}
