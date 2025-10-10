"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, User, ArrowRight, CreditCard, Package } from "lucide-react";
import { useSession } from "next-auth/react";

export default function CustomerLookupPage() {
  const [identifier, setIdentifier] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const { data: clientSession } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(setServerUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const user = clientSession?.user || serverUser;
  const router = useRouter();

  const verifyUser = async () => {
    if (!identifier.trim()) {
      toast.error("Please enter a user verification ID");
      return;
    }

    if (!user?.token) {
      toast.error("Authentication required. Please login again.");
      return;
    }

    setIsVerifying(true);
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/cashier/user?identifier=${encodeURIComponent(identifier.trim())}`;
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setVerifiedUser(data.data);
        toast.success("User verified successfully! 🎉");
      } else {
        toast.error(data.message || "Failed to verify user");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Network error: Failed to verify user");
    } finally {
      setIsVerifying(false);
    }
  };

  const startTransaction = () => {
    if (verifiedUser) {
      router.push(`/cashier-dashboard/cart?userId=${verifiedUser.id}`);
      toast.info("Redirecting to transaction page...");
    }
  };

  const viewOrders = () => {
    if (verifiedUser) {
      router.push(`/cashier-dashboard/orders?userId=${verifiedUser.id}`);
      toast.info("Redirecting to orders page...");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Confirmation
          </h1>
          <p className="text-gray-600">
            Verify customer identity to begin transaction
          </p>
        </div>

        {/* Verification Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Verification
            </CardTitle>
            <CardDescription>
              Enter the customer's verification ID to begin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="identifier">Verification ID</Label>
                <Input
                  id="identifier"
                  placeholder="Enter verification ID (e.g., ENU-86373)"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && verifyUser()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={verifyUser} disabled={isVerifying} className="min-w-32">
                  {isVerifying ? (
                    <>
                      <Search className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Verified User Info */}
            {verifiedUser && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Verified
                  </CardTitle>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ACTIVE
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p className="text-lg font-semibold">
                      {verifiedUser.firstname} {verifiedUser.lastname}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Employee ID</Label>
                    <p className="text-lg font-semibold">{verifiedUser.employee_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Level</Label>
                    <p className="text-lg font-semibold">{verifiedUser.level}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Government Entity</Label>
                    <p className="text-lg font-semibold">{verifiedUser.government_entity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Monthly Salary</Label>
                    <p className="text-lg font-semibold">
                      ₦{verifiedUser.salary_per_month?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Loan Unit</Label>
                    <p className="text-lg font-semibold">
                      ₦{verifiedUser.loan_unit?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={startTransaction} className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Start Transaction
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button onClick={viewOrders} variant="outline" className="flex-1">
                    <Package className="h-4 w-4 mr-2" />
                    View Orders
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}