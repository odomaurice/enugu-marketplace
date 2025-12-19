"use client";

import {
  useConsentInfiniteQuery,
  useConsentMutation,
} from "@/hooks/useCompliance";
import { ComplianceCard } from "@/components/ComplianceCard";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Download } from "lucide-react";
import { Consent } from "@/types/compliance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

export default function AgentCompliancePage() {
 const { data: clientSession } = useSession();
 const [serverUser, setServerUser] = useState(null);
 const [isLoading, setIsLoading] = useState(true);


  const { toast } = useToast();
  const [selectedCompliance, setSelectedCompliance] =
    useState<Consent | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [updatingComplianceId, setUpdatingComplianceId] = useState<
    string | null
  >(null);

  const { ref, inView } = useInView();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useConsentInfiniteQuery();

  const updateMutation = useConsentMutation();


   useEffect(() => {
     fetch("/api/auth/session")
       .then((res) => res.json())
       .then(setServerUser)
       .catch(console.error)
       .finally(() => setIsLoading(false));
   }, []);

   const user = clientSession?.user || serverUser;

 
  useEffect(() => {
    if (status === "authenticated" && user?.role !== "fulfillment_officer") {
      redirect("/unauthorized");
    }
  }, [user, status]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Remove duplicates by ID
  const allCompliance = useMemo(() => {
    const seenIds = new Set<string>();
    const uniqueItems: Consent[] = [];

    data?.pages.forEach((page) => {
      page.data.forEach((item) => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueItems.push(item);
        }
      });
    });

    return uniqueItems;
  }, [data]);

  const handleViewDetails = (consent: Consent) => {
    setSelectedCompliance(consent);
    setDetailDialogOpen(true);
  };

  const handleApprove = async (complianceId: string) => {
    setUpdatingComplianceId(complianceId);
    try {
      await updateMutation.mutateAsync({ complianceId, status: "APPROVED" });
      // Refetch data to get updated status
      await refetch();
      toast({
        title: "Success",
        description: "Compliance form approved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve compliance form",
        variant: "destructive",
      });
    } finally {
      setUpdatingComplianceId(null);
    }
  };

  const handleReject = async (complianceId: string) => {
    setUpdatingComplianceId(complianceId);
    try {
      await updateMutation.mutateAsync({ complianceId, status: "DENIED" });
      // Refetch data to get updated status
      await refetch();
      toast({
        title: "Success",
        description: "Compliance form rejected successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject compliance form",
        variant: "destructive",
      });
    } finally {
      setUpdatingComplianceId(null);
    }
  };

  const handleDownloadImage = (consent: Consent) => {
    const link = document.createElement("a");
    link.href = consent.form_url;
    link.download = `compliance-${consent.user.employee_id}-${consent.user.firstname}-${consent.user.lastname}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Error loading compliance forms: {(error as Error).message}</p>
        </div>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Compliance Management</h1>
        <p className="text-gray-600">
          Review and manage employee compliance forms
        </p>
        <p className="text-sm text-gray-500">
          Total: {allCompliance.length} forms
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : allCompliance.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No compliance forms submitted yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCompliance.map((compliance) => (
              <ComplianceCard
                key={`compliance-${compliance.id}-${compliance.updatedAt}`}
                consent={compliance}
                onView={handleViewDetails}
                onApprove={handleApprove}
                onReject={handleReject}
                isUpdating={updatingComplianceId === compliance.id}
              />
            ))}
          </div>

          {/* Load more trigger */}
          {hasNextPage && (
            <div
              ref={ref}
              className="h-10 flex items-center justify-center mt-6"
            >
              {isFetchingNextPage && (
                <Loader2 className="h-6 w-6 animate-spin" />
              )}
            </div>
          )}

          {!hasNextPage && allCompliance.length > 0 && (
            <div className="text-center mt-6">
              <p className="text-gray-500">All compliance forms loaded</p>
            </div>
          )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compliance Form Details</DialogTitle>
            <DialogDescription>
              Employee: {selectedCompliance?.user.firstname}{" "}
              {selectedCompliance?.user.lastname}
            </DialogDescription>
          </DialogHeader>

          {selectedCompliance && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Name</p>
                  <p>
                    {selectedCompliance.user.firstname}{" "}
                    {selectedCompliance.user.lastname}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Employee ID</p>
                  <p>{selectedCompliance.user.employee_id}</p>
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p>{selectedCompliance.user.email}</p>
                </div>
                <div>
                  <p className="font-semibold">Phone</p>
                  <p>{selectedCompliance.user.phone}</p>
                </div>
                <div>
                  <p className="font-semibold">Government Entity</p>
                  <p>{selectedCompliance.user.government_entity}</p>
                </div>
                <div>
                  <p className="font-semibold">Salary</p>
                  <p>
                    ₦{selectedCompliance.user.salary_per_month.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Status</p>
                  <p className="capitalize">
                    {selectedCompliance.status.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Submitted On</p>
                  <p>
                    {new Date(
                      selectedCompliance.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="relative h-64 w-full rounded-md overflow-hidden bg-gray-100">
                <img
                  src={selectedCompliance.form_url}
                  alt="Compliance form"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadImage(selectedCompliance)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </Button>

                {selectedCompliance.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => handleApprove(selectedCompliance.id)}
                      disabled={updatingComplianceId === selectedCompliance.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedCompliance.id)}
                      disabled={updatingComplianceId === selectedCompliance.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
