"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { CommandPalette } from "./CommandPalette";

interface DashboardShellProps {
  agencySlug: string | null;
  userEmail: string;
  fullName?: string | null;
  locale: string;
  pageTitle: string;
  children: React.ReactNode;
}

export function DashboardShell({
  agencySlug,
  userEmail,
  fullName,
  locale,
  pageTitle,
  children,
}: DashboardShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <DashboardSidebar
        agencySlug={agencySlug}
        userEmail={userEmail}
        fullName={fullName}
      />

      <div className="flex flex-1 flex-col">
        <DashboardTopBar
          title={pageTitle}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
        />
        {children}
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        locale={locale}
      />
    </>
  );
}
