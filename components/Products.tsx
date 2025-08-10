'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Heart, HeartOff } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  product_image: string;
  basePrice: number;
  currency: string;
  isPerishable: boolean;
  variants: {
    price: number;
  }[];
}

export default function ProductsPage() {
  const [perishableFilter, setPerishableFilter] = useState<string>('all');
   const { data: clientSession } = useSession();
    const [serverUser, setServerUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('name-asc');
const [isWishlistLoading, setIsWishlistLoading] = useState(false);
const [wishlistItems, setWishlistItems] = useState<string[]>([]);
const [isInWishlist, setIsInWishlist] = useState(false);
  const { ref, inView } = useInView();
  const router = useRouter();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, {
        params: { 
          page: pageParam,
          limit: 12,
        }
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < 12) return undefined;
      return allPages.length + 1;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
      fetch('/api/auth/session')
        .then(res => res.json())
        .then(data => {
          setServerUser(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Session error:", err);
          setIsLoading(false);
        });
    }, []);
  
    const user = clientSession?.user || serverUser;

    useEffect(() => {
  if (user?.token) {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const items = res.data.data.map((item: any) => item.productId || item.variantId);
        setWishlistItems(items);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      }
    };
    fetchWishlist();
  }
}, [user]);

  // Combine all pages of products
  const allProducts = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  // Apply client-side filtering, searching, and sorting
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Apply perishable filter
    if (perishableFilter !== 'all') {
      const isPerishable = perishableFilter === 'perishable';
      result = result.filter(product => product.isPerishable === isPerishable);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.variants.some((variant: { price: { toString: () => string | string[]; }; }) => 
          variant.price.toString().includes(query)
        )
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => {
          const aPrice = Math.min(...a.variants.map((v: { price: any; }) => v.price));
          const bPrice = Math.min(...b.variants.map((v: { price: any; }) => v.price));
          return aPrice - bPrice;
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          const aPrice = Math.min(...a.variants.map((v: { price: any; }) => v.price));
          const bPrice = Math.min(...b.variants.map((v: { price: any; }) => v.price));
          return bPrice - aPrice;
        });
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, perishableFilter, searchQuery, sortOption]);
const toggleWishlist = async (productId: string, variantId?: string) => {
  if (!user?.token) {
    toast.error('Please login to manage your wishlist');
    router.push(`/employee-login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
    return;
  }

  try {
    setIsWishlistLoading(true);
    const itemId = variantId || productId;
    const isCurrentlyInWishlist = wishlistItems.includes(itemId);

    const payload = {
      productId: isCurrentlyInWishlist ? null : productId,
      variantId: isCurrentlyInWishlist ? null : variantId || null
    };

    if (isCurrentlyInWishlist) {
      // Find and remove the item
      const wishlistRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const itemToRemove = wishlistRes.data.data.find((item: any) => 
        item.productId === productId || item.variantId === variantId
      );
      
      if (itemToRemove) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist/remove-from-wishlist/${itemToRemove.id}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
    } else {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist/add-to-wishlist`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    }

    // Update local state
    setWishlistItems(prev => 
      isCurrentlyInWishlist
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
    
    toast.success(isCurrentlyInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
  } catch (error) {
    toast.error('Failed to update wishlist');
  } finally {
    setIsWishlistLoading(false);
  }
};


  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          placeholder="Search by product name, description, or price..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64"
        />

        <Select onValueChange={setPerishableFilter} value={perishableFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="perishable">Perishable</SelectItem>
            <SelectItem value="non-perishable">Non Perishable</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setSortOption} value={sortOption}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {status === 'pending' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-0">
                <Skeleton className="h-48 w-full rounded-t-lg" />
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : status === 'error' ? (
        <div>Error: {error.message}</div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: Product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                      <Image
                        src={product.product_image || '/placeholder-product.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover rounded-t-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.isPerishable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {product.isPerishable ? 'Perishable' : 'Non-Perishable'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                    <div className="mt-3">
                      <span className="font-medium">
                        From {new Intl.NumberFormat('en-NG', {
                          style: 'currency',
                          currency: product.currency,
                        }).format(
                          Math.min(...product.variants.map(v => v.price))
                        )}
                      </span>
                    </div>
                    <Button asChild className="w-full mt-4 bg-orange-700 hover:bg-orange-600">
                      <Link href={`/products/${product.id}`}>View Product Variants</Link>
                    </Button>
                      <Button 
  variant="outline" 
  className="w-full mt-2" 
  onClick={() => toggleWishlist(product.id)}
  disabled={isWishlistLoading}
>
  {wishlistItems.includes(product.id) ? (
    <>
      <HeartOff className="mr-2 h-4 w-4" />
      Remove from Wishlist
    </>
  ) : (
    <>
      <Heart className="mr-2 h-4 w-4" />
      Add to Wishlist
    </>
  )}
</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Keep the infinite loading for initial load */}
          {filteredProducts.length > 0 && perishableFilter === 'all' && searchQuery === '' && (
            <div ref={ref} className="h-10 flex items-center justify-center mt-8">
              {isFetchingNextPage ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary rounded-full animate-spin" />
                  <span>Loading more products...</span>
                </div>
              ) : hasNextPage ? (
                <Button variant="outline" onClick={() => fetchNextPage()}>
                  Load More
                </Button>
              ) : (
                <p className="text-sm text-gray-500">No more products to load</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}