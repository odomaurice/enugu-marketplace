import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import axios from "axios";
import { AdminUsersTable } from "./UsersTable";

export async function UsersDataFetcher() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "super_admin") {
    redirect("/auth/signin");
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`,
      {
        headers: { 
          Authorization: `Bearer ${session.user.token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return (
      <AdminUsersTable 
        initialUsers={response.data.data || response.data} 
        token={session.user.token} 
      />
    );
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="text-red-600 font-medium">Error loading users</div>
        <div className="text-red-500 text-sm mt-1">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </div>
      </div>
    );
  }
}