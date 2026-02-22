"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Shield,
  Truck,
  Award,
  Filter,
  X,
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
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

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
  category?: string;
  tags?: string[];
  discount?: number;
  createdAt?: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Refs for carousels
  const featuredCarouselRef = useRef<HTMLDivElement>(null);
  const newArrivalsCarouselRef = useRef<HTMLDivElement>(null);
  const trendingCarouselRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Fetch user session
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

  const user = clientSession?.user || serverUser?.user;
  
  // Check user role
  const isAdmin = user?.role === "super_admin";
  const isAgent = user?.role === "fulfillment_officer";
  const isRegularUser = user?.role === "user";

  // Set returnUrl after component mounts (client-side only)
  useEffect(() => {
    setReturnUrl(window.location.pathname);
  }, []);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?limit=50`
        );
        // Add mock ratings and categories for visual appeal
        const productsWithMetadata = res.data.data.map((product: Product) => ({
          ...product,
          rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
          reviewCount: Math.floor(Math.random() * 50) + 10, // Random reviews between 10-60
          category: ["Fresh Produce", "Dairy", "Bakery", "Beverages", "Snacks"][Math.floor(Math.random() * 5)],
          tags: [["bestseller"], ["new"], ["organic"], ["local"]][Math.floor(Math.random() * 4)],
          discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(productsWithMetadata.map((p: Product) => p.category))) as string[];
        setCategories(uniqueCategories);
        
        return productsWithMetadata as Product[];
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
        return [];
      }
    },
  });

  // Filter and sort products
  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesPerishable = perishableFilter === "all" || 
      (perishableFilter === "perishable" && product.isPerishable) ||
      (perishableFilter === "non-perishable" && !product.isPerishable);
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesPerishable && matchesCategory;
  }).sort((a: Product, b: Product) => {
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return a.basePrice - b.basePrice;
      case "price-desc":
        return b.basePrice - a.basePrice;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
      case "random":
        return 0;
      default:
        return 0;
    }
  });

  // Apply random shuffle if random sort is selected
  const finalProducts = sortOption === "random" && filteredProducts 
    ? shuffleArray(filteredProducts) 
    : filteredProducts;

  // Separate products for carousels
  const newArrivals = products?.filter(p => 
    p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).slice(0, 10) || [];
  
  const trendingProducts = products?.filter(p => 
    p.tags?.includes("bestseller") || (p.rating && p.rating >= 4.5)
  ).slice(0, 10) || [];

  const featuredProducts = products?.slice(0, 10) || [];

  // Fetch cart count
  useEffect(() => {
    if (user?.token && isRegularUser) {
      const fetchCartCount = async () => {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/cart`,
            { 
              headers: { Authorization: `Bearer ${user.token}` },
              timeout: 10000
            }
          );
          
          if (res.data && res.data.data) {
            const cartItems = res.data.data?.items || [];
            cartStore.setCartCount(cartItems.length);
          }
        } catch (error: any) {
          if (error.response?.status !== 500) {
            console.error("Failed to fetch cart count", error);
          }
          cartStore.setCartCount(0);
        }
      };
      fetchCartCount();
    } else {
      cartStore.setCartCount(0);
    }
  }, [user, isRegularUser]);

  // Fetch compliance data and wishlist items (only for regular users)
  useEffect(() => {
    if (user?.token && isRegularUser) {
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
        }
      };
      fetchWishlist();
    }
  }, [user, isRegularUser]);

  // Compliance logic (only applies to regular users)
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
    if (isAdmin) return false;
    if (isAgent) return false;
    if (!user) return false;
    if (!complianceData) return false;
    if (complianceData?.status === "PENDING") return false;
    if (complianceData?.status === "DENIED") return false;
    return complianceData?.status === "APPROVED";
  };

  // Toggle wishlist function
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

  // Add to cart function
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

    if (!isRegularUser) {
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
    if (user?.token && isRegularUser) {
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

  // Carousel navigation functions
  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
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

  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl group rounded-xl">
        <CardHeader className="p-0 relative">
          <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <Image
              src={product.product_image || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-contain w-full h-full p-4 group-hover:scale-110 transition-transform duration-500"
              onError={handleImageError}
              style={{ objectFit: "contain" }}
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {/* {product.discount && product.discount > 0 && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white border-0">
                  -{product.discount}%
                </Badge>
              )} */}
              {/* {product.tags?.includes("bestseller") && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                  Bestseller
                </Badge>
              )} */}
              {/* {product.isPerishable && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Fresh
                </Badge>
              )} */}
            </div>

            {/* Wishlist button - hidden for admin/agent */}
            {isRegularUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toggleWishlist(product.id, product.name)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all z-10 group/wishlist"
                    disabled={isWishlistLoading || !isCartActionAllowed()}
                  >
                    {wishlistItems.includes(product.id) ? (
                      <HeartOff size={18} className="text-red-500" />
                    ) : (
                      <Heart size={18} className="text-gray-600 group-hover/wishlist:text-red-500" />
                    )}
                  </button>
                </TooltipTrigger>
                {!isCartActionAllowed() && (
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2 text-yellow-500" />
                      <p>{getComplianceStatusMessage()}</p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            )}

            {/* Show info icon for admin/agent instead of wishlist */}
            {(isAdmin || isAgent) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg">
                    <Info size={18} className="text-gray-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isAdmin ? "Admin view" : "Agent view"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col flex-grow p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-base line-clamp-1 group-hover:text-orange-600 transition-colors flex-1">
              {product.name}
            </h3>
            {/* {product.category && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {product.category}
              </Badge>
            )} */}
          </div>
          
          <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>

          {/* Star rating */}
          <div className="flex items-center mb-3">
            <div className="flex mr-1">
              {renderStars(product.rating || 5)}
            </div>
            <span className="text-xs text-gray-600 ml-1">
              ({product.reviewCount || 2})
            </span>
          </div>

          <div className="mt-auto">
            <div className="mb-3">
              {product.discount ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: product.currency,
                      currencyDisplay: "narrowSymbol",
                    }).format(product.basePrice * (1 - product.discount / 100))}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: product.currency,
                    }).format(product.basePrice)}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-lg text-gray-900">
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: product.currency,
                    currencyDisplay: "narrowSymbol",
                  }).format(product.basePrice)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            {/* Add to Cart button - only for regular users */}
            {isRegularUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700 h-10 text-xs font-bold transition-all hover:scale-105"
                      onClick={() => addToCart(product)}
                      disabled={!isCartActionAllowed() || isAddingToCart}
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
                {!isCartActionAllowed() && (
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2 text-yellow-500" />
                      <p>{getComplianceStatusMessage()}</p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            )}

            {/* For admin/agent, show disabled button with info */}
            {(isAdmin || isAgent) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    <Button
                      className="w-full bg-gray-400 cursor-not-allowed h-10 text-xs font-bold"
                      disabled
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {isAdmin ? "ADMIN" : "AGENT"}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isAdmin ? "Admins cannot add to cart" : "Agents cannot add to cart"}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Details button - only accessible for regular users, others see disabled */}
            {isRegularUser ? (
              <Button
                asChild
                variant="outline"
                className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 h-10 text-xs transition-all hover:scale-105"
              >
                <Link href={`/employee-dashboard/products/${product.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Link>
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-400 h-10 text-xs cursor-not-allowed"
                    disabled
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Login as employee to view details</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );

  // Carousel Component
  const ProductCarousel = ({ title, products, ref }: { title: string; products: Product[]; ref: React.RefObject<HTMLDivElement | null> }) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* <div className="p-2 bg-orange-100 rounded-lg">
            <Icon className="h-5 w-5 text-orange-600" />
          </div> */}
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-gray-300 hover:border-orange-500 hover:bg-orange-50"
            onClick={() => scrollCarousel(ref, 'left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-gray-300 hover:border-orange-500 hover:bg-orange-50"
            onClick={() => scrollCarousel(ref, 'right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] max-w-[280px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
      <TooltipProvider>
       

        {/* Features Section - Visible to all */}
        

        {/* Role-based banners */}
        {isAdmin && (
          <div className="container px-4 mx-auto py-6">
            <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 rounded-lg">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>You are viewing as Administrator. Cart and wishlist features are disabled.</p>
              </div>
            </div>
          </div>
        )}

        {isAgent && (
          <div className="container px-4 mx-auto mb-6">
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>You are viewing as Fulfillment Officer. Cart and wishlist features are disabled.</p>
              </div>
            </div>
          </div>
        )}

        {/* Compliance banners - only for regular users */}
        {isRegularUser && !user && (
          <div className="container px-4 mx-auto mb-6">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>Please login to add items to cart and wishlist.</p>
              </div>
            </div>
          </div>
        )}

        {isRegularUser && user && !complianceData && (
          <div className="container px-4 mx-auto mb-6">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>Please submit your compliance form to add items to cart.</p>
                </div>
                <Button
                  onClick={() => setShowComplianceDialog(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Compliance
                </Button>
              </div>
            </div>
          </div>
        )}

        {isRegularUser && user && complianceData?.status === "PENDING" && (
          <div className="container px-4 mx-auto mb-6">
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>
                  Your compliance form is pending admin approval. You cannot add
                  items until approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {isRegularUser && user && complianceData?.status === "DENIED" && (
          <div className="container px-4 mx-auto mb-6">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-semibold">Compliance Form Rejected</p>
                    <p className="text-sm">
                      Your compliance form was rejected. Please submit a new one.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowComplianceDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Submit New
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Carousels - Visible to all roles */}
        <div className="container px-4 mx-auto">
          {!isLoadingProducts && featuredProducts.length > 0 && (
            <ProductCarousel 
              title="Featured Products"  
              products={featuredProducts} 
              ref={featuredCarouselRef}
            />
          )}

          {!isLoadingProducts && newArrivals.length > 0 && (
            <ProductCarousel 
              title="New Arrivals" 
              products={newArrivals} 
              ref={newArrivalsCarouselRef}
            />
          )}

          {!isLoadingProducts && trendingProducts.length > 0 && (
            <ProductCarousel 
              title="Trending Now"  
              products={trendingProducts} 
              ref={trendingCarouselRef}
            />
          )}
        </div>

        {/* Main Products Section */}
        <section className="py-12 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 mb-4">
               
                All Products
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Complete Collection</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse our complete product catalog
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products by name, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-6 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Select onValueChange={setPerishableFilter} value={perishableFilter}>
                    <SelectTrigger className="w-full sm:w-40 py-6 text-[16px] border-gray-200">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="perishable">Perishable</SelectItem>
                      <SelectItem value="non-perishable">Non-Perishable</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={setSortOption} value={sortOption}>
                    <SelectTrigger className="w-full sm:w-40 py-6 text-[16px] border-gray-200">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                      <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    className="lg:hidden py-6 border-gray-200"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Categories
                  </Button>
                </div>
              </div>

             
             

              

              {/* Active filters */}
              {(searchQuery || perishableFilter !== "all" || selectedCategory !== "all") && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: {searchQuery}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSearchQuery("")}
                      />
                    </Badge>
                  )}
                  {perishableFilter !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Type: {perishableFilter}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setPerishableFilter("all")}
                      />
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Category: {selectedCategory}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedCategory("all")}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="mb-6 text-sm text-gray-600 flex items-center justify-between">
              <span>
                Showing <span className="font-semibold">{finalProducts?.length || 0}</span> of{" "}
                <span className="font-semibold">{products?.length || 0}</span> products
              </span>
              {finalProducts && finalProducts.length > 0 && (
                <span className="text-green-600">
                  {Math.ceil(finalProducts.length / 4)} pages
                </span>
              )}
            </div>

            {/* Products Grid */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="h-full border-0 shadow-md overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-56 w-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-t-lg" />
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3 p-4">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : finalProducts && finalProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {finalProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="bg-white rounded-xl shadow-md p-12 max-w-md mx-auto">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || perishableFilter !== "all" || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "No products available at the moment"}
                  </p>
                  {(searchQuery || perishableFilter !== "all" || selectedCategory !== "all") && (
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setPerishableFilter("all");
                        setSelectedCategory("all");
                      }}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>

      

        {/* Compliance Upload Dialog - only for regular users */}
        {isRegularUser && (
          <ConsentUpload
            isOpen={showComplianceDialog}
            onClose={() => setShowComplianceDialog(false)}
            onUploadSuccess={handleComplianceUploadSuccess}
            token={user?.token || ""}
            returnUrl={returnUrl}
          />
        )}
      </TooltipProvider>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .bg-grid-white {
          background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
};

export default ProductInstance;