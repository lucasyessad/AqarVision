import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { SignUpForm } from "@/features/auth/components/SignUpForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "AqarPro · Créer un compte" };

export default async function ProSignUpPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
          AqarPro
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
          Créer un compte agence
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Démarrez gratuitement, sans engagement.
        </p>
      </div>

      {/* SignUpForm with dark styling via wrapper */}
      <div className="[&_input]:bg-zinc-900 [&_input]:border-zinc-700 [&_input]:text-zinc-50 [&_input:focus]:border-amber-400 [&_label]:text-zinc-400 [&_button[type=submit]]:bg-amber-400 [&_button[type=submit]]:text-zinc-950">
        <SignUpForm />
      </div>

      <p className="mt-6 text-center text-xs text-zinc-600">
        Déjà un compte ?{" "}
        <Link href="/AqarPro/auth/login" className="text-amber-400 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
