import { getTranslations } from "next-intl/server";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");

  return (
    <div className="flex min-h-screen bg-stone-100 dark:bg-stone-900">
      {/* Sidebar: hidden on mobile, visible on lg+ */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-sticky lg:flex lg:w-64 lg:flex-col">
        <DashboardSidebar />
      </aside>

      {/* Main content area: offset by sidebar width on lg+ */}
      <div className="flex flex-1 flex-col lg:ps-64">
        <DashboardTopBar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
