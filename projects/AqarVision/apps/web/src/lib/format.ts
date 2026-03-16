/**
 * Format a price for display in French-DZ locale.
 */
export function formatPrice(price: number, currency: string = "DZD"): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
