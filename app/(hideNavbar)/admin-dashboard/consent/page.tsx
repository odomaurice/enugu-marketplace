'use client';

import {
  useConsentInfiniteQuery,
  useConsentMutation,
} from "@/hooks/useCompliance";
import { ComplianceCard } from "@/components/ComplianceCard";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Download, Search, Filter, ChevronDown } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Status options for filtering
const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "DENIED", label: "Denied" },
  { value: "REJECTED", label: "Rejected" },
];

// Sort options
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "salary-high", label: "Salary (High to Low)" },
  { value: "salary-low", label: "Salary (Low to High)" },
];

export default function AdminCompliancePage() {
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const [selectedCompliance, setSelectedCompliance] = useState<Consent | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [updatingComplianceId, setUpdatingComplianceId] = useState<string | null>(null);

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

  // Redirect if not admin
  useEffect(() => {
    if (status === "authenticated" && user?.role !== "super_admin") {
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

  // Filter and sort compliance items
  const filteredAndSortedCompliance = useMemo(() => {
    let filtered = [...allCompliance];

<<<<<<< HEAD
    // Apply search filter
=======
    
>>>>>>> 65b24dc8aed43ab974ae0fd3fa47f25d7d77b60b
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const fullName = `${item.user.firstname} ${item.user.lastname}`.toLowerCase();
        const employeeId = item.user.employee_id?.toLowerCase() || "";
        const govEntity = item.user.government_entity?.toLowerCase() || "";
        const email = item.user.email?.toLowerCase() || "";
        
        return (
          fullName.includes(query) ||
          employeeId.includes(query) ||
          govEntity.includes(query) ||
          email.includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Update active filters for display
    const active: string[] = [];
    if (searchQuery.trim()) active.push(`Search: "${searchQuery}"`);
    if (statusFilter !== "ALL") active.push(`Status: ${statusFilter}`);

    setActiveFilters(active);

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-asc":
          return `${a.user.firstname} ${a.user.lastname}`.localeCompare(
            `${b.user.firstname} ${b.user.lastname}`
          );
        case "name-desc":
          return `${b.user.firstname} ${b.user.lastname}`.localeCompare(
            `${a.user.firstname} ${a.user.lastname}`
          );
        case "salary-high":
          return (b.user.salary_per_month || 0) - (a.user.salary_per_month || 0);
        case "salary-low":
          return (a.user.salary_per_month || 0) - (b.user.salary_per_month || 0);
        default:
          return 0;
      }
    });
  }, [allCompliance, searchQuery, statusFilter, sortBy]);

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

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setSortBy("newest");
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">Consent Management</h1>
            <p className="text-gray-600">
              Review and manage employee consent forms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing {filteredAndSortedCompliance.length} of {allCompliance.length} forms
            </span>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, employee ID, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Sort: {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    {SORT_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Clear Filters Button */}
            <div className="md:col-span-2">
              <Button
                variant="ghost"
                onClick={clearFilters}
                disabled={!searchQuery.trim() && statusFilter === "ALL" && sortBy === "newest"}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 mr-2">Active filters:</span>
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {filter}
                    <button
                      onClick={() => {
                        if (filter.startsWith('Search:')) {
                          setSearchQuery('');
                        } else if (filter.startsWith('Status:')) {
                          setStatusFilter('ALL');
                        }
                      }}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Pending</p>
                <p className="text-2xl font-bold text-blue-900">
                  {allCompliance.filter(item => item.status === "PENDING").length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">P</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {allCompliance.filter(item => item.status === "APPROVED").length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">A</span>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Denied</p>
                <p className="text-2xl font-bold text-red-900">
                  {allCompliance.filter(item => item.status === "REJECTED").length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold">D</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredAndSortedCompliance.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No compliance forms found.</p>
          {activeFilters.length > 0 && (
            <p className="text-gray-500 mt-2">
              Try adjusting your filters or search criteria.
            </p>
          )}
          {activeFilters.length > 0 && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCompliance.map((compliance) => (
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

          {!hasNextPage && filteredAndSortedCompliance.length > 0 && (
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