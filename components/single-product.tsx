"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Heart,
  HeartOff,
  AlertCircle,
  Info,
  ShoppingCart,
  Upload,
  Star,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ConsentUpload from "./ConsentUpload";

interface ProductDetails {
  id: string;
  name: string;
  description: string;
  product_image: string;
  basePrice: number;
  currency: string;
  isPerishable: boolean;
  active: boolean; // Added active property for stock status
  variants: any[];
  rating?: number;
  reviewCount?: number;
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showComplianceDialog, setShowComplianceDialog] = useState(false);
  const [complianceData, setComplianceData] = useState<any>(null);

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

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (user?.token && !isAdmin) {
      // Fetch compliance data from endpoint instead of session
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-compliance`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((response) => {
          setComplianceData(response.data.data);
        })
        .catch((error) => {
          console.error("Failed to fetch compliance data:", error);
          // If no compliance data exists, set to null
          setComplianceData(null);
        });

      // Check wishlist status
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          const isWishlisted = res.data.data.some(
            (item: any) => item.productId === params.id
          );
          setIsInWishlist(isWishlisted);
        });
    }
  }, [user, params.id, isAdmin]);

  const { data: product } = useQuery({
    queryKey: ["product", params.id],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product?product_id=${params.id}`
      );
      // Add mock ratings to match product-1.png
      const productWithRating = {
        ...res.data.data,
        rating: 5, // All products have 5 stars in the image
        reviewCount: 2, // All products have 2 reviews in the image
      };
      return productWithRating as ProductDetails;
    },
  });

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

  const handleAddToCart = async () => {
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

    const payload = { productId: params.id, quantity };
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

  const toggleWishlist = async () => {
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
      const payload = {
        productId: isInWishlist ? null : params.id,
        variantId: null,
      };

      if (isInWishlist) {
        const wishlistRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const itemToRemove = wishlistRes.data.data.find(
          (item: any) => item.productId === params.id
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

      setIsInWishlist(!isInWishlist);
      toast.success(
        isInWishlist ? "Removed from wishlist" : "Added to wishlist!"
      );
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleComplianceUploadSuccess = () => {
    setShowComplianceDialog(false);
    toast.success("Compliance form submitted successfully!");
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

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

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

  if (status === "loading")
    return <div className="container py-8">Loading...</div>;

  return (
    <div className="container py-8">
      <TooltipProvider>
        {/* Admin notice banner */}
        {isAdmin && (
          <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              <p>Admin view: Cart and wishlist features are disabled.</p>
            </div>
          </div>
        )}

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative">
            <div className="relative h-96 w-full rounded-lg overflow-hidden">
              <Image
                src={product?.product_image || "/placeholder-product.jpg"}
                alt={product?.name || "Product image"}
                fill
                className="object-contain"
                priority
              />
              {/* Stock status badge */}
              {product?.active && (
                <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  In Stock
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{product?.name}</h1>

            {/* Star rating - matches product-1.png */}
            <div className="flex items-center mb-3">
              <div className="flex mr-1">
                {renderStars(product?.rating || 5)}
              </div>
              <span className="text-xs text-gray-600">
                ({product?.reviewCount || 2})
              </span>
            </div>

            <p className="text-gray-600 mb-6">{product?.description}</p>

            <div className="mb-6">
              <span
                className={`text-sm px-3 py-1 rounded ${
                  product?.isPerishable
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {product?.isPerishable ? "Perishable" : "Non-Perishable"}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Price</h2>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: product?.currency || "NGN",
                }).format(product?.basePrice || 0)}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Quantity</h2>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                >
                  -
                </Button>
                <span className="text-lg font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart Button with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button
                    size="lg"
                    className="w-full bg-green-700 hover:bg-green-600 text-white"
                    onClick={handleAddToCart}
                    disabled={
                      isAddingToCart || !isCartActionAllowed() || isAdmin
                    }
                  >
                    {isAddingToCart ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
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

            {/* Wishlist Button with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full mt-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={toggleWishlist}
                    disabled={!isCartActionAllowed() || isAdmin}
                  >
                    {isInWishlist ? (
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

            {/* Additional info for disabled state */}
            {(!isCartActionAllowed() || isAdmin) && user && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-sm mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  {isAdmin ? "Admin Status" : "Compliance Status"}
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {isAdmin ? (
                    <li>• Admin users cannot add items to cart or wishlist</li>
                  ) : (
                    <>
                      <li>
                        • Compliance Submitted: {complianceData ? "Yes" : "No"}
                      </li>
                      {complianceData && (
                        <li>
                          • Approval Status:{" "}
                          {complianceData.status || "Checking..."}
                        </li>
                      )}
                    </>
                  )}
                </ul>
                {!isAdmin && complianceData?.status === "DENIED" && (
                  <Button
                    onClick={() => setShowComplianceDialog(true)}
                    className="mt-2 w-full"
                    variant="destructive"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Submit New Compliance
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Only show compliance upload for non-admin users */}
        {!isAdmin && (
          <ConsentUpload
            isOpen={showComplianceDialog}
            onClose={() => setShowComplianceDialog(false)}
            onUploadSuccess={handleComplianceUploadSuccess}
            token={user?.token || ""}
            returnUrl={
              typeof window !== "undefined" ? window.location.pathname : ""
            }
          />
        )}
      </TooltipProvider>
    </div>
  );
}
