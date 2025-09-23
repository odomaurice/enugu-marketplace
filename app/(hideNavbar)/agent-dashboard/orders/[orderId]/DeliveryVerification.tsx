'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, PackageCheck, CheckCircle, QrCode, Scan, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://enugu-state-food-bank.onrender.com/api/v1";

interface DeliveryVerificationProps {
  order: any;
  token: string;
}

export default function DeliveryVerification({ order, token }: DeliveryVerificationProps) {
  const [currentStep, setCurrentStep] = useState<"scan" | "verify_user" | "verify_otp" | "completed">("scan");
  const [userIdentifier, setUserIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scanMethod, setScanMethod] = useState<"qr" | "manual">("qr");

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
      
      // Refresh the page after 2 seconds to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerification = () => {
    setScanMethod("manual");
    setCurrentStep("verify_user");
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center">
          {["scan", "verify_user", "verify_otp", "completed"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === step ? "bg-blue-600 text-white" :
                ["verify_otp", "completed"].includes(currentStep) && index < 3 ? "bg-green-600 text-white" :
                "bg-gray-200"
              }`}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`w-16 h-1 ${
                  ["verify_otp", "completed"].includes(currentStep) && index < 2 ? "bg-green-600" :
                  currentStep === "verify_user" && index === 0 ? "bg-blue-600" :
                  "bg-gray-200"
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: QR Code Scanning */}
      {currentStep === "scan" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan QR Code
            </CardTitle>
            <CardDescription>
              Scan the customer's QR code from their order confirmation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <Scan className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">QR Scanner Placeholder</p>
              <p className="text-sm text-gray-500">
                Camera feed would appear here for QR code scanning
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button className="flex-1" disabled>
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR Code
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleManualVerification}>
                <UserCheck className="h-4 w-4 mr-2" />
                Manual Verification
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Or use manual verification if QR code is unavailable
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 2: User Verification */}
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
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("scan")}
                className="flex-1"
              >
                Back to Scan
              </Button>
              <Button 
                onClick={verifyUser} 
                disabled={isLoading || !userIdentifier.trim()}
                className="flex-1"
              >
                {isLoading ? "Verifying..." : "Verify Customer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: OTP Verification */}
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
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("verify_user")}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={verifyOTP} 
                disabled={isLoading || otp.length !== 6}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Verifying..." : "Confirm Delivery"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Completion */}
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
            <p className="text-green-800 mb-4">
              Order #{order.id.split('-')[0]} has been marked as delivered.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700"
            >
              View Updated Order
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Summary for Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Order Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Order ID:</strong> #{order.id.split('-')[0]}</p>
              <p><strong>Customer:</strong> {order.user?.firstname} {order.user?.lastname}</p>
            </div>
            <div>
              <p><strong>Total:</strong> {formatCurrency(order.totalAmount)}</p>
              <p><strong>Items:</strong> {order.items?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function (you might want to move this to lib/utils)
function formatCurrency(amount: number, currency: string = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}