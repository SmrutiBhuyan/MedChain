import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Keyboard, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import QRScanner from "@/components/qr-scanner";

interface VerificationResult {
  drug: {
    id: number;
    name: string;
    batchNumber: string;
    manufacturer: string;
    expiryDate: string;
    isCounterfeit: boolean;
  };
  result: string;
  verification: {
    id: number;
    timestamp: string;
    blockchainTx: string;
  };
}

export default function VerifyDrug() {
  const [batchNumber, setBatchNumber] = useState("");
  const [drugName, setDrugName] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [showRedirectCountdown, setShowRedirectCountdown] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const verifyMutation = useMutation({
    mutationFn: async (data: { batchNumber: string }) => {
      const response = await apiRequest("POST", "/api/verify-drug", data);
      return response.json();
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      
      if (data.result === "counterfeit" || data.drug.isCounterfeit) {
        toast({
          title: "COUNTERFEIT DETECTED",
          description: "This drug is counterfeit! Redirecting to complaint portal...",
          variant: "destructive",
        });
        
        // Start countdown for auto-redirect
        setShowRedirectCountdown(true);
        const countdown = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              redirectToComplaintPortal(data.drug);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({
          title: "Verification Complete",
          description: "Drug is authentic and safe to use",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify drug",
        variant: "destructive",
      });
    },
  });

  const redirectToComplaintPortal = (drug: any) => {
    // Create URL with pre-filled parameters including pharmacy info
    const params = new URLSearchParams({
      batchNumber: drug.batchNumber,
      drugName: drug.name,
      manufacturer: drug.manufacturer,
      complaintType: "Counterfeit Drug Detection",
      urgencyLevel: "critical",
      pharmacyName: "Apollo Pharmacy", // Default pharmacy for testing
      pharmacyAddress: "Linking Road, Bandra West, Mumbai",
      pharmacyContact: "+91-22-2640-1234",
    });
    
    setLocation(`/complaint-portal?${params.toString()}`);
  };

  const handleImmediateReport = () => {
    if (verificationResult) {
      redirectToComplaintPortal(verificationResult.drug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a batch number",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate({ batchNumber: batchNumber.trim() });
  };

  const handleQRScan = (result: string) => {
    setBatchNumber(result);
    setShowScanner(false);
    verifyMutation.mutate({ batchNumber: result });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Drug Verification
        </h1>
        <p className="text-xl text-gray-600">
          Verify the authenticity of your medication using QR code scanning or batch number lookup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="mr-2 h-5 w-5 text-primary" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <QrCode className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                Click to activate camera and scan QR code
              </p>
              <Button
                onClick={() => setShowScanner(true)}
                className="bg-primary hover:bg-blue-700"
              >
                Start Scanner
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Keyboard className="mr-2 h-5 w-5 text-secondary" />
              Manual Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  type="text"
                  placeholder="Enter batch number"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="drugName">Drug Name (Optional)</Label>
                <Input
                  id="drugName"
                  type="text"
                  placeholder="Enter drug name"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-green-700"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify Drug"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Verification Results */}
      {verificationResult && (
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Verification Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`border rounded-lg p-6 ${
              verificationResult.result === "genuine" 
                ? "border-green-200 bg-green-50" 
                : "border-red-200 bg-red-50"
            }`}>
              <div className="flex items-center mb-4">
                {verificationResult.result === "genuine" ? (
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 mr-3" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    verificationResult.result === "genuine" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {verificationResult.result === "genuine" 
                      ? "Authentic Drug Verified" 
                      : "⚠️ COUNTERFEIT DRUG DETECTED"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Batch: {verificationResult.drug.batchNumber}
                  </p>
                </div>
                
                {verificationResult.result !== "genuine" && (
                  <div className="text-right">
                    <Button
                      onClick={handleImmediateReport}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Report Now
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Counterfeit Warning & Auto-redirect */}
              {verificationResult.result !== "genuine" && showRedirectCountdown && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-semibold text-red-800">URGENT: Counterfeit Drug Safety Alert</h4>
                  </div>
                  <p className="text-red-700 mb-3">
                    This drug has been identified as counterfeit and may be dangerous. Do not consume this medication.
                  </p>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <p className="text-red-800 font-medium">
                      Automatically redirecting to complaint portal in {redirectCountdown} seconds...
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      You will be able to file an official complaint with pre-filled information.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Drug Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span> {verificationResult.drug.name}
                    </p>
                    <p>
                      <span className="font-medium">Manufacturer:</span> {verificationResult.drug.manufacturer}
                    </p>
                    <p>
                      <span className="font-medium">Expiry Date:</span> {verificationResult.drug.expiryDate}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Verification Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Verified:</span> {
                        new Date(verificationResult.verification.timestamp).toLocaleString()
                      }
                    </p>
                    <p>
                      <span className="font-medium">Blockchain TX:</span> {verificationResult.verification.blockchainTx}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-1 font-medium ${
                        verificationResult.result === "genuine" 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {verificationResult.result === "genuine" ? "Genuine" : "Counterfeit"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
