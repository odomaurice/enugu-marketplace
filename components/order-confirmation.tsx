'use client';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Truck, HelpCircle, Download, QrCode } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

export default function OrderConfirmationPage() {
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(setServerUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const user = clientSession?.user || serverUser;

  const { data: orders, isError } = useQuery({
    queryKey: ['userOrders'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/all-order`, {
        headers: { 
          Authorization: `Bearer ${user?.token}` 
        }
      });
      return res.data.data as Order[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user?.token
  });

  // Get the most recent order
  const mostRecentOrder = orders?.[0];

  useEffect(() => {
    if (!isLoading && !isError && mostRecentOrder) {
      toast.success('Order placed successfully!', {
        description: `Your order #${mostRecentOrder.id.split('-')[0]} has been confirmed.`,
        duration: 5000,
      });
      
      // Generate QR code for the order
      generateQRCode(mostRecentOrder.id);
    }
  }, [mostRecentOrder, isLoading, isError]);

const generateQRCode = async (orderId: string) => {
  try {
    // Create QR code that points to your frontend delivery verification page
    const qrContent = `${window.location.origin}/delivery/verify/${orderId}`;
    
    // Use a QR code generation service (you can also use a client-side library)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}`;
    
    setQrCodeUrl(qrCodeUrl);
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    // Fallback: create a simple data URL QR code
    const qrContent = `${window.location.origin}/delivery/verify/${orderId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}`;
    setQrCodeUrl(qrCodeUrl);
  }
};

  const exportToPDF = async () => {
    if (!contentRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`order-confirmation-${mostRecentOrder?.id.split('-')[0]}.pdf`);
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
          <Skeleton className="h-8 w-48 mx-auto mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !mostRecentOrder) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isError ? 'Error loading order' : 'No recent orders found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isError 
              ? 'We encountered an error loading your order details.' 
              : 'You haven\'t placed any orders recently.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/employee-dashboard/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
    }).format(amount);
  };

  return (
    <div className="container py-12">
      {/* Export Button */}
      <div className="flex justify-end mb-6">
        <Button 
          onClick={exportToPDF} 
          disabled={isGeneratingPDF}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isGeneratingPDF ? 'Exporting...' : 'Export as PDF'}
        </Button>
      </div>

      {/* Content to be exported */}
      <div ref={contentRef} className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-green-50 dark:bg-green-900/20 p-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Thank you for your purchase!
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-500 dark:text-gray-400">Order Number</h3>
              <p className="text-gray-900 dark:text-white">#{mostRecentOrder.id.split('-')[0].toUpperCase()}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-500 dark:text-gray-400">Date Placed</h3>
              <p className="text-gray-900 dark:text-white">{formatDate(mostRecentOrder.placedAt)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-500 dark:text-gray-400">Total Amount</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(mostRecentOrder.totalAmount, mostRecentOrder.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 text-center">
            Delivery QR Code
          </h3>
          <div className="text-center">
            {qrCodeUrl ? (
              <div className="inline-block border rounded-lg p-4">
                <img 
                  src={qrCodeUrl} 
                  alt="Delivery QR Code" 
                  className="w-48 h-48 mx-auto"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Present this QR code to the delivery agent for verification
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">QR Code loading...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {mostRecentOrder.items && mostRecentOrder.items.length > 0 && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Order Items</h3>
            <div className="space-y-4">
              {mostRecentOrder.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <Image
                      src={item.Product?.product_image || '/placeholder-product.jpg'}
                      alt={item.Product?.name || 'Product image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.Product?.name || 'Unknown Product'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Quantity: {item.quantity}
                    </p>
                    {item.Product?.isPerishable !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.Product.isPerishable
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {item.Product.isPerishable ? "Perishable" : "Non-Perishable"}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.total, mostRecentOrder.currency)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.unitPrice, mostRecentOrder.currency)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${mostRecentOrder.orderStatus === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                {mostRecentOrder.orderStatus === 'PENDING' ? (
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {mostRecentOrder.orderStatus === 'PENDING' ? 'Processing' : 'Shipped'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {mostRecentOrder.orderStatus === 'PENDING' 
                    ? 'Your order is being prepared' 
                    : 'Your order is on the way'}
                </p>
              </div>
            </div>
            {mostRecentOrder.trackingCode && (
              <Button variant="outline" size="sm">
                Track Order
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Your order has been successfully received and is being processed.
          </p>
        </div>

        {/* Order Total */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(mostRecentOrder.totalAmount, mostRecentOrder.currency)}</span>
          </div>
        </div>

        {/* Delivery Instructions */}
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Delivery Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>Bring this confirmation with you on delivery day</li>
            <li>Show the QR code to the delivery agent for scanning</li>
            <li>The agent will verify your identity and confirm delivery</li>
            <li>You may receive an OTP for final verification</li>
          </ol>
        </div>

        {/* Customer Information */}
        {mostRecentOrder.user && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {mostRecentOrder.user.firstname} {mostRecentOrder.user.lastname}</p>
                <p><strong>Email:</strong> {mostRecentOrder.user.email}</p>
              </div>
              <div>
                <p><strong>Phone:</strong> {mostRecentOrder.user.phone}</p>
                <p><strong>Order Status:</strong> {mostRecentOrder.orderStatus}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/employee-dashboard/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Need Help?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contact our customer support for assistance with your order.
              </p>
            </div>
          </div>
          <Button variant="link" className="mt-2 pl-0 text-primary" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}