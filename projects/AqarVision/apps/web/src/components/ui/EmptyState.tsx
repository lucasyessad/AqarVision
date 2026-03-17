interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-tertiary dark:bg-zinc-800">
          {icon}
        </div>
      )}
      <h3 className="text-md font-semibold text-primary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-secondary">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
