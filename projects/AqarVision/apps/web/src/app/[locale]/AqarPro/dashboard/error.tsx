"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
        {t("errors.serverError")}
      </h2>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 max-w-md">
        {error.message}
      </p>
      <Button variant="primary" size="md" onClick={reset} className="mt-6">
        {t("buttons.retry")}
      </Button>
    </div>
  );
}
