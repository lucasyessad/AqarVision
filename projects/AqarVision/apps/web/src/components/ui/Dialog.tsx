"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

function Dialog({ open, onClose, title, description, className = "", children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby={description ? "dialog-description" : undefined}
        className={`relative z-10 w-full max-w-lg rounded-xl border border-border-default bg-surface p-6 shadow-elevated animate-scale-in ${className}`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-tertiary hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h2
                id="dialog-title"
                className="text-lg font-semibold text-primary"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="dialog-description"
                className="mt-1 text-sm text-secondary"
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

export { Dialog };
export type { DialogProps };
