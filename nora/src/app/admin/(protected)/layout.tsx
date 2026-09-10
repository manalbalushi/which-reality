import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "./admin-shell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("nora_admin")) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
