import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({
  className,
  children,
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white dark:bg-stone-900 shadow-card",
        "border border-stone-200 dark:border-stone-800",
        hoverable &&
          "transition-shadow duration-normal hover:shadow-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-stone-200 dark:border-stone-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-stone-200 dark:border-stone-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
