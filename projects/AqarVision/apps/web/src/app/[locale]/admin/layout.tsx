import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  // 1. Verify session
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    redirect(`/${locale}/AqarPro/auth/login`);
  }

  // 2. Verify super_admin role via DB function
  const { data: isSuperAdmin, error: rpcError } = await supabase.rpc("is_super_admin", {
    p_user_id: user.id,
  });

  if (rpcError || !isSuperAdmin) {
    // Not a super_admin → redirect to regular dashboard
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="flex min-h-screen bg-off-white">
      <AdminSidebar locale={locale} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
