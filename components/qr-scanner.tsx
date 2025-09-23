
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, CameraOff } from 'lucide-react';

interface QrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export default function QrScanner({ onScan, onError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsScanning(true);
      setHasPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      onError?.('Cannot access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <Button onClick={startScanning} className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Start QR Scanner
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover rounded-lg border-2 border-green-500"
            />
            <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg m-4 pointer-events-none"></div>
          </div>
          
          <Button onClick={stopScanning} variant="outline" className="flex items-center gap-2">
            <CameraOff className="h-4 w-4" />
            Stop Scanner
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Point the camera at the QR code to scan
            </p>
          </div>
        </div>
      )}
      
      {hasPermission === false && (
        <div className="text-red-600 text-sm">
          Camera access denied. Please allow camera permissions to scan QR codes.
        </div>
      )}
    </div>
  );
}