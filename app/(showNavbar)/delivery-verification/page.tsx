
import { QRCodeDeliverySystem } from "@/components/delievery/QRCodeDeliverySystem";

export default function DeliveryVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Delivery Verification Portal
          </h1>
          <p className="text-gray-600">
            Verify and confirm customer deliveries using QR codes and OTP authentication
          </p>
        </div>
        
        <QRCodeDeliverySystem />
      </div>
    </div>
  );
}