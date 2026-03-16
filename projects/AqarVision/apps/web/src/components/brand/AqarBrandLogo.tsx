import { Link } from "@/lib/i18n/navigation";

type Product = "Vision" | "Pro" | "Chaab" | "Search";

interface AqarBrandLogoProps {
  product: Product;
  /** "sm" = text-base, "md" = text-xl (default), "lg" = text-2xl */
  size?: "sm" | "md" | "lg";
  /** Light text on dark bg (default true) */
  onDark?: boolean;
  /** Wrap in a link to homepage */
  href?: string;
  locale?: string;
  className?: string;
}

const SIZE: Record<string, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

const DOT_SIZE: Record<string, string> = {
  sm: "h-1 w-1",
  md: "h-1.5 w-1.5",
  lg: "h-2 w-2",
};

// Dot color per product — Tailwind classes
const DOT_COLOR: Record<Product, string> = {
  Vision: "bg-amber-300 dark:bg-amber-400",
  Pro:    "bg-amber-500 dark:bg-amber-400",
  Chaab:  "bg-amber-300 dark:bg-amber-400",
  Search: "bg-amber-300 dark:bg-amber-400",
};

export function AqarBrandLogo({
  product,
  size = "md",
  onDark = true,
  href,
  locale,
  className = "",
}: AqarBrandLogoProps) {
  const textClass = onDark
    ? "text-zinc-50 dark:text-zinc-50"
    : "text-zinc-950 dark:text-zinc-50";

  const inner = (
    <span
      className={`inline-flex items-center gap-[0.2em] font-display tracking-tight ${SIZE[size]} ${className}`}
    >
      <span className={`font-light ${textClass}`}>Aqar</span>
      <span
        className={`inline-block shrink-0 rounded-full mb-px ${DOT_SIZE[size]} ${DOT_COLOR[product]}`}
      />
      <span className={`${textClass} ${product === "Vision" ? "font-semibold" : "font-medium"}`}>
        {product}
      </span>
    </span>
  );

  if (href !== undefined) {
    return (
      <Link href={href as "/"} locale={locale} className="inline-flex">
        {inner}
      </Link>
    );
  }

  return inner;
}
