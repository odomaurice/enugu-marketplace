'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EditCategoryDialog } from './EditCategoryDialog';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';

interface Category {
  id: string;
  name: string;
  slug: string;
   parentId?: string | number;
 
  products: Array<{
    id: string;
    name: string;
  }>;
  parent: null | {
    id: string;
    name: string;
  };
  children: Array<{
    id: string;
    name: string;
  }>;
}

interface ApiResponse {
  message: string;
  data: Category[];
}

export function CategoriesList({ token }: { token: string }) {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['admin-categories'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/categories`,
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

  const categories = useMemo(() => {
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
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.slug}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Parent:</span>{' '}
                      {category.parent?.name || 'None'}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subcategories:</span>{' '}
                      {category.children.length || 'None'}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Products:</span>{' '}
                      {category.products.length}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Link href={`/agent-dashboard/categories/${category.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <EditCategoryDialog 
                      category={category} 
                      token={token} 
                      onSuccess={() => window.location.reload()} 
                    />
                    <DeleteCategoryDialog 
                      categoryId={category.id} 
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
              <p className="text-sm text-gray-500">No more categories to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}