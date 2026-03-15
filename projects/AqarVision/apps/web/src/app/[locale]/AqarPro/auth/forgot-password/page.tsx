import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "AqarPro · Mot de passe oublié" };

export default async function ProForgotPasswordPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
          AqarPro
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
          Mot de passe oublié
        </h2>
      </div>

      <div className="[&_input]:bg-zinc-900 [&_input]:border-zinc-700 [&_input]:text-zinc-50 [&_input:focus]:border-amber-400 [&_label]:text-zinc-400 [&_p]:text-zinc-500 [&_button[type=submit]]:bg-amber-400 [&_button[type=submit]]:text-zinc-950">
        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-center text-xs">
        <Link href="/AqarPro/auth/login" className="text-amber-400 hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
