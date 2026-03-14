import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ForgotPasswordForm } from "@/features/auth/components";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");

  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gold">AqarVision</h1>
        <p className="mt-2 text-lg font-semibold text-blue-night">
          {t("forgot_password_title")}
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        <Link
          href="/auth/login"
          className="font-medium text-gold hover:underline"
        >
          {t("back_to_login")}
        </Link>
      </p>
    </div>
  );
}
