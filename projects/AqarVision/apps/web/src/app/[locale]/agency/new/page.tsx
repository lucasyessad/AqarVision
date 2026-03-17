import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateAgencyForm } from "@/features/agencies/components";

export default async function NewAgencyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/AqarPro/auth/login`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-800 p-8">
      <CreateAgencyForm />
    </div>
  );
}
