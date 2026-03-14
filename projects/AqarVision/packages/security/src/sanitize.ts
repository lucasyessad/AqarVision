const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const HTML_ESCAPE_REGEX = /[&<>"'/`]/g;

/**
 * Escape HTML special characters to prevent XSS.
 * Strips all HTML tags and escapes dangerous characters.
 */
export function sanitizeHtml(input: string): string {
  // First strip all HTML tags
  const stripped = input.replace(/<[^>]*>/g, "");
  // Then escape remaining special characters
  return stripped.replace(
    HTML_ESCAPE_REGEX,
    (char) => HTML_ESCAPE_MAP[char] ?? char
  );
}

/**
 * Sanitize user input: trim whitespace, normalize unicode,
 * remove null bytes, and escape HTML.
 */
export function sanitizeInput(input: string): string {
  const cleaned = input
    // Remove null bytes
    .replace(/\0/g, "")
    // Normalize unicode
    .normalize("NFC")
    // Trim whitespace
    .trim()
    // Collapse multiple spaces into one
    .replace(/\s+/g, " ");

  return sanitizeHtml(cleaned);
}

/**
 * Sanitize input for use in SQL LIKE patterns.
 * Escapes %, _, and \ characters.
 */
export function sanitizeLikePattern(input: string): string {
  return sanitizeInput(input)
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}
