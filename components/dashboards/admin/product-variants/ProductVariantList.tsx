'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EditProductVariantDialog } from './EditProductVariantDialog';
import { DeleteProductVariantDialog } from './DeleteProductVariantDialog';

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  netWeight: number;
  price: number;
  currency: string;
  image: string;
  attribute: string | null;
  expiryDate: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    description: string;
    product_image: string;
  };
  inventory: any | null;
}

interface ApiResponse {
  message: string;
  data: ProductVariant[];
}

export function ProductVariantsList({ token }: { token: string }) {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['admin-product-variants'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/product-variants`,
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

  const variants = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="py-6">
      {status === 'pending' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {variants.map((variant) => (
              <Card key={variant.id} className="hover:shadow-lg transition-shadow w-[300px]">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={variant.image || '/placeholder-product.jpg'}
                      alt={variant.name}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg">{variant.name}</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Product:</span> {variant.product.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Price:</span> {formatCurrency(variant.price, variant.currency)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Net Weight:</span> {variant.netWeight} kg
                  </p>
                 
                   
{variant.attribute && (
  <div className="text-sm text-gray-600">
    <span className="font-medium">Attributes:</span>
    <div className="mt-1">
      {(() => {
        try {
          // Handle both stringified JSON and already-parsed objects
          const attributes = typeof variant.attribute === 'string' 
            ? JSON.parse(variant.attribute) 
            : variant.attribute;
          
          // Ensure we have an object before trying to render
          if (attributes && typeof attributes === 'object' && !Array.isArray(attributes)) {
            return Object.entries(attributes).map(([key, value]) => (
              <div key={key} className="flex gap-1">
                <span className="font-medium capitalize">{key}:</span>
                <span>{String(value)}</span>
              </div>
            ));
          }
          return <span className="ml-1">{String(variant.attribute)}</span>;
        } catch (e) {
          return <span className="ml-1">{String(variant.attribute)}</span>;
        }
      })()}
    </div>
  </div>
)}
               
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">SKU:</span> {variant.sku}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Link href={`/admin-dashboard/product-variants/${variant.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <EditProductVariantDialog 
                      variant={variant} 
                      token={token} 
                      onSuccess={() => window.location.reload()} 
                    />
                    <DeleteProductVariantDialog 
                      variantId={variant.id} 
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
              <p className="text-sm text-gray-500">No more variants to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}