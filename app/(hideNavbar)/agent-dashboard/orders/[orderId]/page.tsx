import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Truck, CheckCircle, QrCode, UserCheck, PackageCheck, Camera } from 'lucide-react';
import QrScanner from '@/components/qr-scanner';

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect(`/agent-login?callbackUrl=${encodeURIComponent(`/agent-dashboard/orders/${orderId}`)}`);
  }

  if (session.user.role !== 'fulfillment_officer') {
    redirect('/auth/error?error=Unauthorized');
  }
  
  let order = null;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/single-order?order_id=${orderId}`,
      {
        headers: { Authorization: `Bearer ${session.user.token}` }
      }
    );
    order = response.data.data;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    redirect('/agent-dashboard/orders');
  }

  if (!order) {
    redirect('/agent-dashboard/orders');
  }

  const isDelivered = order.orderStatus === 'DELIVERED';

  return (
    <div className="p-4 space-y-6">
      <Button asChild variant="ghost">
        <Link href="/agent-dashboard/orders" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{order.id.substring(0, 8)}</span>
              <Badge 
                variant={
                  order.orderStatus === 'DELIVERED' ? 'secondary' :
                  order.orderStatus === 'CANCELLED' ? 'destructive' : 'default'
                }
              >
                {order.orderStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge 
                    variant={
                      order.paymentStatus === 'PAID' ? 'secondary' :
                      order.paymentStatus === 'FAILED' ? 'destructive' : 'default'
                    }
                    className="mt-1"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placed At</p>
                  <p>{new Date(order.placedAt).toLocaleString()}</p>
                </div>
              </div>

              {order.deliveredAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Delivered At</p>
                  <p>{new Date(order.deliveredAt).toLocaleString()}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Tracking Code</p>
                <p>{order.trackingCode || 'Not available'}</p>
              </div>

              {/* Customer Information */}
              {order.user && (
                <div className="col-span-2 border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {order.user.firstname} {order.user.lastname}</p>
                      <p><strong>Email:</strong> {order.user.email}</p>
                    </div>
                    <div>
                      <p><strong>Phone:</strong> {order.user.phone}</p>
                      <p><strong>Employee ID:</strong> {order.user.employee_id}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Total & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Order Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalAmount + (order.discount || 0))}</span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-red-500">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>

              {/* Delivery Status */}
              <div className="pt-4 mt-4 border-t">
                {!isDelivered ? (
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <Link href={`/agent-dashboard/delivery/verify/${order.id}`}>
                        <Truck className="h-4 w-4 mr-2" />
                        Start Delivery Verification
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Verify customer identity and confirm delivery
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Delivered</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.deliveredAt || order.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 border-b pb-4 last:border-b-0">
                <div className="w-20 h-20 bg-muted rounded-md overflow-hidden">
                  <img 
                    src={item.variant?.image || item.Product?.product_image || '/placeholder-product.jpg'} 
                    alt={item.variant?.name || item.Product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.variant?.name || item.Product?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                  {item.variant?.netWeight && (
                    <p className="text-sm text-muted-foreground">
                      {item.variant.netWeight}kg
                    </p>
                  )}
                  {item.Product?.isPerishable !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                      item.Product.isPerishable
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {item.Product.isPerishable ? "Perishable" : "Non-Perishable"}
                    </span>
                  )}
                </div>
                <div className="font-medium">
                  {formatCurrency(item.total)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            {/* QR Code Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Scan Customer's QR Code
                </CardTitle>
                <CardDescription>
                  Use your device camera to scan the customer's QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QrScanner 
                  onScan={(result) => {
                    console.log("QR Code scanned:", result);
                    // Extract order ID from QR code URL
                    try {
                      const url = new URL(result);
                      const pathParts = url.pathname.split('/');
                      const scannedOrderId = pathParts[pathParts.length - 1];
                      
                      if (scannedOrderId === order.id) {
                        // Navigate to verification page
                        window.location.href = `/agent-dashboard/delivery/verify/${order.id}`;
                      } else {
                        alert(`QR code is for a different order. Expected: ${order.id}, Got: ${scannedOrderId}`);
                      }
                    } catch (error) {
                      // If it's not a URL, check if it's a direct order ID
                      if (result === order.id) {
                        window.location.href = `/agent-dashboard/delivery/verify/${order.id}`;
                      } else {
                        alert(`Invalid QR code. Scanned: ${result}`);
                      }
                    }
                  }}
                  onError={(error) => {
                    console.error("QR Scanner error:", error);
                    alert(error);
                  }}
                />
              </CardContent>
            </Card>

            {/* Manual Verification Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Manual Verification
                </CardTitle>
                <CardDescription>
                  Or start verification manually without scanning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href={`/agent-dashboard/delivery/verify/${order.id}`}>
                    <Truck className="h-4 w-4 mr-2" />
                    Start Manual Verification
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 text-sm">
                  How to verify delivery:
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full p-1">
                    <Camera className="h-3 w-3" />
                  </div>
                  <span>Scan customer's QR code using camera</span>
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
    </div>
  );
}