'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  placedAt: string;
}

const formatCurrency = (value: number | undefined) => {
  const numValue = value || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(numValue);
};

export function OrdersList() {
  const { data: clientSession } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { ref, inView } = useInView();

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(setServerUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const user = clientSession?.user || serverUser;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['user-orders', user?.token], // Include token in query key
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const token = user?.token;
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/all-order`, {
          params: { page: pageParam, limit: 10 },
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        });
        return res.data.data as Order[];
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          toast.error('Session expired. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('token');
        } else {
          toast.error('Failed to load orders');
        }
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!user?.token, // Only enable query when token is available
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Use a Set to ensure unique orders
  const uniqueOrders = Array.from(new Map(
    data?.pages.flat().map(order => [order.id, order])
  ).values());

  if (status === 'pending') {
    return (
      <div className="space-y-4 p-6 mt-12">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-8">
        <p className="text-lg mb-4">Error loading orders</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  if (uniqueOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto max-w-md">
          <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No orders yet
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            You haven't placed any orders. Start shopping to see your orders here.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/employee-dashboard/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 mt-12 px-6">
      {uniqueOrders.map((order) => (
        <Card key={order.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  #{order.id.split('-')[0].toUpperCase()}
                </span>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {format(new Date(order.placedAt), 'MMM dd, yyyy')}
                </span>
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/employee-dashboard/orders/${order.id}`}>View Details</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      order.orderStatus === 'DELIVERED'
                        ? 'bg-green-500'
                        : order.orderStatus === 'CANCELLED'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <p className="capitalize font-medium">
                    {order.orderStatus.toLowerCase()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Payment</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-green-500'
                        : order.paymentStatus === 'FAILED'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <p className="capitalize font-medium">
                    {order.paymentStatus.toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="font-bold text-lg">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div ref={ref} className="flex justify-center py-4">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more orders...
          </div>
        ) : hasNextPage ? (
          <Button variant="ghost" onClick={() => fetchNextPage()}>
            Load More
          </Button>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You've reached the end of your orders
          </p>
        )}
      </div>
    </div>
  );
}