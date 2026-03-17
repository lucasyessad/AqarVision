import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ForgotPasswordForm } from "@/features/auth/components";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-amber-500">AqarVision</h1>
        <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t("forgot_password_title")}
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        <Link
          href="/AqarChaab/auth/login"
          className="font-medium text-amber-500 hover:underline"
        >
          {t("back_to_login")}
        </Link>
      </p>
    </div>
  );
}
