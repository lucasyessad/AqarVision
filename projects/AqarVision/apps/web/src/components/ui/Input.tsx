import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  inputSize?: "sm" | "md";
}

const sizeStyles = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-3 text-sm",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, inputSize = "md", className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-tertiary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-md border bg-surface text-primary placeholder:text-tertiary transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-accent focus:border-border-focus ${
              error
                ? "border-danger"
                : "border-border-default dark:border-border-strong"
            } ${icon ? "ps-9" : ""} ${sizeStyles[inputSize]} ${className}`}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-danger">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-tertiary">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export { Input };
export type { InputProps };
