
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, QrCode } from 'lucide-react';
import jsQR from 'jsqr';

interface QrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export default function QrScanner({ onScan, onError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);


  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
      }
      
      setIsScanning(true);
      setHasPermission(true);
      scanQRCode();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      onError?.('Cannot access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsScanning(false);
  };

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        onScan(code.data);
        stopScanning();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  }, [isScanning, onScan]);

  useEffect(() => {
    if (isScanning) {
      scanQRCode();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, scanQRCode]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <Button onClick={startScanning} className="flex items-center gap-2 w-full">
          <Camera className="h-4 w-4" />
          Scan QR Code with Camera
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover rounded-lg border-2 border-green-500"
              muted
              playsInline
            />
            <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg m-4 pointer-events-none"></div>
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              Point camera at QR code
            </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          <Button onClick={stopScanning} variant="outline" className="flex items-center gap-2 w-full">
            <CameraOff className="h-4 w-4" />
            Stop Scanner
          </Button>
        </div>
      )}
      
      {hasPermission === false && (
        <div className="text-red-600 text-sm text-center">
          Camera access denied. Please allow camera permissions to scan QR codes.
        </div>
      )}
    </div>
  );
}