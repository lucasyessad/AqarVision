type CardVariant = "default" | "elevated" | "interactive";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-surface border border-border-default rounded-xl shadow-card",
  elevated:
    "bg-surface border border-border-default rounded-xl shadow-md",
  interactive:
    "bg-surface border border-border-default rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-normal cursor-pointer",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-6",
};

function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
}: CardProps) {
  return (
    <div className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}

export { Card };
export type { CardProps, CardVariant, CardPadding };
