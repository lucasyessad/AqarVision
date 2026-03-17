import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
  secondary:
    "border border-border-default bg-transparent text-primary hover:bg-surface-muted dark:border-border-strong",
  ghost:
    "bg-transparent text-secondary hover:bg-zinc-100 hover:text-primary dark:hover:bg-zinc-800",
  danger:
    "bg-danger text-white hover:bg-red-600 dark:hover:bg-red-500",
  accent:
    "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-400 dark:text-zinc-900 dark:hover:bg-amber-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded gap-1.5",
  md: "h-9 px-4 text-sm rounded-md gap-2",
  lg: "h-11 px-6 text-base rounded-lg gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconEnd,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:shadow-ring disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconEnd && !loading ? (
          <span className="shrink-0">{iconEnd}</span>
        ) : null}
      </button>
    );
  },
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
