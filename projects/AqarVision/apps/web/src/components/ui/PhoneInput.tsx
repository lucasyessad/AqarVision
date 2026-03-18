"use client";

import { PhoneInput as ReactPhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  label,
  error,
  hint,
  required,
  disabled,
  className,
}: PhoneInputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
          {required && <span className="ms-0.5 text-red-500">*</span>}
        </label>
      )}
      <ReactPhoneInput
        defaultCountry="dz"
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputClassName={cn(
          "!h-10 !w-full !rounded-e-md !border !px-3 !text-sm",
          "!bg-white dark:!bg-stone-950",
          "!text-stone-900 dark:!text-stone-100",
          "placeholder:!text-stone-400 dark:placeholder:!text-stone-500",
          "focus:!outline-none focus:!ring-2 focus:!ring-teal-600/20 focus:!border-teal-600",
          error
            ? "!border-red-500 dark:!border-red-400"
            : "!border-stone-300 dark:!border-stone-600",
        )}
        countrySelectorStyleProps={{
          buttonClassName: cn(
            "!h-10 !rounded-s-md !border !px-2",
            "!bg-white dark:!bg-stone-950",
            "hover:!bg-stone-50 dark:hover:!bg-stone-900",
            error
              ? "!border-red-500 dark:!border-red-400"
              : "!border-stone-300 dark:!border-stone-600",
          ),
          dropdownStyleProps: {
            className: cn(
              "!rounded-lg !border !shadow-lg !z-50",
              "!bg-white dark:!bg-stone-900",
              "!border-stone-200 dark:!border-stone-700",
            ),
            listItemClassName: cn(
              "!px-3 !py-2 !text-sm",
              "!text-stone-700 dark:!text-stone-300",
              "hover:!bg-stone-50 dark:hover:!bg-stone-800",
            ),
          },
        }}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">{hint}</p>
      )}
    </div>
  );
}
