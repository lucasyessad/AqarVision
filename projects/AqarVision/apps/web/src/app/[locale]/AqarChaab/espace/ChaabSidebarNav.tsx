"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
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
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
            style={{
              color: isActive ? "var(--ivoire)" : "rgba(253,251,247,0.45)",
              background: isActive ? "rgba(253,251,247,0.1)" : "transparent",
            }}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
            {isActive && (
              <span
                className="ms-auto h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--or)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
