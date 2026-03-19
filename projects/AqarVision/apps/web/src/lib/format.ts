import type { Locale } from "@/lib/i18n/routing";

const currencyFormatters: Record<string, Intl.NumberFormat> = {};

function getCurrencyFormatter(
  locale: string,
  currency: string
): Intl.NumberFormat {
  const key = `${locale}-${currency}`;
  if (!currencyFormatters[key]) {
    currencyFormatters[key] = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  }
  return currencyFormatters[key]!;
}

export function formatPrice(
  amount: number,
  currency: string = "DZD",
  locale: Locale = "fr"
): string {
  const localeMap: Record<Locale, string> = {
    fr: "fr-DZ",
    ar: "ar-DZ",
    en: "en-DZ",
    es: "es-ES",
  };
  return getCurrencyFormatter(localeMap[locale], currency).format(amount);
}

export function formatArea(m2: number, locale: Locale = "fr"): string {
  return `${new Intl.NumberFormat(locale).format(m2)} m²`;
}

export function formatRelativeDate(
  date: Date,
  locale: Locale = "fr"
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffDays === 0) return rtf.format(0, "day");
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), "week");
  if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), "month");
  return rtf.format(-Math.floor(diffDays / 365), "year");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
