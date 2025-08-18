'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Truck, CreditCard, Calendar, Package, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  currency: string;
  productId: string | null;
  variantId: string | null;
  Product: {
    id: string;
    name: string;
    product_image: string;
    description: string;
  } | null;
  variant: {
    id: string;
    name: string;
    image: string;
    price: number;
  } | null;
}

interface OrderDetails {
  id: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  trackingCode: string | null;
  placedAt: string;
  deliveredAt: string | null;
  items: OrderItem[];
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

const formatCurrency = (amount: number, currency: string = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount);
};

export default function SingleOrderPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { data: clientSession } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(setServerUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const user = clientSession?.user || serverUser;

  const { data: order, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/single-order`, {
          params: { order_id: orderId },
          headers: { 
            Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` 
          }
        });
        return res.data.data as OrderDetails;
      } catch (error) {
        throw new Error('Failed to fetch order details');
      }
    },
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load order details');
      setShouldRedirect(true);
    }
  }, [isError]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/employee-dashboard/orders');
    }
  }, [shouldRedirect, router]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null; // The redirect will happen via useEffect
  }

  const getItemImage = (item: OrderItem) => {
    return item.variant?.image || item.Product?.product_image || '/placeholder-product.jpg';
  };

  const getItemName = (item: OrderItem) => {
    return item.variant?.name || item.Product?.name || 'Unknown Product';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <Package className="h-4 w-4" /> },
      PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: <Package className="h-4 w-4" /> },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: <Truck className="h-4 w-4" /> },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: <Package className="h-4 w-4" /> },
    };

    const { color, icon } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: <Package className="h-4 w-4" /> };

    return (
      <Badge className={`${color} capitalize`}>
        <span className="mr-1">{icon}</span>
        {status.toLowerCase()}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      PAID: { color: 'bg-green-100 text-green-800', icon: <CreditCard className="h-4 w-4" /> },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <CreditCard className="h-4 w-4" /> },
      FAILED: { color: 'bg-red-100 text-red-800', icon: <CreditCard className="h-4 w-4" /> },
    };

    const { color, icon } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: <CreditCard className="h-4 w-4" /> };

    return (
      <Badge className={`${color} capitalize`}>
        <span className="mr-1">{icon}</span>
        {status.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => router.push('/employee-dashboard/orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Order #{order.id.split('-')[0].toUpperCase()}
              {getStatusBadge(order.orderStatus)}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(order.placedAt), 'MMMM do, yyyy h:mm a')}
            </p>
          </div>
          {order.trackingCode && (
            <Button variant="outline">
              <Truck className="h-4 w-4 mr-2" />
              Track Order: {order.trackingCode}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={getItemImage(item)}
                          alt={getItemName(item)}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{getItemName(item)}</h3>
                        {item.Product?.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {item.Product.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.total, item.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(item.unitPrice, item.currency)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.address ? (
                  <div className="space-y-2">
                    <p>{order.address.street}</p>
                    <p>
                      {order.address.city}, {order.address.state} {order.address.zipCode}
                    </p>
                    <p>{order.address.country}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No shipping address available</p>
                )}
              </CardContent>
            </Card> */}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  {getStatusBadge(order.orderStatus)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment</span>
                  {getPaymentBadge(order.paymentStatus)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Placed</span>
                  <span>{format(new Date(order.placedAt), 'MMM dd, yyyy')}</span>
                </div>
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date Delivered</span>
                    <span>{format(new Date(order.deliveredAt), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span>-{formatCurrency(0, order.currency)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  If you have any questions about your order, please contact our customer support.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}