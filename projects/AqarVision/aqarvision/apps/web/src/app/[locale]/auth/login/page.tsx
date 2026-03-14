import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { LoginForm } from "@/features/auth/components";

export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gold">AqarVision</h1>
        <p className="mt-2 text-lg font-semibold text-blue-night">
          {t("login_title")}
        </p>
      </div>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-gray-500">
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
