import { Link } from "@/lib/i18n/navigation";

interface AdminSidebarProps {
  locale: string;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/agencies", label: "Agences" },
  { href: "/admin/users", label: "Utilisateurs" },
  { href: "/admin/listings", label: "Annonces" },
  { href: "/admin/verifications", label: "Vérifications" },
  { href: "/admin/payments", label: "Paiements en attente" },
  { href: "/admin/settings", label: "Paramètres" },
] as const;

export function AdminSidebar({ locale }: AdminSidebarProps) {
  void locale;
  return (
    <aside className="flex w-56 flex-col border-e border-zinc-800 bg-zinc-950 text-white">
      {/* Logo */}
      <div className="border-b border-zinc-800 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/70">
          AqarVision
        </p>
        <h2 className="mt-0.5 text-base font-bold text-white">Administration</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 px-2 py-3">
        <Link
          href="/AqarPro/dashboard"
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          ← Retour au site
        </Link>
      </div>
    </aside>
  );
}
