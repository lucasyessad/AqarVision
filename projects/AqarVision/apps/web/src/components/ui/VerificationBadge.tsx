import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VerificationBadgeProps {
  level: 1 | 2 | 3 | 4;
  size?: "sm" | "md";
  className?: string;
}

const levelConfig = {
  1: {
    bg: "bg-stone-100 dark:bg-stone-800",
    text: "text-stone-600 dark:text-stone-400",
    icon: "text-stone-500 dark:text-stone-400",
    label: "Basique",
    description: "Inscription compl\u00e8te, email v\u00e9rifi\u00e9",
  },
  2: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-400",
    label: "V\u00e9rifi\u00e9",
    description: "Registre de commerce valid\u00e9",
  },
  3: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-400",
    icon: "text-green-600 dark:text-green-400",
    label: "Certifi\u00e9",
    description: "RC + NIF + adresse v\u00e9rifi\u00e9e",
  },
  4: {
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-400",
    icon: "text-amber-600 dark:text-amber-400",
    label: "Premium",
    description: "Certifi\u00e9 + anciennet\u00e9 + z\u00e9ro plainte",
  },
} as const;

const sizeConfig = {
  sm: { badge: "px-1.5 py-0.5 text-2xs gap-0.5", icon: 10 },
  md: { badge: "px-2 py-1 text-xs gap-1", icon: 14 },
} as const;

export function VerificationBadge({
  level,
  size = "md",
  className,
}: VerificationBadgeProps) {
  const config = levelConfig[level];
  const sizes = sizeConfig[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        config.bg,
        config.text,
        sizes.badge,
        className
      )}
      title={`${config.label} \u2014 ${config.description}`}
    >
      <ShieldCheck
        size={sizes.icon}
        className={config.icon}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
