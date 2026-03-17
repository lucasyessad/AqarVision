import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  selectSize?: "sm" | "md";
}

const sizeStyles = {
  sm: "h-8 ps-3 pe-8 text-sm",
  md: "h-9 ps-3 pe-8 text-sm",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, selectSize = "md", className = "", id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-md border bg-surface text-primary transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-accent focus:border-border-focus ${
              error
                ? "border-danger"
                : "border-border-default dark:border-border-strong"
            } ${sizeStyles[selectSize]} ${className}`}
            aria-invalid={error ? "true" : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute inset-y-0 end-2 my-auto h-4 w-4 text-tertiary" />
        </div>
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-tertiary">{hint}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
export { Select };
export type { SelectProps, SelectOption };
