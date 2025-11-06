"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  ShoppingCart,
  Eye,
  Calendar,
  User,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
} from "lucide-react";
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
  slug: string;
  brand: string;
  shelfLifeDays: number;
  unit: string;
  packageType: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  currency: string;
  total: number;
  productId: string;
  Product: Product;
}

interface Order {
  id: string;
  userId: string;
  addressId: string | null;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  trackingCode: string | null;
  placedAt: string;
  deliveredAt: string | null;
  cancelledAt: string | null;
  updatedAt: string;
  couponId: string | null;
  discount: number;
  order_confirmation_otp: string | null;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    level: string;
    employee_id: string;
    verification_id: string;
    government_entity: string;
    salary_per_month: number;
    loan_unit: number;
    loan_amount_collected: number;
    is_address_set: boolean;
    password: string;
    otp: number;
    role: string;
    profile_image: string | null;
    is_compliance_submitted: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  items: OrderItem[];
}

// Receipt Component for Printing
function Receipt({ order, onClose }: { order: Order; onClose: () => void }) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const handlePrint = () => {
    const receiptContent = receiptRef.current;
    if (!receiptContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order ${order.id.slice(-8)}</title>
        <style>
          @media print {
            @page {
              size: 80mm 200mm;
              margin: 0;
              padding: 0;
            }
            body {
              width: 80mm;
              margin: 0;
              padding: 5mm;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
            }
            * {
              box-sizing: border-box;
            }
          }
          body {
            width: 80mm;
            margin: 0;
            padding: 5mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
          }
          .receipt {
            width: 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .company-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .receipt-title {
            font-size: 12px;
            margin-bottom: 5px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .double-divider {
            border-top: 2px solid #000;
            margin: 10px 0;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }
          .item-name {
            flex: 2;
          }
          .item-details {
            flex: 1;
            text-align: right;
          }
          .total-row {
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          .thank-you {
            text-align: center;
            margin-top: 15px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="company-name">ENUGU FOOD SCHEME</div>
            <div class="receipt-title">SALES RECEIPT</div>
            <div>Order: ${order.id.slice(-8)}</div>
            <div>Date: ${formatDate(order.placedAt)}</div>
          </div>

          <div class="divider"></div>

          <div style="margin-bottom: 8px;">
            <div><strong>Customer:</strong> ${order.user.firstname} ${order.user.lastname}</div>
            <div><strong>Employee ID:</strong> ${order.user.employee_id}</div>
            <div><strong>Phone:</strong> ${order.user.phone}</div>
          </div>

          <div class="divider"></div>

          <div style="margin-bottom: 8px;">
            <div class="item-row" style="font-weight: bold;">
              <span>ITEM</span>
              <span>QTY x PRICE</span>
              <span>AMOUNT</span>
            </div>
            ${order.items.map(item => `
              <div class="item-row">
                <span class="item-name">${item.Product.name}</span>
                <span class="item-details">${item.quantity} x ${formatCurrency(item.unitPrice)}</span>
                <span class="item-details">${formatCurrency(item.total)}</span>
              </div>
            `).join('')}
          </div>

          <div class="double-divider"></div>

          <div style="margin-bottom: 8px;">
            <div class="item-row total-row">
              <span>SUBTOTAL:</span>
              <span>${formatCurrency(order.totalAmount)}</span>
            </div>
            ${order.discount > 0 ? `
              <div class="item-row">
                <span>DISCOUNT:</span>
                <span>-${formatCurrency(order.discount)}</span>
              </div>
            ` : ''}
            <div class="item-row total-row">
              <span>TOTAL:</span>
              <span>${formatCurrency(order.totalAmount - order.discount)}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div style="margin-bottom: 8px;">
            <div><strong>Order Status:</strong> ${order.orderStatus}</div>
          </div>

          <div class="thank-you">
            Thank you for your purchase!<br>
            Please come again
          </div>

          <div class="text-center" style="margin-top: 10px; font-size: 10px;">
            Generated on ${new Date().toLocaleDateString()}
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  useEffect(() => {
    handlePrint();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Print Receipt</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        
        <div ref={receiptRef} className="bg-white p-4 border border-gray-300 receipt-preview">
          <div className="text-center mb-4">
            <div className="font-bold text-lg">ENUGU FOOD SCHEME</div>
            <div className="text-sm">SALES RECEIPT</div>
            <div className="text-xs">Order: {order.id.slice(-8)}</div>
            <div className="text-xs">Date: {formatDate(order.placedAt)}</div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          <div className="mb-3 text-sm">
            <div><strong>Customer:</strong> {order.user.firstname} {order.user.lastname}</div>
            <div><strong>Employee ID:</strong> {order.user.employee_id}</div>
            <div><strong>Phone:</strong> {order.user.phone}</div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          <div className="mb-3 text-sm">
            <div className="flex justify-between font-bold mb-1">
              <span>ITEM</span>
              <span>AMOUNT</span>
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between mb-1">
                <div>
                  <div>{item.Product.name}</div>
                  <div className="text-xs text-gray-600">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </div>
                </div>
                <div>{formatCurrency(item.total)}</div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-gray-800 my-2"></div>

          <div className="mb-3 text-sm">
            <div className="flex justify-between font-bold">
              <span>SUBTOTAL:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span>DISCOUNT:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-gray-400 pt-1 mt-1">
              <span>TOTAL:</span>
              <span>{formatCurrency(order.totalAmount - order.discount)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          <div className="text-sm mb-4">
            {/* <div><strong>Payment Status:</strong> {order.paymentStatus}</div> */}
            <div><strong>Order Status:</strong> {order.orderStatus}</div>
          </div>

          <div className="text-center italic text-sm">
            Thank you for your purchase!<br />
            Please come again
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print Again
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: clientSession } = useSession();
  const [serverUser, setServerUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const userId = searchParams.get("userId");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
     fetch('/api/auth/session')
       .then(res => res.json())
       .then(setServerUser)
       .catch(console.error)
       .finally(() => setIsLoading(false));
   }, []);

  const user = clientSession?.user || serverUser;

  // Fetch all orders for the user
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ["cashier-orders", userId],
    queryFn: async () => {
      if (!user?.token || !userId) return [];
      
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/cashier/all-order/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );
        console.log("Orders API Response:", res.data);
        return res.data.data || [];
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
    },
    enabled: !!userId && !!user?.token && !orderId,
  });

  // Fetch single order if orderId is provided
  const { data: singleOrder, isLoading: singleOrderLoading } = useQuery({
    queryKey: ["cashier-single-order", orderId, userId],
    queryFn: async () => {
      if (!user?.token || !orderId || !userId) return null;
      
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/cashier/single-order`,
          {
            params: {
              order_id: orderId,
              userId: userId
            },
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );
        console.log("Single Order API Response:", res.data);
        return res.data.data;
      } catch (error) {
        console.error("Error fetching single order:", error);
        throw error;
      }
    },
    enabled: !!orderId && !!userId && !!user?.token,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", icon: any } } = {
      "pending": { variant: "secondary", icon: Clock },
      "confirmed": { variant: "default", icon: CheckCircle },
      "processing": { variant: "default", icon: Package },
      "shipped": { variant: "default", icon: Truck },
      "delivered": { variant: "default", icon: CheckCircle },
      "cancelled": { variant: "destructive", icon: XCircle },
      "completed": { variant: "default", icon: CheckCircle },
    };

    const config = statusConfig[status?.toLowerCase()] || { variant: "outline", icon: Package };
    const StatusIcon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <StatusIcon className="h-3 w-3" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", icon: any } } = {
      "pending": { variant: "secondary", icon: Clock },
      "paid": { variant: "default", icon: CheckCircle },
      "failed": { variant: "destructive", icon: XCircle },
      "refunded": { variant: "outline", icon: CreditCard },
    };

    const config = statusConfig[status?.toLowerCase()] || { variant: "outline", icon: CreditCard };
    const StatusIcon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <StatusIcon className="h-3 w-3" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/cashier-dashboard/orders?userId=${userId}&orderId=${orderId}`);
  };

  const handleBackToOrders = () => {
    router.push(`/cashier-dashboard/orders?userId=${userId}`);
  };

  const handleBackToCart = () => {
    router.push(`/cashier-dashboard/cart?userId=${userId}`);
  };

  const handleLogin = () => {
    router.push("/cashier-login");
  };

  const handlePrintReceipt = (order: Order) => {
    setSelectedOrderForReceipt(order);
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setSelectedOrderForReceipt(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-600">
          No user selected. Please verify a user first.
        </p>
        <Button
          onClick={() => router.push("/cashier-dashboard/users")}
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
        <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-red-600 text-lg mb-2">
          Authentication required
        </p>
        <p className="text-gray-600 mb-6">
          Please login to access orders
        </p>
        <Button onClick={handleLogin} className="min-w-32">
          Login
        </Button>
      </div>
    );
  }

  // Single Order View
  if (orderId) {
    return (
      <>
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600">Order #{singleOrder?.id || orderId}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => singleOrder && handlePrintReceipt(singleOrder)}
                  disabled={!singleOrder}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                <Button variant="outline" onClick={handleBackToOrders}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
                <Button variant="outline" onClick={handleBackToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </div>
            </div>

            {singleOrderLoading ? (
              <div className="text-center py-8">Loading order details...</div>
            ) : singleOrder ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Order Summary</span>
                      <div className="flex gap-2">
                        {getStatusBadge(singleOrder.orderStatus)}
                        {/* {getPaymentStatusBadge(singleOrder.paymentStatus)} */}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-500">Order Information</h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Order ID:</span> {singleOrder.id}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Order Date:</span> {formatDate(singleOrder.placedAt)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Last Updated:</span> {formatDate(singleOrder.updatedAt)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Tracking Code:</span> {singleOrder.trackingCode || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-500">Customer Information</h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Name:</span> {singleOrder.user?.firstname} {singleOrder.user?.lastname}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Employee ID:</span> {singleOrder.user?.employee_id}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Phone:</span> {singleOrder.user?.phone}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">User ID:</span> {singleOrder.userId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {singleOrder.items?.map((item: OrderItem) => (
                        <div key={item.id} className="flex justify-between items-start border-b pb-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.Product.name}</h4>
                            <p className="text-sm text-gray-600 mb-1">{item.Product.description}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-xs text-gray-500 mt-1">SKU: {item.Product.slug}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.unitPrice)} each</p>
                            <p className="text-sm text-gray-600">Subtotal: {formatCurrency(item.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(singleOrder.totalAmount)}</span>
                      </div>
                      {singleOrder.discount > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600 mt-2">
                          <span>Discount:</span>
                          <span>-{formatCurrency(singleOrder.discount)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Order Placed</p>
                          <p className="text-sm text-gray-600">{formatDate(singleOrder.placedAt)}</p>
                        </div>
                      </div>
                      {singleOrder.deliveredAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Delivered</p>
                            <p className="text-sm text-gray-600">{formatDate(singleOrder.deliveredAt)}</p>
                          </div>
                        </div>
                      )}
                      {singleOrder.cancelledAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Cancelled</p>
                            <p className="text-sm text-gray-600">{formatDate(singleOrder.cancelledAt)}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Last Updated</p>
                          <p className="text-sm text-gray-600">{formatDate(singleOrder.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Order not found</p>
                <Button onClick={handleBackToOrders} className="mt-4">
                  Back to Orders
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && selectedOrderForReceipt && (
          <Receipt order={selectedOrderForReceipt} onClose={handleCloseReceipt} />
        )}
      </>
    );
  }

  // All Orders View
  return (
    <>
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Orders</h1>
              <p className="text-gray-600">View and manage customer orders</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBackToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/cashier-dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {ordersLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : ordersError ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-red-600">Error loading orders</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : orders?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No orders found for this customer</p>
              <p className="text-sm text-gray-600 mb-4">Start by creating a new order from the cart</p>
              <Button onClick={handleBackToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Go to Cart
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Orders Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{orders?.length || 0}</p>
                      <p className="text-sm text-blue-600">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {orders?.filter((order: Order) => order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED').length || 0}
                      </p>
                      <p className="text-sm text-green-600">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {orders?.filter((order: Order) => order.orderStatus === 'PENDING' || order.orderStatus === 'PROCESSING').length || 0}
                      </p>
                      <p className="text-sm text-yellow-600">In Progress</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {orders?.filter((order: Order) => order.orderStatus === 'CANCELLED').length || 0}
                      </p>
                      <p className="text-sm text-red-600">Cancelled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Orders List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    {orders?.length} order(s) found for this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders?.map((order: Order) => (
                      <div
                        key={order.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 mb-4 sm:mb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                            {getStatusBadge(order.orderStatus)}
                            {/* {getPaymentStatusBadge(order.paymentStatus)} */}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(order.placedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                          </div>
                          {order.user && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <User className="h-3 w-3" />
                              <span>{order.user.firstname} {order.user.lastname} ({order.user.employee_id})</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Items: {order.items?.length || 0}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handlePrintReceipt(order)}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && selectedOrderForReceipt && (
        <Receipt order={selectedOrderForReceipt} onClose={handleCloseReceipt} />
      )}
    </>
  );
}