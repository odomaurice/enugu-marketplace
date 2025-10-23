"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Star,
  HeartOff,
  AlertCircle,
  Info,
  Upload,
  Eye,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ConsentUpload from "@/components/ConsentUpload";
import { cartStore } from "@/lib/cart-store";

interface Product {
  id: string;
  name: string;
  description: string;
  product_image: string;
  basePrice: number;
  currency: string;
  isPerishable: boolean;
  active: boolean;
  rating?: number;
  reviewCount?: number;
}

// Helper function to shuffle array randomly
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const ProductInstance = () => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { data: clientSession } = useSession();
  const [serverUser, setServerUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [showComplianceDialog, setShowComplianceDialog] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [perishableFilter, setPerishableFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("random");
  
  const router = useRouter();

  // Set returnUrl after component mounts (client-side only)
  useEffect(() => {
    setReturnUrl(window.location.pathname);
  }, []);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?limit=20`
        );
        // Add mock ratings to match the image
        const productsWithRatings = res.data.data.map((product: Product) => ({
          ...product,
          rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
          reviewCount: Math.floor(Math.random() * 50) + 10, // Random reviews between 10-60
        }));
        return productsWithRatings as Product[];
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
        return [];
      }
    },
  });

  // Filter and sort products
  const filteredProducts = products?.filter((product: Product) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Perishable filter
    const matchesPerishable = perishableFilter === "all" || 
      (perishableFilter === "perishable" && product.isPerishable) ||
      (perishableFilter === "non-perishable" && !product.isPerishable);
    
    return matchesSearch && matchesPerishable;
  }).sort((a: Product, b: Product) => {
    // Sort products
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return a.basePrice - b.basePrice;
      case "price-desc":
        return b.basePrice - a.basePrice;
      case "random":
        // For random sorting, we'll handle it after with shuffleArray
        return 0;
      default:
        return 0;
    }
  });

  // Apply random shuffle if random sort is selected
  const finalProducts = sortOption === "random" && filteredProducts 
    ? shuffleArray(filteredProducts) 
    : filteredProducts;

  // Fetch user session (same as your products page)
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setServerUser(data);
        setIsLoadingUser(false);
      })
      .catch((err) => {
        console.error("Session error:", err);
        setIsLoadingUser(false);
      });
  }, []);

  const user = clientSession?.user || serverUser;

  // Check if user is admin
  const isAdmin = user?.role === "super_admin";
  const isAgent = user?.role === "fulfillment_officer";

  // Fixed fetchCartCount with better error handling
  useEffect(() => {
    if (user?.token) {
      const fetchCartCount = async () => {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/cart`,
            { 
              headers: { Authorization: `Bearer ${user.token}` },
              timeout: 10000 // 10 second timeout
            }
          );
          
          // Check if response has the expected structure
          if (res.data && res.data.data) {
            const cartItems = res.data.data?.items || [];
            cartStore.setCartCount(cartItems.length);
          }
        } catch (error: any) {
          // Don't show error toast for 500 errors to avoid spamming users
          if (error.response?.status !== 500) {
            console.error("Failed to fetch cart count", error);
          }
          // Set cart count to 0 on error
          cartStore.setCartCount(0);
        }
      };
      fetchCartCount();
    } else {
      // If no user, set cart count to 0
      cartStore.setCartCount(0);
    }
  }, [user]);

  // Fetch compliance data and wishlist items when user changes (only for non-admins)
  useEffect(() => {
    if (user?.token && !isAdmin && !isAgent) {
      // Fetch compliance data with error handling
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-compliance`, {
          headers: { Authorization: `Bearer ${user.token}` },
          timeout: 10000
        })
        .then((response) => {
          setComplianceData(response.data.data);
        })
        .catch((error) => {
          console.error("Failed to fetch compliance data:", error);
          setComplianceData(null);
        });

      // Fetch wishlist items with error handling
      const fetchWishlist = async () => {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist`,
            { 
              headers: { Authorization: `Bearer ${user.token}` },
              timeout: 10000
            }
          );
          const items = res.data.data.map((item: any) => item.productId);
          setWishlistItems(items);
        } catch (error) {
          console.error("Failed to fetch wishlist", error);
          // Don't show error toast for wishlist failures
        }
      };
      fetchWishlist();
    }
  }, [user, isAdmin, isAgent]);

  // Compliance logic from your product detail page (only for non-admins)
  const getComplianceStatusMessage = () => {
    if (isAdmin) return "Admin users cannot add items to cart";
    if (isAgent) return "Agents cannot add items to cart";
    if (!user) return "Please login to access this feature";
    if (!complianceData)
      return "Submit compliance form to enable cart features";
    if (complianceData?.status === "PENDING")
      return "Compliance pending admin approval";
    if (complianceData?.status === "DENIED")
      return "Your compliance form was rejected. Please submit a new one.";
    return "";
  };

  const isCartActionAllowed = () => {
    if (isAdmin) return false; // Admins cannot add to cart
    if (isAgent) return false;
    if (!user) return false;
    if (!complianceData) return false;
    if (complianceData?.status === "PENDING") return false;
    if (complianceData?.status === "DENIED") return false;
    return complianceData?.status === "APPROVED";
  };

  // Toggle wishlist function with compliance checks (disabled for admins)
  const toggleWishlist = async (productId: string, productName: string) => {
    if (isAdmin) {
      toast.info("Admin users cannot add items to wishlist");
      return;
    }

    if (isAgent) {
      toast.info("Agents cannot add items to wishlist");
      return;
    }

    if (!user) {
      toast.error("Please login to manage wishlist");
      router.push(
        `/employee-login?returnUrl=${encodeURIComponent(
          window.location.pathname
        )}`
      );
      return;
    }

    if (!complianceData) {
      setShowComplianceDialog(true);
      toast.error("Please submit your compliance form first");
      return;
    }

    if (complianceData?.status === "PENDING") {
      toast.error("Your compliance form is pending admin approval");
      return;
    }

    if (complianceData?.status === "DENIED") {
      setShowComplianceDialog(true);
      toast.error(
        "Your compliance form was rejected. Please submit a new one."
      );
      return;
    }

    try {
      setIsWishlistLoading(true);
      const isCurrentlyInWishlist = wishlistItems.includes(productId);

      const payload = {
        productId: isCurrentlyInWishlist ? null : productId,
        variantId: null,
      };

      if (isCurrentlyInWishlist) {
        // Find and remove the item
        const wishlistRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist`,
          { 
            headers: { Authorization: `Bearer ${user.token}` },
            timeout: 10000
          }
        );
        const itemToRemove = wishlistRes.data.data.find(
          (item: any) => item.productId === productId
        );

        if (itemToRemove) {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist/remove-from-wishlist/${itemToRemove.id}`,
            { 
              headers: { Authorization: `Bearer ${user.token}` },
              timeout: 10000
            }
          );
        }
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist/add-to-wishlist`,
          payload,
          { 
            headers: { Authorization: `Bearer ${user.token}` },
            timeout: 10000
          }
        );
      }

      // Update local state
      setWishlistItems((prev) =>
        isCurrentlyInWishlist
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );

      toast.success(
        isCurrentlyInWishlist
          ? `${productName} removed from wishlist`
          : `${productName} added to wishlist!`
      );
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Add to cart function with compliance checks (disabled for admins)
  const addToCart = async (product: Product) => {
    if (isAdmin) {
      toast.info("Admin users cannot add items to cart");
      return;
    }

    if (isAgent) {
      toast.info("Agents cannot add items to cart");
      return;
    }

    if (!user) {
      toast.error("Please login to add items to cart");
      router.push(
        `/employee-login?returnUrl=${encodeURIComponent(
          window.location.pathname
        )}`
      );
      return;
    }

    if (user.role !== "user") {
      toast.error("Only employees can add products to cart");
      return;
    }

    if (!complianceData) {
      setShowComplianceDialog(true);
      toast.error("Please submit your compliance form first");
      return;
    }

    if (complianceData?.status === "PENDING") {
      toast.error("Your compliance form is pending admin approval");
      return;
    }

    if (complianceData?.status === "DENIED") {
      setShowComplianceDialog(true);
      toast.error(
        "Your compliance form was rejected. Please submit a new one."
      );
      return;
    }

    const payload = { productId: product.id, quantity: 1 };
    let toastId: string | number | undefined;

    try {
      setIsAddingToCart(true);
      toastId = toast.loading("Adding to cart...");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/cart/add-to-cart`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Update global cart count
        cartStore.incrementCartCount();
        
        toast.success("Item added to cart!");
        setTimeout(() => router.push("/employee-dashboard/cart"), 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart", {
        id: toastId,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleComplianceUploadSuccess = () => {
    setShowComplianceDialog(false);
    // Refetch compliance data after successful upload
    if (user?.token) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-compliance`, {
          headers: { Authorization: `Bearer ${user.token}` },
          timeout: 10000
        })
        .then((response) => {
          setComplianceData(response.data.data);
          toast.success("Compliance form submitted successfully!");
        })
        .catch((error) => {
          console.error("Failed to fetch compliance data:", error);
          setComplianceData(null);
        });
    }
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={14}
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <TooltipProvider>
        {/* Products Section */}
        <section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-green-700 mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                Featured Products
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Most Popular Choices</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our employees' favorite meals and snacks, carefully curated for your satisfaction.
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select onValueChange={setPerishableFilter} value={perishableFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="perishable">Perishable</SelectItem>
                  <SelectItem value="non-perishable">Non-Perishable</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={setSortOption} value={sortOption}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            {/* <div className="mb-6 text-sm text-gray-600">
              Showing {finalProducts?.length || 0} of {products?.length || 0} products
              {(searchQuery || perishableFilter !== "all") && " (filtered)"}
            </div> */}

            {/* Compliance Status Banners - Only show for non-admin users */}
            {!user && !isAdmin && !isAgent && user && !complianceData && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>Please submit your compliance form to add items to cart.</p>
                </div>
              </div>
            )}

            {!isAdmin && !isAgent && user && complianceData?.status === "PENDING" && (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>
                    Your compliance form is pending admin approval. You cannot add
                    items until approved.
                  </p>
                </div>
              </div>
            )}

            {!isAdmin && !isAgent && user && complianceData?.status === "DENIED" && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-semibold">Compliance Form Rejected</p>
                    <p>
                      Your compliance form was rejected. Please submit a new one.
                    </p>
                    <Button
                      onClick={() => setShowComplianceDialog(true)}
                      className="mt-2 bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Submit New Compliance
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Admin notice banner */}
            {isAdmin && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg">
                <div className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  <p>Admin view: Cart and wishlist features are disabled for Admins.</p>
                </div>
              </div>
            )}

            {isAgent && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg">
                <div className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  <p>Agent view: Cart and wishlist features are disabled.</p>
                </div>
              </div>
            )}

            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="h-full border-0 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full bg-gray-200 animate-pulse rounded-t-lg" />
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2 p-4">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <div className="h-9 bg-gray-200 rounded animate-pulse w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : finalProducts && finalProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {finalProducts.map((product: Product) => (
                  <Card
                    key={product.id}
                    className="h-full flex flex-col overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg group"
                  >
                    <CardHeader className="p-0 relative">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={
                            product.product_image || "/placeholder-product.jpg"
                          }
                          alt={product.name}
                          fill
                          className="object-contain w-full h-full p-4 bg-white group-hover:scale-105 transition-transform duration-300"
                          onError={handleImageError}
                          style={{ objectFit: "contain" }}
                        />

                        {/* Stock status badge */}
                        {product.active && (
                          <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            In Stock
                          </div>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() =>
                                toggleWishlist(product.id, product.name)
                              }
                              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors z-10"
                              aria-label="Add to wishlist"
                              disabled={
                                isWishlistLoading ||
                                !isCartActionAllowed() ||
                                isAdmin ||
                                isAgent
                              }
                            >
                              {wishlistItems.includes(product.id) ? (
                                <HeartOff size={18} className="text-red-500" />
                              ) : (
                                <Heart size={18} className="text-gray-600" />
                              )}
                            </button>
                          </TooltipTrigger>
                          {(!isCartActionAllowed() || isAdmin || isAgent) && (
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="flex items-center">
                                <Info className="h-4 w-4 mr-2 text-yellow-500" />
                                <p>{getComplianceStatusMessage()}</p>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3 flex flex-col flex-grow p-4">
                      <h3 className="font-bold text-base mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>

                      {/* Star rating */}
                      <div className="flex items-center mb-2">
                        <div className="flex mr-1">
                          {renderStars(product.rating || 5)}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">
                          ({product.reviewCount || 2})
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className="mb-3">
                          <span className="font-bold text-lg text-gray-900">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: product.currency,
                              currencyDisplay: "narrowSymbol",
                            }).format(product.basePrice)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <div className="flex gap-2 w-full">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1">
                              <Button
                                className="w-full bg-orange-600 hover:bg-orange-700 h-9 text-xs font-bold transition-colors"
                                onClick={() => addToCart(product)}
                                disabled={
                                  !isCartActionAllowed() ||
                                  isAddingToCart ||
                                  isAdmin ||
                                  isAgent
                                }
                              >
                                {isAddingToCart ? (
                                  <>
                                    <span className="animate-spin mr-1">⏳</span>
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-3 w-3 mr-1" />
                                    ADD TO CART
                                  </>
                                )}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {(!isCartActionAllowed() || isAdmin || isAgent) && (
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="flex items-center">
                                <Info className="h-4 w-4 mr-2 text-yellow-500" />
                                <p>{getComplianceStatusMessage()}</p>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>

                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 h-9 text-xs transition-colors"
                        >
                          <Link href={`/employee-dashboard/products/${product.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || perishableFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "No products available at the moment"}
                  </p>
                  {(searchQuery || perishableFilter !== "all") && (
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setPerishableFilter("all");
                      }}
                      variant="outline"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-orange-50">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to place your order?</h2>
              <p className="text-lg text-gray-700 mb-8">
                Browse our complete menu and discover all the delicious options available for delivery to your workplace.
              </p>
              <Button
                asChild
                className="bg-orange-600 hover:bg-orange-700 py-4 px-6 text-base font-semibold"
                size="lg"
              >
                <Link href="/employee-dashboard/products">
                  View All Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Only show compliance upload for non-admin users */}
        {!isAdmin && !isAgent && (
          <ConsentUpload
            isOpen={showComplianceDialog}
            onClose={() => setShowComplianceDialog(false)}
            onUploadSuccess={handleComplianceUploadSuccess}
            token={user?.token || ""}
            returnUrl={returnUrl}
          />
        )}
      </TooltipProvider>
    </div>
  );
};

export default ProductInstance;