'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  product_image: string;
  basePrice: number;
  currency: string;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
}

interface ApiResponse {
  message: string;
  data: Product[];
}

const placeholderImages = {
  tomatoes: '/tomato.jpg',
  vegetable: '/vegetables.jpg',
  garri: '/garri.jpeg',
  beans: '/beans.jpg',
  rice: '/rice.jpeg',
  pepper: '/pepper.jpg',
};

export function ProductsList({ token }: { token: string }) {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['admin-products'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: pageParam, limit: 10 }
        }
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Only fetch next page if we got a full page of results
      return lastPage.data.length === 10 ? allPages.length + 1 : undefined;
    },
  });

  // Create a flat array of unique products
  const products = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const getProductImage = (productName: string) => {
    const normalizedName = productName.toLowerCase();
    if (normalizedName.includes('tomato')) return placeholderImages.tomatoes;
    if (normalizedName.includes('vegetable')) return placeholderImages.vegetable;
    if (normalizedName.includes('garri')) return placeholderImages.garri;
    if (normalizedName.includes('bean')) return placeholderImages.beans;
    if (normalizedName.includes('rice')) return placeholderImages.rice;
    if (normalizedName.includes('pepper')) return placeholderImages.pepper;
    return placeholderImages.tomatoes; // default
  };

  return (
    <div className=" py-6">
      {status === 'pending' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="space-y-2 pt-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
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
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow w-[320px]">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={getProductImage(product.name)}
                      alt={product.name}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={products.indexOf(product) < 2}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-2">
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: product.currency,
                      }).format(product.basePrice)}
                    </span>
                  </div>
                  {product.variants.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium">Variants:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.variants.map(variant => (
                          <span 
                            key={variant.id} 
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            {variant.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="">
                    
                 <Link href={`/admin-dashboard/products/${product.id}`} className='w-full'>
                    <Button variant="outline"  className='w-full bg-orange-700 text-white'>
                    View Details
                    </Button>
                </Link>
                  {/* <Button size="sm">Add to Inventory</Button> */}
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
              <p className="text-sm text-gray-500">No more products to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}