"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";

interface Product {
  id: string;
  name: string;
  description: string;
  product_image: string;
  basePrice: number;
  currency: string;
  isPerishable: boolean;
  active: boolean;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export default function TransactionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: clientSession } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const userId = searchParams.get("userId");
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [perishableFilter, setPerishableFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name-asc");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(setServerUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const user = clientSession?.user || serverUser;

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`
      );
      return res.data.data;
    },
  });

  // Fetch cart
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ["cashier-cart", userId],
    queryFn: async () => {
      if (!user?.token) return [];
      
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/cashier/cart`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return res.data.data;
    },
    enabled: !!userId && !!user?.token,
  });

  // Filter and sort products
  const filteredProducts = products?.filter((product: Product) => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      default:
        return 0;
    }
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      if (!user?.token) {
        throw new Error("Authentication required");
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/cashier/cart/add-to-cart`,
        {
          userId,
          productId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashier-cart", userId] });
      toast.success("Product added to cart! 🛒");
      setAddingProductId(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to add product to cart"
      );
      setAddingProductId(null);
    },
  });

  // Update cart mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    }) => {
      if (!user?.token) {
        throw new Error("Authentication required");
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/cashier/cart/update-cart/${cartItemId}`,
        { userId, quantity },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashier-cart", userId] });
      toast.success("Cart updated! ✅");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update cart");
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      if (!user?.token) {
        throw new Error("Authentication required");
      }

      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/cashier/cart/remove-from-cart/${cartItemId}`,
        { 
          data: { userId },
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashier-cart", userId] });
      toast.success("Item removed from cart 🗑️");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to remove item from cart"
      );
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user?.token) {
        throw new Error("Authentication required");
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/cashier/cart/remove-all-from-cart`,
        {
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashier-cart", userId] });
      toast.success("Cart cleared! 🧹");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user?.token) {
        throw new Error("Authentication required");
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/cashier/create-order`,
        {
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cashier-cart", userId] });
      toast.success("Order created successfully! 🎉");
      router.push(
        `/cashier-dashboard/order-confirmation?orderId=${data.data.id}&userId=${userId}`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create order");
    },
  });

  const cartItems: CartItem[] = cart || [];
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleAddToCart = (productId: string) => {
    if (!user?.token) {
      toast.error("Authentication required. Please login again.");
      return;
    }

    setAddingProductId(productId);
    addToCartMutation.mutate({
      productId,
      quantity: 1,
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add some products first!");
      return;
    }
    createOrderMutation.mutate();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/placeholder-product.jpg";
  };

  if (!userId) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-600">
          No user selected. Please verify a user first.
        </p>
        <Button
          onClick={() => router.push("/cashier-dashboard/customer-lookup")}
          className="mt-4"
        >
          Verify Customer
        </Button>
      </div>
    );
  }

  if (!user?.token) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-600">
          Authentication required. Please login again.
        </p>
        <Button
          onClick={() => router.push("/cashier-login")}
          className="mt-4"
        >
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction</h1>
            <p className="text-gray-600">Add products and process order</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/cashier-dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Products</CardTitle>
                <CardDescription>
                  Select products to add to the cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <Select value={perishableFilter} onValueChange={setPerishableFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="perishable">Perishable</SelectItem>
                      <SelectItem value="non-perishable">Non-Perishable</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-full sm:w-40">
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

                {productsLoading ? (
                  <div className="text-center py-8">Loading products...</div>
                ) : filteredProducts?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No products found matching your filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts?.map((product: Product) => (
                      <Card
                        key={product.id}
                        className="p-4 hover:shadow-md transition-shadow"
                      >
                        {/* Product Image */}
                        <div className="relative h-40 w-full mb-3 bg-gray-100 rounded-lg">
                          <Image
                            src={
                              product.product_image || "/placeholder-product.jpg"
                            }
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                            onError={handleImageError}
                          />
                        </div>

                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                          <Badge
                            variant={
                              product.isPerishable ? "default" : "secondary"
                            }
                          >
                            {product.isPerishable
                              ? "Perishable"
                              : "Non-Perishable"}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-base">
                            ₦{product.basePrice.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={addingProductId === product.id}
                          >
                            {addingProductId === product.id ? (
                              <>
                                <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-white border-t-transparent" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Cart
                  {cartItems.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {cartItems.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartLoading ? (
                  <div className="text-center py-4">Loading cart...</div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Add products to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start border-b pb-4"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              ₦{item.price.toLocaleString()} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateCartMutation.mutate({
                                    cartItemId: item.id,
                                    quantity: item.quantity - 1,
                                  });
                                } else {
                                  removeFromCartMutation.mutate(item.id);
                                }
                              }}
                              disabled={
                                updateCartMutation.isPending ||
                                removeFromCartMutation.isPending
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                updateCartMutation.mutate({
                                  cartItemId: item.id,
                                  quantity: item.quantity + 1,
                                })
                              }
                              disabled={updateCartMutation.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                removeFromCartMutation.mutate(item.id)
                              }
                              disabled={removeFromCartMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
                        <span>Total:</span>
                        <span>₦{totalAmount.toLocaleString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => clearCartMutation.mutate()}
                          disabled={clearCartMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Cart
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleCheckout}
                          disabled={cartItems.length === 0 || createOrderMutation.isPending}
                        >
                          {createOrderMutation.isPending ? (
                            <>
                              <CreditCard className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Checkout
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}