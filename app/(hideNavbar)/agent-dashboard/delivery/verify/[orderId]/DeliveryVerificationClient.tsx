'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, PackageCheck, CheckCircle, ArrowLeft, QrCode, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Order {
  id: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  trackingCode: string | null;
  placedAt: string;
  deliveredAt: string | null;
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    Product: {
      id: string;
      name: string;
      product_image: string;
      isPerishable: boolean;
    };
  }>;
  user?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  };
}

interface DeliveryVerificationClientProps {
  order: Order;
  token: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://enugu-state-food-bank.onrender.com/api/v1";

export default function DeliveryVerificationClient({ order, token }: DeliveryVerificationClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("order_details"); // order_details, verify_user, verify_otp, completed
  const [userIdentifier, setUserIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyUser = async () => {
    if (!userIdentifier.trim()) {
      toast.error("Please enter email or phone number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/confirm-user-for-delivery`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          order_id: order.id, 
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

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/confirm-delivery-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          order_id: order.id, 
          user_id: order.user?.id, 
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
      
      // Redirect back to order details after 3 seconds
      setTimeout(() => {
        router.push(`/agent-dashboard/orders/${order.id}`);
      }, 3000);
      
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

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <QrCode className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold">Delivery Verification</h1>
          </div>
          <p className="text-gray-600">Order #{order.id.split('-')[0]} - Verify Customer → Confirm Delivery</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep !== "order_details" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              1
            </div>
            <div className={`w-16 h-1 ${currentStep !== "order_details" ? "bg-green-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === "verify_otp" || currentStep === "completed" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
              2
            </div>
            <div className={`w-16 h-1 ${currentStep === "completed" ? "bg-green-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === "completed" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
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
            {order.user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {order.user.firstname} {order.user.lastname}</p>
                  <p><strong>Email:</strong> {order.user.email}</p>
                  <p><strong>Phone:</strong> {order.user.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Verification</CardTitle>
            <CardDescription>
              Order #{order.id.split('-')[0]} - {formatDate(order.placedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p><strong>Order Total:</strong> {formatCurrency(order.totalAmount, order.currency)}</p>
              <p><strong>Payment Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </p>
              <p><strong>Delivery Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                  order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {order.orderStatus}
                </span>
              </p>
              
              {order.items && order.items.length > 0 && (
                <div>
                  <strong>Items in this order:</strong>
                  {order.items.map((item: any) => (
                    <div key={item.id} className="ml-4 text-sm mt-1">
                      • {item.Product?.name} - {item.quantity} × {order.currency} {item.unitPrice}
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
                Order #{order.id.split('-')[0]} has been marked as delivered.
              </p>
              <p className="text-green-700 text-sm mt-2">
                Redirecting back to order details...
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
              onClick={() => router.push(`/agent-dashboard/orders/${order.id}`)}
              className="flex-1"
            >
              Return to Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}