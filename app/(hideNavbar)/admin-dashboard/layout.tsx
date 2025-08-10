import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminLayoutClient from "./AdminDashboardClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return redirect("/auth/signin");
  }

  if (session.user.role !== "admin") {
    return redirect("/");
  }

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>;
}