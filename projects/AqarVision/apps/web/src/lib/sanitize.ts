/**
 * Sanitize user input: remove null bytes, normalize unicode,
 * trim whitespace, collapse multiple spaces, and escape HTML.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/\0/g, "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
