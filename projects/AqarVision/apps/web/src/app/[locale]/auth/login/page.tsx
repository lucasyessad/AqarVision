import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { LoginForm } from "@/features/auth/components";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: "visitor" | "pro" }>;
}

export async function generateMetadata({ params }: LoginPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("login_title") };
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { mode = "visitor" } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gold">AqarVision</h1>
        <p className="mt-2 text-lg font-semibold text-blue-night">
          {t("login_title")}
        </p>
      </div>

      <LoginForm locale={locale} defaultMode={mode} />

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("no_account")}{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-gold hover:underline"
        >
          {t("signup_button")}
        </Link>
      </p>
    </div>
  );
}
