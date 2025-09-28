
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, PackageCheck, CheckCircle, ArrowLeft, QrCode, AlertCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DeliveryVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.order_id as string;
  
  const [orderData, setOrderData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<"order_details" | "verify_user" | "verify_otp" | "completed">("order_details");
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
      console.log("Fetching order data for:", orderId);
      
      // Use the generate-qr-code endpoint which doesn't require authentication
      const response = await fetch(`${API_BASE_URL}/generate-qr-code?order_id=${orderId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        
        if (data.data) {
          setOrderData(data.data);
          setUserId(data.data.userId);
          toast.success("Order loaded successfully");
        } else {
          throw new Error("Order data not found in response");
        }
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch order: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error("Failed to fetch order data:", error);
      toast.error(error.message || "Failed to load order details");
    } finally {
      setIsLoading(false);
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
      console.log("Verifying user:", { order_id: orderId, identifier: userIdentifier });
      
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

      console.log("Verify user response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Verification failed: ${response.status}`);
      }

      const data = await response.json();
      setCurrentStep("verify_otp");
      toast.success(data.message || "User verified! OTP sent to customer.");
      
    } catch (error: any) {
      console.error("User verification error:", error);
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
      console.log("Verifying OTP:", { order_id: orderId, user_id: userId, otp: otp });
      
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

      console.log("Verify OTP response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `OTP verification failed: ${response.status}`);
      }

      const data = await response.json();
      setCurrentStep("completed");
      toast.success(data.message || "Delivery confirmed successfully!");
      
      // Refresh order data to get updated status
      setTimeout(() => {
        fetchOrderData();
      }, 1000);
      
    } catch (error: any) {
      console.error("OTP verification error:", error);
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

  // Test the API endpoint directly
  const testApiEndpoint = async () => {
    try {
      const testUrl = `${API_BASE_URL}/generate-qr-code?order_id=${orderId}`;
      console.log("Testing API endpoint:", testUrl);
      
      const response = await fetch(testUrl);
      const data = await response.json();
      console.log("Test API Response:", data);
      
      if (data.data) {
        toast.success("API endpoint is working!");
        setOrderData(data.data);
      } else {
        toast.error("API returned no data");
      }
    } catch (error) {
      console.error("API test failed:", error);
      toast.error("API test failed");
    }
  };

  if (isLoading && !orderData) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading order details...</p>
          <Button onClick={testApiEndpoint} variant="outline" className="mt-4">
            Test API Endpoint
          </Button>
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
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            <div className="space-x-2">
              <Button onClick={testApiEndpoint} variant="outline">
                Test API Connection
              </Button>
              <Button onClick={() => router.push('/agent-dashboard/orders')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDelivered = orderData.orderStatus === 'DELIVERED';

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <QrCode className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold">Delivery Verification</h1>
          </div>
          <p className="text-gray-600">Order #{orderId.split('-')[0]}</p>
        </div>

       

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            {['order_details', 'verify_user', 'verify_otp', 'completed'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === step || 
                  (step === 'completed' && currentStep === 'completed') ||
                  (step === 'verify_otp' && currentStep === 'completed') ||
                  (step === 'verify_otp' && currentStep === 'verify_otp') ||
                  (step === 'verify_user' && (currentStep === 'verify_user' || currentStep === 'verify_otp' || currentStep === 'completed'))
                    ? "bg-green-600 text-white" 
                    : "bg-gray-200"
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 ${
                    (step === 'order_details' && currentStep !== 'order_details') ||
                    (step === 'verify_user' && (currentStep === 'verify_otp' || currentStep === 'completed')) ||
                    (step === 'verify_otp' && currentStep === 'completed')
                      ? "bg-green-600" 
                      : "bg-gray-200"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Alert */}
        {isDelivered && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">This order has already been delivered</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Delivered on {formatDate(orderData.deliveredAt)}
              </p>
            </CardContent>
          </Card>
        )}

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
                <div className="space-y-2">
                  <div>
                    <strong>Name:</strong> {orderData.user.firstname} {orderData.user.lastname}
                  </div>
                  <div>
                    <strong>Email:</strong> {orderData.user.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {orderData.user.phone}
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <strong>Employee ID:</strong> {orderData.user.employee_id}
                  </div>
                  <div>
                    <strong>Government Entity:</strong> {orderData.user.government_entity}
                  </div>
                  <div>
                    <strong>Level:</strong> {orderData.user.level}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Placed on {formatDate(orderData.placedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Order Total:</strong> {formatCurrency(orderData.totalAmount, orderData.currency)}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    orderData.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                    orderData.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {orderData.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              {orderData.items && orderData.items.length > 0 && (
                <div>
                  <strong>Items:</strong>
                  <div className="mt-2 space-y-3">
                    {orderData.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 border rounded">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden">
                          <Image
                            src={item.Product?.product_image || item.variant?.image || '/placeholder-product.jpg'}
                            alt={item.Product?.name || item.variant?.name || 'Product'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.Product?.name || item.variant?.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {item.Product?.isPerishable && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Perishable
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.total, orderData.currency)}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.unitPrice, orderData.currency)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Steps */}
        {!isDelivered && (
          <>
            {/* Step 1: Order Details (Current step) */}
            {currentStep === "order_details" && (
              <Card>
                <CardHeader>
                  <CardTitle>Ready to Verify Delivery</CardTitle>
                  <CardDescription>
                    Confirm the customer's identity before proceeding with delivery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setCurrentStep("verify_user")}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Truck className="h-5 w-5 mr-2" />
                    Start Delivery Verification
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Verify User */}
            {currentStep === "verify_user" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Verify Customer Identity
                  </CardTitle>
                  <CardDescription>
                    Enter the customer's email or phone number to verify identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Email or Phone Number</Label>
                    <Input
                      id="identifier"
                      value={userIdentifier}
                      onChange={(e) => setUserIdentifier(e.target.value)}
                      placeholder="customer@example.com or 2348012345678"
                    />
                  </div>
                  <Button 
                    onClick={verifyUser} 
                    disabled={isLoading || !userIdentifier.trim()}
                    className="w-full"
                  >
                    {isLoading ? "Verifying..." : "Verify Customer"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Verify OTP */}
            {currentStep === "verify_otp" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageCheck className="h-5 w-5" />
                    Enter OTP
                  </CardTitle>
                  <CardDescription>
                    Enter the 6-digit OTP sent to the customer's registered contact
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
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Verifying..." : "Confirm Delivery"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Step 4: Completion */}
        {currentStep === "completed" && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Delivery Confirmed Successfully!
              </CardTitle>
              <CardDescription className="text-green-700">
                Order has been successfully delivered and verified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-green-800">
                <p>Order #{orderId.split('-')[0]} has been marked as delivered.</p>
                <p>Customer: {orderData.user?.firstname} {orderData.user?.lastname}</p>
                <p>Delivery confirmed at: {new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep === "verify_user" && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep("order_details")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Order
            </Button>
          )}

          {currentStep === "verify_otp" && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep("verify_user")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Verification
            </Button>
          )}

          {(currentStep === "completed" || isDelivered) && (
            <Button 
              onClick={() => router.push('/agent-dashboard/orders')}
              className="flex-1"
            >
              Back to Orders Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}