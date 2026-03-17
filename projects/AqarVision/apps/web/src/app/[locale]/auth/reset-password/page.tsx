import { useTranslations } from "next-intl";
import { ResetPasswordForm } from "@/features/auth/components";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-amber-500">AqarVision</h1>
        <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t("reset_password_title")}
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
