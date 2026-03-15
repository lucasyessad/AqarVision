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

// Dot color per product
const DOT_COLOR: Record<Product, string> = {
  Vision: "#B8A88A",
  Pro:    "#d4af37",
  Chaab:  "#B8A88A",
  Search: "#B8A88A",
};

export function AqarBrandLogo({
  product,
  size = "md",
  onDark = true,
  href,
  locale,
  className = "",
}: AqarBrandLogoProps) {
  const textColor = onDark ? "var(--ivoire)" : "var(--onyx)";

  const inner = (
    <span
      className={`inline-flex items-center gap-[0.2em] ${SIZE[size]} ${className}`}
      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
    >
      <span style={{ color: textColor, fontWeight: 300 }}>Aqar</span>
      <span
        className={`inline-block shrink-0 rounded-full ${DOT_SIZE[size]}`}
        style={{ background: DOT_COLOR[product], marginBottom: "1px" }}
      />
      <span style={{ color: textColor, fontWeight: product === "Vision" ? 600 : 500 }}>
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
