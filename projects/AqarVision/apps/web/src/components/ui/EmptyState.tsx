import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
        <Icon
          size={24}
          className="text-stone-500 dark:text-stone-400"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
