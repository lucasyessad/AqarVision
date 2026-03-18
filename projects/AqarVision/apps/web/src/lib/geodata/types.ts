export interface Wilaya {
  code: string;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
}

export interface Commune {
  id: number;
  wilaya_code: string;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
}
