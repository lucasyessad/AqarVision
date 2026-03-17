"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { Tooltip } from "@/components/ui/Tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function ChaabSidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-3 py-4">
      {items.map((item) => {
        const isActive =
          item.href === "/AqarChaab/espace"
            ? pathname.endsWith("/AqarChaab/espace") || pathname.endsWith("/espace")
            : pathname.includes(item.href);

        return (
          <Tooltip key={item.href} content={item.label} side="end">
            <Link
              href={item.href as "/"}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200",
              ].join(" ")}
            >
              <span className={`shrink-0 [&>svg]:h-4 [&>svg]:w-4 ${isActive ? "text-amber-500" : ""}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="ms-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </Link>
          </Tooltip>
        );
      })}
    </nav>
  );
}
