"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";

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
          <Link
            key={item.href}
            href={item.href as "/"}
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300",
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
        );
      })}
    </nav>
  );
}
