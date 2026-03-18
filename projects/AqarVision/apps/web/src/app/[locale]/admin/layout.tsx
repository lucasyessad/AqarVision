import { getTranslations } from "next-intl/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("admin");

  return (
    <div className="flex min-h-screen bg-stone-100 dark:bg-stone-900">
      {/* Admin sidebar: hidden on mobile, visible on lg+ */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-sticky lg:flex lg:w-64 lg:flex-col">
        <AdminSidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:ps-64">
        {/* Top bar for mobile */}
        <header className="sticky top-0 z-sticky flex h-14 items-center border-b border-stone-200 bg-white px-4 dark:border-stone-800 dark:bg-stone-900 lg:hidden">
          <h1 className="text-md font-semibold text-stone-900 dark:text-stone-50">
            {t("title")}
          </h1>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
