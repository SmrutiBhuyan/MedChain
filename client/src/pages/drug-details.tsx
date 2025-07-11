import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Building, Calendar, QrCode, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function DrugDetails() {
  const [, params] = useRoute("/drug/:batchNumber");
  const batchNumber = params?.batchNumber;

  const { data: drug, isLoading, error } = useQuery({
    queryKey: ["/api/drugs/batch", batchNumber],
    queryFn: async () => {
      const response = await fetch(`/api/drugs/batch/${batchNumber}`);
      if (!response.ok) {
        throw new Error("Drug not found");
      }
      return response.json();
    },
    enabled: !!batchNumber,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading drug details...</p>
        </div>
      </div>
    );
  }

  if (error || !drug) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Drug Not Found</h1>
          <p className="text-gray-600 mb-4">
            The drug with batch number "{batchNumber}" could not be found.
          </p>
          <Link href="/verify-drug">
            <Button>Try Another Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  const mockBlockchainLink = `https://etherscan.io/tx/0x${Math.random().toString(16).substr(2, 8)}`;
  const mockVerificationHistory = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      location: "Mumbai, India",
      result: "genuine",
      verifier: "Dr. John Doe",
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      location: "Delhi, India",
      result: "genuine",
      verifier: "Pharmacy Staff",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/verify-drug">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Verification
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{drug.name}</h1>
            <p className="text-gray-600">Batch: {drug.batchNumber}</p>
          </div>
          <Badge
            className={`text-white text-lg px-4 py-2 ${
              drug.isCounterfeit ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {drug.isCounterfeit ? "Counterfeit" : "Authentic"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Drug Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Drug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-gray-900">{drug.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Batch Number</p>
                <p className="text-gray-900">{drug.batchNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Manufacturer</p>
                <p className="text-gray-900">{drug.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                <p className="text-gray-900">{drug.expiryDate}</p>
              </div>
              {drug.category && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <p className="text-gray-900 capitalize">{drug.category.replace('-', ' ')}</p>
                </div>
              )}
              {drug.strength && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Strength</p>
                  <p className="text-gray-900">{drug.strength}</p>
                </div>
              )}
            </div>
            {drug.description && (
              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-gray-900">{drug.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {drug.isCounterfeit ? (
                <XCircle className="mr-2 h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              )}
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg ${
              drug.isCounterfeit ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
            }`}>
              <h3 className={`font-semibold mb-2 ${
                drug.isCounterfeit ? "text-red-800" : "text-green-800"
              }`}>
                {drug.isCounterfeit ? "Counterfeit Drug Detected" : "Authentic Drug Verified"}
              </h3>
              <p className={`text-sm ${
                drug.isCounterfeit ? "text-red-700" : "text-green-700"
              }`}>
                {drug.isCounterfeit 
                  ? "This drug has been flagged as counterfeit. Do not use and report immediately."
                  : "This drug has been verified as authentic and safe to use."
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Registered Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(drug.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Blockchain TX</span>
                <a 
                  href={mockBlockchainLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-blue-700 flex items-center"
                >
                  View on Explorer
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Verification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVerificationHistory.map((verification) => (
              <div key={verification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Verified by {verification.verifier}
                    </p>
                    <p className="text-sm text-gray-600">
                      {verification.location} • {new Date(verification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">
                  {verification.result}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="mr-2 h-5 w-5 text-primary" />
            QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="bg-gray-100 rounded-lg p-8">
              <QrCode className="h-24 w-24 text-gray-400 mx-auto" />
              <p className="text-center text-gray-600 mt-4">
                QR Code for {drug.batchNumber}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
