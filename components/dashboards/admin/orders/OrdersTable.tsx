"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.id.substring(0, 8)}...
      </span>
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
      <Badge className="bg-green-700"
        variant={
          row.original.orderStatus === 'DELIVERED' ? 'secondary' :
          row.original.orderStatus === 'CANCELLED' ? 'destructive' : 'default'
        }
      >
        {row.original.orderStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <Badge className="bg-orange-700"
        variant={
          row.original.paymentStatus === 'PAID' ? 'secondary' :
          row.original.paymentStatus === 'FAILED' ? 'destructive' : 'default'
        }
      >
        {row.original.paymentStatus}
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
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
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
  );
}