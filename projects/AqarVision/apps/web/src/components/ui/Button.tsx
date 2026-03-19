"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-md font-medium",
    "transition-colors duration-fast",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 dark:hover:bg-teal-600 active:bg-teal-800 dark:active:bg-teal-700",
        secondary:
          "bg-amber-400 dark:bg-amber-500 text-stone-950 dark:text-stone-950 hover:bg-amber-500 dark:hover:bg-amber-400 active:bg-amber-600 dark:active:bg-amber-600",
        ghost:
          "bg-transparent text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700",
        danger:
          "bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-500 active:bg-red-800 dark:active:bg-red-700 focus-visible:ring-red-600 dark:focus-visible:ring-red-400",
        outline:
          "border border-stone-300 dark:border-stone-600 bg-transparent text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 active:bg-stone-100 dark:active:bg-stone-700",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2
          className="animate-spin shrink-0"
          aria-hidden="true"
          size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
        />
      )}
      {children}
    </button>
  );
}

export { buttonVariants };
