'use client';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Truck, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';

interface Order {
  id: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  trackingCode: string | null;
  placedAt: string;
  deliveredAt: string | null;
  items?: Array<{
    id: string;
    productId: string | null;
    variantId: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
    Product: {
      id: string;
      name: string;
      product_image: string;
    } | null;
    variant: {
      id: string;
      name: string;
      image: string;
    } | null;
  }>;
}

export default function OrderConfirmationPage() {
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: orders,  isError } = useQuery({
    queryKey: ['userOrders'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/all-order`, {
        headers: { 
          Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` 
        }
      });
      return res.data.data as Order[];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Get the most recent order
  const mostRecentOrder = orders?.[0];

    useEffect(() => {
      fetch('/api/auth/session')
        .then(res => res.json())
        .then(setServerUser)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, []);

  useEffect(() => {
    if (!isLoading && !isError && mostRecentOrder) {
      toast.success('Order placed successfully!', {
        description: `Your order #${mostRecentOrder.id.split('-')[0]} has been confirmed.`,
        duration: 5000,
      });
    }
  }, [mostRecentOrder, isLoading, isError]);

  const user = clientSession?.user || serverUser;

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
          <Skeleton className="h-8 w-48 mx-auto mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !mostRecentOrder) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isError ? 'Error loading order' : 'No recent orders found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isError 
              ? 'We encountered an error loading your order details.' 
              : 'You haven\'t placed any orders recently.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
            {/* <Button variant="outline" asChild>
              <Link href="/account/orders">View All Orders</Link>
            </Button> */}
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
    }).format(amount);
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-green-50 dark:bg-green-900/20 p-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Thank you for your purchase!
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-500 dark:text-gray-400">Order Number</h3>
              <p className="text-gray-900 dark:text-white">#{mostRecentOrder.id.split('-')[0].toUpperCase()}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-500 dark:text-gray-400">Date Placed</h3>
              <p className="text-gray-900 dark:text-white">{formatDate(mostRecentOrder.placedAt)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-500 dark:text-gray-400">Total Amount</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(mostRecentOrder.totalAmount, mostRecentOrder.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${mostRecentOrder.orderStatus === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                {mostRecentOrder.orderStatus === 'PENDING' ? (
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {mostRecentOrder.orderStatus === 'PENDING' ? 'Processing' : 'Shipped'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {mostRecentOrder.orderStatus === 'PENDING' 
                    ? 'Your order is being prepared' 
                    : 'Your order is on the way'}
                </p>
              </div>
            </div>
            {mostRecentOrder.trackingCode && (
              <Button variant="outline" size="sm">
                Track Order
              </Button>
            )}
          </div>
        </div>

      
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Your order has been successfully recieved and is being processed.
          </p>
        </div>

        {/* Order Total */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(mostRecentOrder.totalAmount, mostRecentOrder.currency)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
            
            {/* <Button variant="outline" asChild>
              <Link href="/account/orders">
                View All Orders
              </Link>
            </Button> */}
          </div>
        </div>

        {/* Help Section */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Need Help?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contact our customer support for assistance with your order.
              </p>
            </div>
          </div>
          <Button variant="link" className="mt-2 pl-0 text-primary" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}