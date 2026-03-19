"use client";

import { type ReactNode, type ReactElement, useState, useRef } from "react";
import { cn } from "@/lib/utils";

type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: string;
  children: ReactElement;
  position?: TooltipPosition;
  className?: string;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: "bottom-full start-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full start-1/2 -translate-x-1/2 mt-2",
  left: "end-full top-1/2 -translate-y-1/2 me-2",
  right: "start-full top-1/2 -translate-y-1/2 ms-2",
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: "top-full start-1/2 -translate-x-1/2 border-t-stone-900 dark:border-t-stone-100 border-x-transparent border-b-transparent",
  bottom:
    "bottom-full start-1/2 -translate-x-1/2 border-b-stone-900 dark:border-b-stone-100 border-x-transparent border-t-transparent",
  left: "start-full top-1/2 -translate-y-1/2 border-s-stone-900 dark:border-s-stone-100 border-y-transparent border-e-transparent",
  right:
    "end-full top-1/2 -translate-y-1/2 border-e-stone-900 dark:border-e-stone-100 border-y-transparent border-s-transparent",
};

export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function show() {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 150);
  }

  function hide() {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-tooltip pointer-events-none",
            "px-2.5 py-1.5 rounded-md",
            "bg-stone-900 dark:bg-stone-100",
            "text-white dark:text-stone-900",
            "text-xs font-medium shadow-lg",
            "whitespace-nowrap",
            "animate-fade-in",
            positionClasses[position],
            className
          )}
        >
          {content}
          <span
            className={cn(
              "absolute w-0 h-0 border-4",
              arrowClasses[position]
            )}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
