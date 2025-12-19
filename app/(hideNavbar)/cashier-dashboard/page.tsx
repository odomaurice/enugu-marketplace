
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, BarChart3, Badge } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function CashierDashboard() {
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

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cashier Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Start Transaction</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">New Sale</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <Link href="/cashier-dashboard/cart">
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  Begin
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Order Management</p>
                  <p className="text-2xl font-bold text-green-900 mt-2">View Orders</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <Link href="/cashier-dashboard/orders">
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  Manage
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Users</p>
                  <p className="text-2xl font-bold text-purple-900 mt-2">Find User</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <Link href="/cashier-dashboard/users">
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  Search
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Today's Stats</p>
                  <p className="text-2xl font-bold text-orange-900 mt-2">Reports</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <Link href="/cashier-dashboard/reports">
                <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                  View
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used cashier functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/cashier-dashboard/transaction">
                <Button variant="outline" className="w-full justify-start h-14">
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold">New Transaction</p>
                    <p className="text-sm text-gray-500">Start a new sale for a customer</p>
                  </div>
                </Button>
              </Link>
              
              <Link href="/cashier-dashboard/orders">
                <Button variant="outline" className="w-full justify-start h-14">
                  <Package className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold">Order History</p>
                    <p className="text-sm text-gray-500">View and manage all orders</p>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">API Connection</span>
                <Badge  className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Printer Status</span>
                <Badge  className="bg-blue-100 text-blue-800">
                  Ready
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Today's Transactions</span>
                <span className="font-bold">0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}