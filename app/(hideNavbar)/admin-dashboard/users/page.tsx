
import { UsersDataFetcher } from "@/components/dashboards/admin/users/UsersDataFetcher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateUserDialog } from "@/components/dashboards/admin/users/CreateUserDialog";
import { UploadUsersDialog } from "@/components/dashboards/admin/users/UploadUsersDialog";
import { ExportLoansDialog } from "@/components/dashboards/admin/users/ExportLoansDialog";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "super_admin") {
    return null; 
  }

  return (
    <div className="container py-6 mt-[60px] ">
      <div className="flex items-center sm:flex-row flex-col justify-between mb-6">
        <h1 className="text-[18px] font-bold">User Management</h1>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
          <CreateUserDialog token={session.user.token} />
          <UploadUsersDialog token={session.user.token} />
          <ExportLoansDialog token={session.user.token} />
        </div>
      </div>
      <UsersDataFetcher />
    </div>
  );
}