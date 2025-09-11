"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserWithRelations } from "@/types/index";

const columns: ColumnDef<UserWithRelations>[] = [
  {
    accessorKey: "employee_id",
    header: "Employee ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("employee_id") || "N/A"}</div>,
  },
  {
    accessorKey: "verification_id",
    header: "Verification ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("verification_id") || "N/A"}</div>,
  },
  {
    accessorFn: (row) => `${row.firstname || ''} ${row.lastname || ''}`.trim(),
    header: "Name",
    cell: ({ row }) => {
      const name = `${row.original.firstname || ''} ${row.original.lastname || ''}`.trim();
      return <div className="font-medium">{name || "N/A"}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-blue-600 hover:underline">{row.getValue("email") || "N/A"}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="font-mono">{row.getValue("phone") || "N/A"}</div>,
  },
  {
    accessorKey: "government_entity",
    header: "Government Entity",
    cell: ({ row }) => <div className="capitalize">{row.getValue("government_entity") || "N/A"}</div>,
  },
  {
    accessorKey: "salary_per_month",
    header: "Salary (₦)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("salary_per_month") || "0");
      return (
        <div className="font-medium text-green-700">
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
          }).format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "loan_unit",
    header: "Loan Unit (₦)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("loan_unit") || "0");
      return (
        <div className="font-medium">
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
          }).format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "loan_amount_collected",
    header: "Loan Collected (₦)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("loan_amount_collected") || "0");
      return (
        <div className="font-medium text-red-700">
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
          }).format(amount)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Link href={`/admin-dashboard/users/${user.id}`} legacyBehavior passHref>
          <Button variant="outline" size="sm" className="hover:bg-blue-50 text-[12px] hover:text-blue-600">
            View Details
          </Button>
        </Link>
      );
    },
  },
];

interface AdminUsersTableProps {
  initialUsers: UserWithRelations[];
  token: string;
}

export function AdminUsersTable({ initialUsers, token }: AdminUsersTableProps) {
  const router = useRouter();

  const { data: users = initialUsers, isLoading, isError, error } = useQuery({
    queryKey: ["admin-users", token],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            timeout: 10000
          }
        );
        return response.data?.data || response.data;
      } catch (error: any) {
        console.error("API Error:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          router.push("/auth/signin");
        }
        throw error;
      }
    },
    initialData: initialUsers,
    enabled: !!token,
    retry: false
  });

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5, // Default page size
      },
    },
  });

  if (isLoading && !users.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="text-red-600 font-medium">Error loading users</div>
        <div className="text-red-500 text-sm mt-1">
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
        <Button
          variant="outline"
          className="mt-4 hover:bg-red-50 hover:text-red-600"
          onClick={() => router.refresh()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Filter by any field..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => {
            table.setGlobalFilter(event.target.value); 
          }}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-600">Rows per page:</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border shadow-sm">
        <Table className="min-w-[1200px]">
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="text-[14px]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-gray-700">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50 text-[13px]">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-gray-600">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            users.length
          )}{" "}
          of {users.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}