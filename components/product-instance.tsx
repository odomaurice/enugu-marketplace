"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

interface Product {
  id: string;
  name: string;
  description: string;
  product_image: string;
  basePrice: number;
  currency: string;
  isPerishable: boolean;
  active: boolean; // Added active property for stock status
  rating?: number;
  reviewCount?: number;
}

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
  const router = useRouter();

  // Set returnUrl after component mounts (client-side only)
  useEffect(() => {
    setReturnUrl(window.location.pathname);
  }, []);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?limit=4`
      );
      // Add mock ratings to match the image
      const productsWithRatings = res.data.data.map((product: Product) => ({
        ...product,
        rating: 5, // All products have 5 stars in the image
        reviewCount: 2, // All products have 2 reviews in the image
      }));
      return productsWithRatings as Product[];
    },
  });

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
  const isAdmin = user?.role === "admin";

  // Fetch compliance data and wishlist items when user changes (only for non-admins)
  useEffect(() => {
    if (user?.token && !isAdmin) {
      // Fetch compliance data
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-compliance`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((response) => {
          setComplianceData(response.data.data);
        })
        .catch((error) => {
          console.error("Failed to fetch compliance data:", error);
          setComplianceData(null);
        });

      // Fetch wishlist items
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
  }, [user, isAdmin]);

  // Compliance logic from your product detail page (only for non-admins)
  const getComplianceStatusMessage = () => {
    if (isAdmin) return "Admin users cannot add items to cart";
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
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Item added to cart!", {
          id: toastId,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
        });
        // Redirect to cart page after 2 seconds (same as product detail page)
        setTimeout(() => router.push("/cart"), 2000);
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
        {/* Compliance Status Banners - Only show for non-admin users */}
        {!isAdmin && user && !complianceData && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>Please submit your compliance form to add items to cart.</p>
            </div>
          </div>
        )}

        {!isAdmin && user && complianceData?.status === "PENDING" && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>
                Your compliance form is pending admin approval. You cannot add
                items until approved.
              </p>
            </div>
          </div>
        )}

        {!isAdmin && user && complianceData?.status === "DENIED" && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
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
          <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              <p>Admin view: Cart and wishlist features are disabled.</p>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold my-8">Employee Food Ordering</h1>
          <p className="text-md text-gray-600 max-w-2xl mx-auto">
            Order fresh food products for your workplace. Available exclusively
            for registered employees.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6">Featured Products</h2>
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.map((product) => (
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

                      {/* Stock status badge */}
                      {product.active && (
                        <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          In Stock
                        </div>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() =>
                              toggleWishlist(product.id, product.name)
                            }
                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                            aria-label="Add to wishlist"
                            disabled={
                              isWishlistLoading ||
                              !isCartActionAllowed() ||
                              isAdmin
                            }
                          >
                            {wishlistItems.includes(product.id) ? (
                              <HeartOff size={20} className="text-red-500" />
                            ) : (
                              <Heart size={20} className="text-gray-600" />
                            )}
                          </button>
                        </TooltipTrigger>
                        {(!isCartActionAllowed() || isAdmin) && (
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
                  <CardContent className="pt-4 flex flex-col flex-grow p-5">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>

                    {/* Star rating - matches product-1.png */}
                    <div className="flex items-center mb-3">
                      <div className="flex mr-1">
                        {renderStars(product.rating || 5)}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({product.reviewCount || 2})
                      </span>
                    </div>

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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full md:w-1/2">
                              <Button
                                className="w-full bg-orange-700 hover:bg-orange-600 h-11 font-bold"
                                onClick={() => addToCart(product)}
                                disabled={
                                  !isCartActionAllowed() ||
                                  isAddingToCart ||
                                  isAdmin
                                }
                              >
                                {isAddingToCart ? (
                                  <>
                                    <span className="animate-spin mr-2">
                                      ⏳
                                    </span>
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    ADD TO CART
                                  </>
                                )}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {(!isCartActionAllowed() || isAdmin) && (
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
                          className="md:w-1/2 w-full border-orange-500 text-orange-500 hover:bg-orange-50 h-11"
                        >
                          <Link href={`/products/${product.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <Button
            asChild
            className="bg-orange-800 w-full md:max-w-lg py-4 hover:bg-orange-700 text-md"
          >
            <Link href="/products">View All Products</Link>
          </Button>
        </div>

        {/* Only show compliance upload for non-admin users */}
        {!isAdmin && (
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
