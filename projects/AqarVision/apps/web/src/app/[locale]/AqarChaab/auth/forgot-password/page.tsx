import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "AqarChaab · Mot de passe oublié" };

export default async function ChaabForgotPasswordPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
          AqarChaab
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
          Mot de passe oublié
        </h2>
      </div>

      <div
        className="[&_p]:text-zinc-50/40 [&_label]:text-zinc-50/40 [&_input]:bg-zinc-50/[0.06] [&_input]:border-zinc-50/[0.12] [&_input]:text-white [&_button[type=submit]]:bg-zinc-50 [&_button[type=submit]]:text-zinc-950"
      >
        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-center text-xs">
        <Link href="/AqarChaab/auth/login" className="hover:underline text-amber-500">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
