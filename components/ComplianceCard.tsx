
import { Consent } from "@/types/compliance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle, Download, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ConsentCardProps {
  consent: Consent;
  onView: (consent: Consent) => void;
  onApprove: (complianceId: string) => void;
  onReject: (complianceId: string) => void;
  isUpdating?: boolean;
}

export function ComplianceCard({
  consent,
  onView,
  onApprove,
  onReject,
  isUpdating = false,
}: ConsentCardProps) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleDownloadImage = () => {
    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = consent.form_url;
    link.download = `compliance-${consent.user.employee_id}-${consent.user.firstname}-${consent.user.lastname}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {consent.user.firstname} {consent.user.lastname}
            </CardTitle>
            <Badge variant={getStatusVariant(consent.status)}>
              {consent.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Employee ID</p>
                <p>{consent.user.employee_id}</p>
              </div>
              <div>
                <p className="font-semibold">Government Entity</p>
                <p>{consent.user.government_entity}</p>
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p>{consent.user.email}</p>
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <p>{consent.user.phone}</p>
              </div>
            </div>

            <div className="relative h-48 w-full rounded-md overflow-hidden bg-gray-100 group">
              <Image
                src={consent.form_url}
                alt={`Compliance form for ${consent.user.firstname} ${consent.user.lastname}`}
                fill
                className="object-contain cursor-pointer"
                onClick={() => setImagePreviewOpen(true)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreviewOpen(true);
                    }}
                    className="bg-white/90 hover:bg-white"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadImage();
                    }}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(consent)}
              >
                View Details
              </Button>

              {consent.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onApprove(consent.id)}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onReject(consent.id)}
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Compliance Form - {consent.user.firstname}{" "}
              {consent.user.lastname}
            </DialogTitle>
            <DialogDescription>
              Employee ID: {consent.user.employee_id}
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-96 w-full">
            <img
              src={consent.form_url}
              alt="Compliance form preview"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadImage}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Image
            </Button>
            <Button onClick={() => setImagePreviewOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
