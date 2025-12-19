import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AgentLayoutClient from "./AgentDashboardClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return redirect("/auth/signin");
  }

  if (session.user.role !== "fulfillment_officer") {
    return redirect("/");
  }

  return <AgentLayoutClient session={session}>{children}</AgentLayoutClient>;
}