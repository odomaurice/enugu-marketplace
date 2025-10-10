import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CashierLayoutClient from "./CashierDashboardClient";

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return redirect("/auth/signin");
  }

  if (session.user.role !== "cashier") {
    return redirect("/");
  }

  return <CashierLayoutClient session={session}>{children}</CashierLayoutClient>;
}