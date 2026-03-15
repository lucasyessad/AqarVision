import { redirect } from "next/navigation";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string; mode?: string }>;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { redirect: redirectParam, mode } = await searchParams;

  const isProMode = mode === "pro";
  const target = isProMode
    ? `/${locale}/AqarPro/auth/login`
    : `/${locale}/AqarChaab/auth/login`;

  const url = redirectParam ? `${target}?redirect=${encodeURIComponent(redirectParam)}` : target;
  redirect(url);
}
