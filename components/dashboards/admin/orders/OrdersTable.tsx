"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import OrdersFilter from "../OrdersFilter";

interface OrdersTableProps {
  orders: Order[];
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.id.substring(0, 8)}...</span>
    ),
  },
  {
    accessorKey: "placedAt",
    header: "Date",
    cell: ({ row }) => new Date(row.original.placedAt).toLocaleDateString(),
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.totalAmount),
  },
  {
    accessorKey: "orderStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className="bg-green-700"
        variant={
          row.original.orderStatus === "DELIVERED"
            ? "secondary"
            : row.original.orderStatus === "CANCELLED"
            ? "destructive"
            : "default"
        }
      >
        {row.original.orderStatus}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button asChild size="sm" variant="ghost">
        <Link href={`/admin-dashboard/orders/${row.original.id}`}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Link>
      </Button>
    ),
  },
];

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);

  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      {/* Filter Component */}
      <OrdersFilter 
        orders={orders} 
        onFilterChange={setFilteredOrders} 
      />

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 mt-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {filteredOrders.length} orders
          {filteredOrders.length !== orders.length && (
            <span className="text-blue-600 ml-1">
              (filtered from {orders.length} total)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <label htmlFor="rows-per-page" className="sr-only">
              Rows per page
            </label>
            <select
              id="rows-per-page"
              aria-label="Rows per page"
              className="h-8 w-[70px] rounded-md border border-input bg-background"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
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
    </div>
  );
}