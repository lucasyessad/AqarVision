import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 py-12 dark:bg-stone-950">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50"
      >
        Aqar<span className="text-teal-600 dark:text-teal-400">Vision</span>
      </Link>

      {/* Auth card */}
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-card dark:border-stone-800 dark:bg-stone-900">
        {children}
      </div>

    </div>
  );
}
