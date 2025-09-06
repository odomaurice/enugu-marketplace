"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Heart, HeartOff, Star, Eye, ShoppingCart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Product {
  id: string;
  name: string;
  description: string;
  product_image: string;
  basePrice: number;
  currency: string;
  isPerishable: boolean;
  active: boolean;
  variants: any[];
  rating?: number;
  reviewCount?: number;
}

export default function ProductsPage() {
  const [perishableFilter, setPerishableFilter] = useState<string>("all");
  const { data: clientSession } = useSession();
  const [serverUser, setServerUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("name-asc");
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
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
    queryKey: ["products"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`,
        {
          params: {
            page: pageParam,
            limit: 12,
          },
        }
      );

      // Add mock ratings to match product-1.png
      const productsWithRatings = res.data.data.map((product: Product) => ({
        ...product,
        rating: 5, // All products have 5 stars in the image
        reviewCount: 2, // All products have 2 reviews in the image
      }));

      return { ...res.data, data: productsWithRatings };
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
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setServerUser(data);
        setIsLoading(false);
      })
      .catch((err) => {
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
          const items = res.data.data.map((item: any) => item.productId);
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
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  // Apply client-side filtering, searching, and sorting
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Apply perishable filter
    if (perishableFilter !== "all") {
      const isPerishable = perishableFilter === "perishable";
      result = result.filter(
        (product) => product.isPerishable === isPerishable
      );
    }

    // Apply search - only search product fields, not variants
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.basePrice.toString().includes(query)
      );
    }

    // Apply sorting - only use product basePrice, not variant prices
    switch (sortOption) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, perishableFilter, searchQuery, sortOption]);

  const toggleWishlist = async (productId: string) => {
    if (!user?.token) {
      toast.error("Please login to manage your wishlist");
      router.push(
        `/employee-login?returnUrl=${encodeURIComponent(
          window.location.pathname
        )}`
      );
      return;
    }

    try {
      setIsWishlistLoading(true);
      const isCurrentlyInWishlist = wishlistItems.includes(productId);

      const payload = {
        productId: isCurrentlyInWishlist ? null : productId,
        variantId: null, // Always null since we're focusing on products
      };

      if (isCurrentlyInWishlist) {
        // Find and remove the item
        const wishlistRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const itemToRemove = wishlistRes.data.data.find(
          (item: any) => item.productId === productId
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
      setWishlistItems((prev) =>
        isCurrentlyInWishlist
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );

      toast.success(
        isCurrentlyInWishlist ? "Removed from wishlist" : "Added to wishlist!"
      );
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ));
  };

  // Function to handle image errors
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = "/placeholder-product.jpg";
  };

  return (
    <div className="container py-8">
      <TooltipProvider>
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

        {status === "pending" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-full border-0 shadow-md">
                <CardHeader className="p-0">
                  <div className="relative h-60 w-full bg-gray-200 animate-pulse" />
                </CardHeader>
                <CardContent className="pt-4 space-y-2 p-5">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : status === "error" ? (
          <div>Error: {error.message}</div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No products found matching your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: Product) => (
                  <Card
                    key={product.id}
                    className="h-full flex flex-col overflow-hidden border-0 shadow-md"
                  >
                    <CardHeader className="p-0 relative">
                      <div className="relative h-60 w-full">
                        <Image
                          src={
                            product.product_image || "/placeholder-product.jpg"
                          }
                          alt={product.name}
                          fill
                          className="object-contain w-full h-full p-4 bg-white"
                          onError={handleImageError}
                          style={{ objectFit: "contain" }}
                        />
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                          aria-label="Add to wishlist"
                          disabled={isWishlistLoading}
                        >
                          {wishlistItems.includes(product.id) ? (
                            <HeartOff size={20} className="text-red-500" />
                          ) : (
                            <Heart size={20} className="text-gray-600" />
                          )}
                        </button>

                        {/* Stock status badge */}
                        {product.active && (
                          <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            In Stock
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col flex-grow p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.isPerishable
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {product.isPerishable
                            ? "Perishable"
                            : "Non-Perishable"}
                        </span>
                      </div>

                      {/* Star rating - matches product-1.png */}
                      <div className="flex items-center mb-3">
                        <div className="flex mr-1">
                          {renderStars(product.rating || 5)}
                        </div>
                        <span className="text-xs text-gray-600">
                          ({product.reviewCount || 2})
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 flex-grow">
                        {product.description}
                      </p>

                      <div className="mt-auto">
                        <div className="mb-4">
                          <span className="font-bold text-lg">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: product.currency,
                              currencyDisplay: "narrowSymbol",
                            }).format(product.basePrice)}
                          </span>
                        </div>

                        <div className="flex md:flex-row flex-col gap-2">
                          <Button
                            asChild
                            className="w-full md:w-1/2 bg-orange-700 hover:bg-orange-600 h-11 font-bold"
                          >
                            <Link href={`/products/${product.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full md:w-1/2 h-11"
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Keep the infinite loading for initial load */}
            {filteredProducts.length > 0 &&
              perishableFilter === "all" &&
              searchQuery === "" && (
                <div
                  ref={ref}
                  className="h-10 flex items-center justify-center mt-8"
                >
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
                    <p className="text-sm text-gray-500">
                      No more products to load
                    </p>
                  )}
                </div>
              )}
          </>
        )}
      </TooltipProvider>
    </div>
  );
}
