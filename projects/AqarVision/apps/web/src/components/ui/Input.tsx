"use client";

import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export function Input({
  className,
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  id: externalId,
  disabled,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-stone-700 dark:text-stone-300",
            disabled && "opacity-50"
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-stone-400 dark:text-stone-500 pointer-events-none">
            {startIcon}
          </span>
        )}
        <input
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            "flex h-10 w-full rounded-md border bg-white dark:bg-stone-950 px-3 py-2",
            "text-sm text-stone-900 dark:text-stone-100",
            "placeholder:text-stone-400 dark:placeholder:text-stone-500",
            "transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-500 dark:border-red-400 focus-visible:ring-red-500 dark:focus-visible:ring-red-400"
              : "border-stone-300 dark:border-stone-600 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
            startIcon && "ps-10",
            endIcon && "pe-10",
            className
          )}
          {...props}
        />
        {endIcon && (
          <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-stone-400 dark:text-stone-500 pointer-events-none">
            {endIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs text-stone-500 dark:text-stone-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
