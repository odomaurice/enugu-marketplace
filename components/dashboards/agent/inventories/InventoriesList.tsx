'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EditInventoryDialog } from './EditInventoryDialog';
import { DeleteInventoryDialog } from './DeleteInventoryDialog';

interface Inventory {
  id: string;
  variantId: string;
  variantName: string;
  productName: string;
  quantity: number;
  lowStockLevel: number;
  batchNumber: string;
  warehouseId: string;
  warehouseName: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  message: string;
  data: Inventory[];
}

export function InventoriesList({ token }: { token: string }) {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['admin-inventories'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/inventories`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: pageParam, limit: 10 }
        }
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.data.length === 10 ? allPages.length + 1 : undefined;
    },
  });

  const inventories = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="py-6">
      {status === 'pending' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 pt-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : status === 'error' ? (
        <div>Error: {(error as Error).message}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {inventories.map((inventory) => (
              <Card key={inventory.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-lg">
                    {inventory.productName} - {inventory.variantName}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Quantity:</span> {inventory.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Low Stock Level:</span> {inventory.lowStockLevel}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Batch:</span> {inventory.batchNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Warehouse:</span> {inventory.warehouseName}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Link href={`/agent-dashboard/inventories/${inventory.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <EditInventoryDialog 
                      inventory={inventory} 
                      token={token} 
                      onSuccess={() => window.location.reload()} 
                    />
                    <DeleteInventoryDialog 
                      inventoryId={inventory.id} 
                      token={token} 
                      onSuccess={() => window.location.reload()} 
                    />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div ref={ref} className="h-10 flex items-center justify-center mt-6">
            {isFetchingNextPage ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading more...</span>
              </div>
            ) : hasNextPage ? (
              <Button variant="ghost" onClick={() => fetchNextPage()}>
                Load More
              </Button>
            ) : (
              <p className="text-sm text-gray-500">No more inventories to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}