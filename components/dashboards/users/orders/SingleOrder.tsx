"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  CreditCard,
  Calendar,
  Package,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import OrderConfirmationContent from "@/components/OrderConfirmationContent";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  currency: string;
  productId: string | null;
  variantId: string | null;
  Product: {
    id: string;
    name: string;
    product_image: string;
    description: string;
  } | null;
  variant: {
    id: string;
    name: string;
    image: string;
    price: number;
  } | null;
}

interface OrderDetails {
  id: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  trackingCode: string | null;
  placedAt: string;
  deliveredAt: string | null;
  items: OrderItem[];
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

const formatCurrency = (amount: number, currency: string = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount);
};

export default function SingleOrderPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { data: clientSession } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then(setServerUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const user = clientSession?.user || serverUser;

  const { data: order, isError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/single-order`,
        {
          params: { order_id: orderId },
          headers: {
            Authorization: `Bearer ${
              user?.token || localStorage.getItem("token")
            }`,
          },
        }
      );
      return res.data.data as OrderDetails;
    },
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load order details");
      setShouldRedirect(true);
    }
  }, [isError]);

  useEffect(() => {
    if (order?.id) {
      generateQRCode(order.id);
    }
  }, [order]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/employee-dashboard/orders");
    }
  }, [shouldRedirect, router]);

  const generateQRCode = async (orderId: string) => {
    try {
      // Create QR code that points to your frontend delivery verification page
      const qrContent = `${window.location.origin}/delivery/verify/${orderId}`;

      // Use a QR code generation service (you can also use a client-side library)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        qrContent
      )}`;

      setQrCodeUrl(qrCodeUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      // Fallback: create a simple data URL QR code
      const qrContent = `${window.location.origin}/delivery/verify/${orderId}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        qrContent
      )}`;
      setQrCodeUrl(qrCodeUrl);
    }
  };

  const exportToPDF = async () => {
    if (!contentRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        10,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save(`order-${order?.id.split("-")[0]}.pdf`);

      toast.success("Order exported as PDF");
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export order");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null; // The redirect will happen via useEffect
  }

  const getItemImage = (item: OrderItem) => {
    return (
      item.variant?.image ||
      item.Product?.product_image ||
      "/placeholder-product.jpg"
    );
  };

  const getItemName = (item: OrderItem) => {
    return item.variant?.name || item.Product?.name || "Unknown Product";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> =
      {
        PENDING: {
          color: "bg-yellow-100 text-yellow-800",
          icon: <Package className="h-4 w-4" />,
        },
        PROCESSING: {
          color: "bg-blue-100 text-blue-800",
          icon: <Package className="h-4 w-4" />,
        },
        DELIVERED: {
          color: "bg-green-100 text-green-800",
          icon: <Truck className="h-4 w-4" />,
        },
        CANCELLED: {
          color: "bg-red-100 text-red-800",
          icon: <Package className="h-4 w-4" />,
        },
      };

    const { color, icon } = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: <Package className="h-4 w-4" />,
    };

    return (
      <Badge className={`${color} capitalize`}>
        <span className="mr-1">{icon}</span>
        {status.toLowerCase()}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> =
      {
        PAID: {
          color: "bg-green-100 text-green-800",
          icon: <CreditCard className="h-4 w-4" />,
        },
        PENDING: {
          color: "bg-yellow-100 text-yellow-800",
          icon: <CreditCard className="h-4 w-4" />,
        },
        FAILED: {
          color: "bg-red-100 text-red-800",
          icon: <CreditCard className="h-4 w-4" />,
        },
      };

    const { color, icon } = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: <CreditCard className="h-4 w-4" />,
    };

    return (
      <Badge className={`${color} capitalize`}>
        <span className="mr-1">{icon}</span>
        {status.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/employee-dashboard/orders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <h1 className="text-2xl font-bold my-4 flex items-center gap-2">
          Order #{order.id.split("-")[0].toUpperCase()}
          {getStatusBadge(order.orderStatus)}
        </h1>
        <div className="flex justify-between items-center mb-6">
          {order && (
            <OrderConfirmationContent
              order={order}
              qrCodeUrl={qrCodeUrl}
              showExport
            />
          )}
        </div>
      </div>
    </div>
  );
}
