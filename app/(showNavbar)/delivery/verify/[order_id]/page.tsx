// app/delivery/verify/[order_id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, PackageCheck, CheckCircle, ArrowLeft, QrCode, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://enugu-state-food-bank.onrender.com/api/v1";

export default function DeliveryVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.order_id as string;
  
  const [orderData, setOrderData] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState("order_details"); // order_details, verify_user, verify_otp, completed
  const [userIdentifier, setUserIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/generate-qr-code?order_id=${orderId}&t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setOrderData(data.data);
          setUserId(data.data.userId);
          // Fetch all orders for this user
          await fetchUserOrders(data.data.userId);
        }
      } else {
        toast.error("Order not found or invalid QR code");
      }
    } catch (error) {
      console.error("Failed to fetch order data:", error);
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    try {
      // This endpoint should return all orders for a user
      const response = await fetch(`${API_BASE_URL}/admin/user-orders/${userId}`, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserOrders(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
    }
  };

  const verifyUser = async () => {
    if (!userIdentifier.trim()) {
      toast.error("Please enter email or phone number");
      return;
    }

    if (!orderId) {
      toast.error("No order ID available");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/confirm-user-for-delivery`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          order_id: orderId, 
          identifier: userIdentifier 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Verification failed: ${response.status}`);
      }

      const data = await response.json();
      setCurrentStep("verify_otp");
      toast.success(data.message || "User verified! OTP sent to customer.");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to verify user");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!orderId || !userId) {
      toast.error("Missing required information for verification");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/confirm-delivery-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          order_id: orderId, 
          user_id: userId, 
          otp: otp 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `OTP verification failed: ${response.status}`);
      }

      const data = await response.json();
      setCurrentStep("completed");
      toast.success(data.message || "Delivery confirmed successfully!");
      
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !orderData) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Invalid QR Code</h1>
          <p className="text-gray-600 mb-6">The scanned QR code is invalid or the order cannot be found.</p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <QrCode className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold">Delivery Verification</h1>
          </div>
          <p className="text-gray-600">Scan QR Code → Verify Customer → Confirm Delivery</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep !== "order_details" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              1
            </div>
            <div className={`w-16 h-1 ${currentStep !== "order_details" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === "verify_otp" || currentStep === "completed" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              2
            </div>
            <div className={`w-16 h-1 ${currentStep === "completed" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === "completed" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              3
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderData.user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {orderData.user.firstname} {orderData.user.lastname}</p>
                  <p><strong>Email:</strong> {orderData.user.email}</p>
                  <p><strong>Phone:</strong> {orderData.user.phone}</p>
                </div>
                <div>
                  <p><strong>Employee ID:</strong> {orderData.user.employee_id}</p>
                  <p><strong>Government Entity:</strong> {orderData.user.government_entity}</p>
                  <p><strong>Level:</strong> {orderData.user.level}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All User Orders */}
        {userOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Customer's Orders</CardTitle>
              <CardDescription>
                {userOrders.length} order(s) for this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div key={order.id} className={`border rounded-lg p-4 ${order.id === orderId ? "border-blue-300 bg-blue-50" : ""}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Order #{order.id.split('-')[0]}</h4>
                        <p className="text-sm text-gray-600">
                          Placed: {formatDate(order.placedAt)}
                        </p>
                        <p className="text-sm">
                          Status: <span className={`font-medium ${
                            order.orderStatus === 'DELIVERED' ? 'text-green-600' : 
                            order.orderStatus === 'PENDING' ? 'text-yellow-600' : 'text-blue-600'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </p>
                        <p className="font-bold mt-2">
                          Total: {order.currency} {order.totalAmount}
                        </p>
                      </div>
                      {order.id === orderId && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Current Order
                        </span>
                      )}
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium mb-2">Items:</h5>
                        <div className="space-y-2">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                              <div className="relative h-10 w-10 rounded-md overflow-hidden">
                                <Image
                                  src={item.Product?.product_image || '/placeholder-product.jpg'}
                                  alt={item.Product?.name || 'Product'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p>{item.Product?.name}</p>
                                <p className="text-gray-600">Qty: {item.quantity}</p>
                              </div>
                              <p>{order.currency} {item.unitPrice} each</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Verification</CardTitle>
            <CardDescription>
              Order #{orderId.split('-')[0]} - {formatDate(orderData.placedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p><strong>Order Total:</strong> {formatCurrency(orderData.totalAmount, orderData.currency)}</p>
              <p><strong>Payment Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  orderData.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {orderData.paymentStatus}
                </span>
              </p>
              <p><strong>Delivery Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  orderData.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                  orderData.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {orderData.orderStatus}
                </span>
              </p>
              
              {orderData.items && orderData.items.length > 0 && (
                <div>
                  <strong>Items in this order:</strong>
                  {orderData.items.map((item: any) => (
                    <div key={item.id} className="ml-4 text-sm mt-1">
                      • {item.Product?.name} - {item.quantity} × {orderData.currency} {item.unitPrice}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Verification */}
        {currentStep === "verify_user" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Verify Customer Identity
              </CardTitle>
              <CardDescription>
                Confirm the customer's identity before delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Enter customer email or phone number</Label>
                <Input
                  id="identifier"
                  value={userIdentifier}
                  onChange={(e) => setUserIdentifier(e.target.value)}
                  placeholder="customer@example.com or 2348012345678"
                />
              </div>
              <Button 
                onClick={verifyUser} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Verifying..." : "Verify Customer"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification */}
        {currentStep === "verify_otp" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5" />
                Enter OTP
              </CardTitle>
              <CardDescription>
                Enter the OTP sent to the customer's registered contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              <Button 
                onClick={verifyOTP} 
                disabled={isLoading || otp.length !== 6}
                className="w-full"
              >
                {isLoading ? "Verifying..." : "Confirm Delivery"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completion */}
        {currentStep === "completed" && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Delivery Confirmed!
              </CardTitle>
              <CardDescription className="text-green-700">
                Order has been successfully delivered and verified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-800">
                Order #{orderId.split('-')[0]} has been marked as delivered.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          {currentStep === "order_details" && (
            <Button 
              onClick={() => setCurrentStep("verify_user")}
              className="flex-1"
            >
              Start Verification
            </Button>
          )}

          {currentStep === "verify_user" && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep("order_details")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order Details
            </Button>
          )}

          {currentStep === "verify_otp" && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep("verify_user")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Verification
            </Button>
          )}

          {currentStep === "completed" && (
            <Button 
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}