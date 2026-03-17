"use client";

import { useState, useRef } from "react";

type TooltipSide = "top" | "bottom" | "start" | "end";

interface TooltipProps {
  content: string;
  side?: TooltipSide;
  className?: string;
  children: React.ReactNode;
}

const positionStyles: Record<TooltipSide, string> = {
  top:    "bottom-full start-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full start-1/2 -translate-x-1/2 mt-2",
  start:  "end-full top-1/2 -translate-y-1/2 me-2",
  end:    "start-full top-1/2 -translate-y-1/2 ms-2",
};

function Tooltip({ content, side = "top", className = "", children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 200);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

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
          className={`absolute z-50 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1 text-xs text-zinc-50 shadow-md animate-fade-in dark:bg-zinc-100 dark:text-zinc-900 ${positionStyles[side]} ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
export type { TooltipProps, TooltipSide };
