"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Phone, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface StickyContactBarProps {
  price: number;
  currency: string;
  agencyPhone: string | null;
  listingTitle: string;
  onContactClick: () => void;
}

export function StickyContactBar({
  price,
  currency,
  agencyPhone,
  listingTitle,
  onContactClick,
}: StickyContactBarProps) {
  const t = useTranslations("listings");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{listingTitle}</p>
          <p className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
            {formatPrice(price, currency)}
          </p>
        </div>

        <div className="flex items-center gap-2 ps-3">
          {agencyPhone && (
            <a
              href={`tel:${agencyPhone}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              aria-label={t("call")}
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onContactClick}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            <MessageCircle className="h-4 w-4" />
            {t("contact")}
          </button>
        </div>
      </div>
    </div>
  );
}
