

import React from "react";
import { CreateFulfillmentOfficerDialog } from "@/components/dashboards/admin/agents/CreateFullfillmemtAgent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await getServerSession(authOptions);
  
  // Redirect if not authenticated
  if (!session) {
    redirect("/auth/signin");
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Fulfillment Officer</h1>
      <CreateFulfillmentOfficerDialog 
        token={session.user?.token || undefined} 
       
      />
    </div>
  );
};

export default Page;