import { useTranslations } from "next-intl";
import { ResetPasswordForm } from "@/features/auth/components";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");

  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gold">AqarVision</h1>
        <p className="mt-2 text-lg font-semibold text-blue-night">
          {t("reset_password_title")}
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
