type IconButtonSize = "sm" | "md" | "lg";
type IconButtonVariant = "ghost" | "secondary";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4",
  md: "h-9 w-9 [&>svg]:h-4.5 [&>svg]:w-4.5",
  lg: "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5",
};

const variantStyles: Record<IconButtonVariant, string> = {
  ghost:
    "text-secondary hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800",
  secondary:
    "border border-border-default text-secondary hover:text-primary hover:bg-surface-muted dark:border-border-strong",
};

function IconButton({
  size = "md",
  variant = "ghost",
  className = "",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:shadow-ring disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export { IconButton };
export type { IconButtonProps, IconButtonSize, IconButtonVariant };
