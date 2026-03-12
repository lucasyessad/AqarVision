'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  MessageSquare,
  Palette,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
  Shield,
  Calendar,
  CalendarCheck,
  ExternalLink,
  Bell,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  external?: boolean;
}

function buildNav(slug: string): NavItem[] {
  const base = `/aqarpro/${slug}`;
  return [
    { label: 'Tableau de bord', href: `${base}/dashboard`,      icon: LayoutDashboard },
    { label: 'Biens',           href: `${base}/properties`,     icon: Home },
    { label: 'Leads',           href: `${base}/leads`,          icon: Users },
    { label: 'Messages',        href: `${base}/messages`,       icon: MessageSquare },
    { label: 'Notifications',   href: `${base}/notifications`,  icon: Bell },
    { label: 'Analytics',       href: `${base}/analytics`,      icon: BarChart3 },
    { label: 'Visites',          href: `${base}/visit-requests`, icon: CalendarCheck },
    { label: 'Calendrier',      href: `${base}/calendar`,       icon: Calendar },
  ];
}

function buildSettings(slug: string): NavItem[] {
  const base = `/aqarpro/${slug}/settings`;
  return [
    { label: 'Branding',       href: `${base}/branding`,      icon: Palette },
    { label: 'Vérification',   href: `${base}/verification`,  icon: Shield },
    { label: 'Équipe',         href: `${base}/team`,           icon: Users },
    { label: 'Abonnement',     href: `${base}/billing`,       icon: CreditCard },
    { label: 'Paramètres',     href: base,                     icon: Settings },
  ];
}

interface SidebarProps {
  agencyName?: string;
  agencySlug?: string;
  userEmail?: string;
  userName?: string;
  unreadLeads?: number;
  unreadMessages?: number;
}

export function Sidebar({
  agencyName = 'Mon agence',
  agencySlug = '',
  userEmail = '',
  userName = '',
  unreadLeads = 0,
  unreadMessages = 0,
}: SidebarProps) {
  const pathname   = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const slug = agencySlug;
  const base = `/aqarpro/${slug}`;

  const navItems = buildNav(slug);
  const settingsItems = buildSettings(slug);

  const items = navItems.map(item => ({
    ...item,
    badge:
      item.href === `${base}/leads`         ? unreadLeads :
      item.href === `${base}/notifications`  ? unreadMessages :
      undefined,
  }));

  const isActive = (href: string) =>
    href === `${base}/dashboard`
      ? pathname === href || pathname === base
      : pathname.startsWith(href);

  return (
    <motion.aside
      layout
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={[
        'fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-white border-r border-neutral-200',
        collapsed ? 'w-16' : 'w-[260px]',
      ].join(' ')}
    >
      {/* Logo + agency */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-neutral-200 min-h-[72px]">
        <div className="w-8 h-8 bg-or rounded-lg flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-w-0"
            >
              <p className="text-body-sm font-semibold text-foreground truncate">{agencyName}</p>
              <p className="text-caption text-muted-foreground">AqarPro</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="flex flex-col gap-0.5">
          {items.map(item => (
            <li key={item.href}>
              <NavLink item={item} collapsed={collapsed} active={isActive(item.href)} />
            </li>
          ))}
        </ul>

        <div className="my-3 border-t border-neutral-100" />

        {/* Gestion */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="px-3 mb-1.5 text-caption text-muted-foreground uppercase tracking-wider">Gestion</p>
            </motion.div>
          )}
        </AnimatePresence>
        <ul className="flex flex-col gap-0.5">
          {settingsItems.map(item => (
            <li key={item.href}>
              <NavLink item={item} collapsed={collapsed} active={isActive(item.href)} />
            </li>
          ))}
        </ul>

        {/* Lien vitrine agence */}
        {agencySlug && (
          <>
            <div className="my-3 border-t border-neutral-100" />
            <a
              href={`/agence/${agencySlug}`}
              target="_blank"
              rel="noopener noreferrer"
              title={collapsed ? 'Voir ma vitrine' : undefined}
              className="flex items-center gap-3 px-3 h-10 rounded-md transition-colors text-body-md font-medium text-or hover:bg-muted"
            >
              <ExternalLink className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="truncate"
                  >
                    Voir ma vitrine
                  </motion.div>
                )}
              </AnimatePresence>
            </a>
          </>
        )}
      </nav>

      {/* User profile */}
      <div className="border-t border-neutral-200 p-3">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="profile-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-caption font-semibold text-or">
                  {userName.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-foreground truncate">{userName || 'Utilisateur'}</p>
                <p className="text-caption text-muted-foreground truncate">{userEmail}</p>
              </div>
              <Link href={`${base}/logout`} className="text-muted-foreground hover:text-neutral-700 transition-colors">
                <LogOut className="h-4 w-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="profile-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                href={`${base}/logout`}
                className="flex items-center justify-center h-9 w-full text-muted-foreground hover:text-neutral-700 transition-colors rounded-md hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
        aria-label={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-neutral-600" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-neutral-600" />
        )}
      </button>
    </motion.aside>
  );
}

/* ─── Nav Link ───────────────────────────────────── */

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={[
        'flex items-center gap-3 px-3 h-10 rounded-md transition-colors text-body-md font-medium',
        active
          ? 'bg-muted text-or font-semibold'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-foreground',
      ].join(' ')}
    >
      <div className="relative shrink-0">
        <Icon className="h-5 w-5" />
        {item.badge != null && item.badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-or text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
