import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session || !["admin", "editor", "author"].includes(role || "")) {
    redirect("/auth/login");
  }

  return (
    <AdminLayoutShell role={role || "author"} user={session.user}>
      {children}
    </AdminLayoutShell>
  );
}
