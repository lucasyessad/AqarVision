import { cn } from "@/lib/utils";

interface AqarBrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
} as const;

export function AqarBrandLogo({
  size = "md",
  className,
}: AqarBrandLogoProps) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight",
        sizeMap[size],
        className
      )}
    >
      <span className="text-teal-600 dark:text-teal-400">Aqar</span>
      <span className="text-stone-950 dark:text-stone-50">Vision</span>
    </span>
  );
}
