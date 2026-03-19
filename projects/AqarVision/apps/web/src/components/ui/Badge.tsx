import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-medium rounded-full whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300",
        success:
          "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
        warning:
          "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
        danger:
          "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
        info:
          "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
        "listing-sale":
          "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
        "listing-rent":
          "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
        "listing-vacation":
          "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
      },
      size: {
        sm: "px-2 py-0.5 text-2xs",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
}

export function Badge({ className, variant, size, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {children}
    </span>
  );
}

export { badgeVariants };
