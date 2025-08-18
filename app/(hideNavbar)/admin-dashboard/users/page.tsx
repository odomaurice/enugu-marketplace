import { UsersDataFetcher } from "@/components/dashboards/admin/users/UsersDataFetcher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateUserDialog } from "@/components/dashboards/admin/users/CreateUserDialog";
import { UploadUsersDialog } from "@/components/dashboards/admin/users/UploadUsersDialog";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "admin") {
    return null; // Or redirect if needed
  }

  return (
    <div className="container py-6 mt-[60px] ">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[18px] font-bold">User Management</h1>
       <div className="flex space-x-2">
          <CreateUserDialog token={session.user.token} />
          <UploadUsersDialog token={session.user.token} />
        </div>
      </div>
      <UsersDataFetcher />
    </div>
  );
}