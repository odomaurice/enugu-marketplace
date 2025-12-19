// components/order-detail-client-wrapper.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, UserCheck, PackageCheck, CheckCircle, QrCode } from 'lucide-react';
import Link from 'next/link';

interface OrderDetailClientWrapperProps {
  order: any;
  orderId: string;
  user: any;
}

export default function OrderDetailClientWrapper({ order, orderId, user }: OrderDetailClientWrapperProps) {
  const [isDelivered] = useState(order.orderStatus === 'DELIVERED');
  
  // Generate QR code that points to the frontend delivery verification page
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://enugu-marketplace.vercel.app';
  const verificationUrl = `${frontendUrl}/agent-dashboard/delivery/verify/${orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <>
      {/* QR Code Display Section */}
      {!isDelivered && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Delivery QR Code
            </CardTitle>
            <CardDescription>
              Customer should present this QR code for scanning during delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="border rounded-lg p-4 inline-block bg-white">
              <img 
                src={qrCodeUrl}
                alt="Delivery QR Code"
                className="mx-auto"
                width={200}
                height={200}
              />
              <p className="text-sm text-gray-600 mt-2">
                Scan this code to verify delivery
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Points to: {verificationUrl}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Verification Section */}
      {!isDelivered && (
        <Card id="delivery-verification">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Manual Verification Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Start Verification Process
                </CardTitle>
                <CardDescription>
                  Begin the delivery verification process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href={`/agent-dashboard/delivery/verify/${order.id}`}>
                    <Truck className="h-4 w-4 mr-2" />
                    Start Delivery Verification
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 text-sm">
                  Delivery Verification Process:
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full p-1">
                    <QrCode className="h-3 w-3" />
                  </div>
                  <span>Customer shows their QR code (from their order confirmation)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full p-1">
                    <UserCheck className="h-3 w-3" />
                  </div>
                  <span>Verify customer identity with email/phone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full p-1">
                    <PackageCheck className="h-3 w-3" />
                  </div>
                  <span>Enter OTP sent to customer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full p-1">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <span>Confirm delivery completion</span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </>
  );
}