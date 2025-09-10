
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, UserCheck, PackageCheck, ArrowLeft, Download } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://enugu-state-food-bank.onrender.com/api/v1";

export function QRCodeDeliverySystem() {
  const [orderId, setOrderId] = useState("");
  const [currentStep, setCurrentStep] = useState("scan");
  const [userIdentifier, setUserIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [orderData, setOrderData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(""); // Store user ID separately

  // Step 1: Generate QR Code by fetching from API
  const generateQRCode = async () => {
    if (!orderId.trim()) {
      toast.error("Please enter an Order ID");
      return;
    }

    setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/generate-qr-code?order_id=${orderId}&t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log("QR Code API Response:", response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Failed to generate QR code: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const qrCodeBlob = await response.blob();
      const qrCodeObjectUrl = URL.createObjectURL(qrCodeBlob);
      setQrCodeUrl(qrCodeObjectUrl);
      
      // Fetch order data for verification steps
      await fetchOrderData();
      
      toast.success("QR Code generated successfully!");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to generate QR code");
      console.error("QR code generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch order data
  const fetchOrderData = async () => {
    try {
      // Since the QR code endpoint returns order data, we need to call it again for JSON
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
          // Store the user ID for later use in OTP verification
          if (data.data.userId) {
            setUserId(data.data.userId);
          }
          setCurrentStep("show_qr");
        }
      }
    } catch (error) {
      console.error("Failed to fetch order data:", error);
      setCurrentStep("show_qr");
    }
  };

  // Step 2: Verify User
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
      console.log("User verification response:", data);
      
      // If the response contains user ID, store it for OTP verification
      if (data.data && data.data.userId) {
        setUserId(data.data.userId);
      }
      
      setCurrentStep("verify_otp");
      toast.success(data.message || "User verified! OTP sent to customer.");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to verify user");
      console.error("User verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify OTP and Complete Delivery - FIXED
  const verifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!orderId) {
      toast.error("No order ID available");
      return;
    }

    if (!userId) {
      toast.error("User ID is required for OTP verification");
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
          user_id: userId, // Use the stored user ID
          otp: otp 
        })
      });

      console.log("OTP verification request payload:", {
        order_id: orderId,
        user_id: userId,
        otp: otp
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `OTP verification failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("OTP verification success:", data);
      setCurrentStep("completed");
      toast.success(data.message || "Delivery confirmed successfully! Order completed.");
      
    } catch (error: any) {
      console.error("OTP verification error details:", error);
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `order-${orderId}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR Code downloaded!");
    }
  };

  // Reset the process
  const resetProcess = () => {
    setOrderId("");
    setUserIdentifier("");
    setOtp("");
    setOrderData(null);
    setQrCodeUrl(null);
    setUserId("");
    setCurrentStep("scan");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="h-6 w-6" />
            Delivery Verification System
          </CardTitle>
          <CardDescription>
            Verify deliveries using QR codes and OTP verification
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Step 1: Enter Order ID */}
          {currentStep === "scan" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  placeholder="Enter order ID (e.g., 78b5ff49-e28f-4e00-9915-8737a36a6ed6)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={generateQRCode} 
                disabled={isLoading || !orderId.trim()}
                className="flex items-center gap-2 w-full"
              >
                <QrCode className="h-4 w-4" />
                {isLoading ? "Generating QR Code..." : "Generate QR Code"}
              </Button>
            </div>
          )}

          {/* Step 2: Show QR Code */}
          {currentStep === "show_qr" && qrCodeUrl && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-3">Scan this QR Code</h3>
                <img 
                  src={qrCodeUrl} 
                  alt="Order QR Code" 
                  className="mx-auto w-64 h-64 border rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadQRCode} className="flex items-center gap-2 flex-1">
                  <Download className="h-4 w-4" />
                  Download QR
                </Button>
                <Button 
                  onClick={() => setCurrentStep("verify_user")} 
                  className="flex items-center gap-2 flex-1"
                >
                  <UserCheck className="h-4 w-4" />
                  Verify Customer
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Verify User */}
          {currentStep === "verify_user" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Order Verification:</h4>
                <p><strong>Order ID:</strong> {orderId}</p>
                {orderData && (
                  <>
                    <p><strong>Customer:</strong> {orderData.user?.firstname} {orderData.user?.lastname}</p>
                    <p><strong>Total:</strong> {orderData.currency} {orderData.totalAmount}</p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">Verify Customer Identity</Label>
                <Input
                  id="identifier"
                  placeholder="Enter customer email or phone number"
                  value={userIdentifier}
                  onChange={(e) => setUserIdentifier(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Ask the customer for their registered email or phone number
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={verifyUser} 
                  disabled={isLoading || !userIdentifier.trim()}
                  className="flex items-center gap-2 flex-1"
                >
                  <UserCheck className="h-4 w-4" />
                  {isLoading ? "Verifying..." : "Verify Customer"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep("show_qr")} 
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Verify OTP */}
          {currentStep === "verify_otp" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">OTP Sent to Customer</h4>
                <p>An OTP has been sent to the customer's registered contact. Please ask them for the code.</p>
                {userId && (
                  <p className="text-sm mt-2">
                    <strong>User ID:</strong> {userId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={verifyOTP} 
                disabled={isLoading || otp.length !== 6}
                className="flex items-center gap-2 w-full"
              >
                <PackageCheck className="h-4 w-4" />
                {isLoading ? "Verifying..." : "Confirm Delivery"}
              </Button>
            </div>
          )}

          {/* Step 5: Completion */}
          {currentStep === "completed" && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PackageCheck className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-800">Delivery Completed Successfully!</h4>
                <p className="text-green-600">Order has been verified and delivered.</p>
              </div>

              <Button onClick={resetProcess} variant="outline" className="w-full">
                Process Another Delivery
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}