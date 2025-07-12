import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Scan } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let animationId: number;
    
    const startScanning = async () => {
      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsScanning(true);
          
          // Simple barcode/QR code detection simulation
          // In a real app, you would use a library like zxing-js or QuaggaJS
          const checkForBarcode = () => {
            // Simulate barcode detection after 3 seconds
            setTimeout(() => {
              if (streamRef.current) {
                // Simulate finding a barcode with counterfeit batch number
                const mockBarcodeData = "EPI-2024-001"; // Mock batch number for testing
                onScan(mockBarcodeData);
              }
            }, 3000);
          };
          
          checkForBarcode();
        }
      } catch (err) {
        setError("Could not access camera. Please ensure you have granted camera permissions.");
      }
    };

    if (isScanning) {
      startScanning();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, onScan]);

  const handleStartScan = () => {
    setIsScanning(true);
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Barcode & QR Scanner</h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {!isScanning && !error && (
          <div className="text-center">
            <Scan className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Click the button below to start scanning barcodes and QR codes
            </p>
            <Button onClick={handleStartScan} className="bg-primary hover:bg-blue-700">
              Start Camera
            </Button>
          </div>
        )}
        
        {isScanning && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg bg-gray-100"
                playsInline
                muted
              />
              <div className="absolute inset-0 border-2 border-primary rounded-lg">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
              </div>
            </div>
            <p className="text-center text-gray-600">
              Position the barcode or QR code within the frame
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
