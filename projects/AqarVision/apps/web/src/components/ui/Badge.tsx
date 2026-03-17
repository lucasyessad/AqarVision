type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "accent";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  success:
    "bg-success/10 text-green-700 dark:text-green-400",
  warning:
    "bg-warning/10 text-amber-700 dark:text-amber-400",
  danger:
    "bg-danger/10 text-red-700 dark:text-red-400",
  info:
    "bg-info/10 text-blue-700 dark:text-blue-400",
  accent:
    "bg-accent-ghost text-amber-700 dark:text-amber-400",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-zinc-400 dark:bg-zinc-500",
  success: "bg-success",
  warning: "bg-warning",
  danger:  "bg-danger",
  info:    "bg-info",
  accent:  "bg-accent",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-2xs",
  md: "px-2 py-0.5 text-xs",
};

function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
