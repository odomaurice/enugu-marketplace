'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EditWarehouseDialog } from './EditWarehouseDialog';
import { DeleteWarehouseDialog } from './DeleteWarehouseDialog';

interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  inventories: any[];
}

interface ApiResponse {
  message: string;
  data: Warehouse[];
}

export function WarehousesList({ token }: { token: string }) {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['agent-warehouses'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/warehouses`,
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

  const warehouses = useMemo(() => {
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
            {warehouses.map((warehouse) => (
              <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-lg">{warehouse.name}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Address:</span> {warehouse.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">City:</span> {warehouse.city}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Country:</span> {warehouse.country}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Created:</span> {new Date(warehouse.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Link href={`/agent-dashboard/warehouse/${warehouse.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <EditWarehouseDialog 
                      warehouse={warehouse} 
                      token={token} 
                      onSuccess={() => window.location.reload()} 
                    />
                    <DeleteWarehouseDialog 
                      warehouseId={warehouse.id} 
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
              <p className="text-sm text-gray-500">No more warehouses to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}