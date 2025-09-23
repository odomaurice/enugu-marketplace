import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import axios from "axios";
import { UserDetails } from "@/components/dashboards/admin/UserDetails";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params; // ✅ await params here

  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "fulfillment_officer") {
    redirect("/auth/signin");
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return (
      <div className="container py-6">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="text-red-600 font-medium">Invalid User ID</div>
          <div className="text-red-500 text-sm mt-1">
            The user ID format is incorrect
          </div>
          <Link href="/agent-dashboard/users">
            <Button variant="outline" className="mt-4">
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/user`,
      {
        headers: { 
          Authorization: `Bearer ${session.user.token}`,
          "Content-Type": "application/json"
        },
        params: { user_id: userId },
        timeout: 5000
      }
    );

    const userData = response.data.data || response.data;

    return (
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-sm text-gray-500">
              Manage user account and view activity
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/agent-dashboard/users">
              <Button variant="outline">Back to Users</Button>
            </Link>
          </div>
        </div>
        <UserDetails userData={userData} token={session.user.token} />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch user:", error);

    let errorMessage = "Unknown error occurred";
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        errorMessage = "User not found";
      } else if (error.response?.status === 401) {
        redirect("/auth/signin");
      } else {
        errorMessage = error.response?.data?.message || error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return (
      <div className="container py-6">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="text-red-600 font-medium">Error loading user</div>
          <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
          <Link href="/agent-dashboard/users">
            <Button variant="outline" className="mt-4">
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
