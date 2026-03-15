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
        <p
          className="text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: "var(--or)" }}
        >
          AqarChaab
        </p>
        <h2
          className="mt-2 text-2xl font-semibold"
          style={{ color: "var(--ivoire)" }}
        >
          Mot de passe oublié
        </h2>
      </div>

      <div
        className="[&_p]:text-[rgba(253,251,247,0.4)] [&_label]:text-[rgba(253,251,247,0.4)] [&_input]:bg-[rgba(253,251,247,0.06)] [&_input]:border-[rgba(253,251,247,0.12)] [&_input]:text-white [&_button[type=submit]]:bg-[var(--ivoire)] [&_button[type=submit]]:text-[var(--onyx)]"
      >
        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-center text-xs">
        <Link href="/AqarChaab/auth/login" className="hover:underline" style={{ color: "var(--or)" }}>
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
