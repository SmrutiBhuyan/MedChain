import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, QrCode, MapPin, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        // Return default stats if not authenticated
        return {
          drugsVerified: 250000,
          pharmaciesConnected: 5000,
          counterfeitsDetected: 1200,
          citiesCovered: 150,
        };
      }
      return response.json();
    },
  });

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Track Trust. Fight Fakes.
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Secure, traceable, AI-powered healthcare supply chain management to ensure drug authenticity and save lives.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
              <Link href="/verify-drug">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  <Search className="mr-2 h-5 w-5" />
                  Verify Drug
                </Button>
              </Link>
              <Link href="/emergency-locator">
                <Button size="lg" className="bg-secondary text-white hover:bg-green-700">
                  <MapPin className="mr-2 h-5 w-5" />
                  Find Medicines
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Supply Chain
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform ensures drug authenticity, tracks supply chains, and provides real-time stock information for healthcare providers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-50 border-0">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">QR Code Verification</h3>
                <p className="text-gray-600">
                  Instantly verify drug authenticity by scanning QR codes or entering batch numbers.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-0">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Emergency Stock Locator</h3>
                <p className="text-gray-600">
                  Find essential medicines in real-time across nearby pharmacies and medical facilities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-0">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Counterfeit Protection</h3>
                <p className="text-gray-600">
                  Advanced blockchain-based tracking to prevent counterfeit drugs from entering the supply chain.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.drugsVerified.toLocaleString() || "250,000"}+
              </div>
              <div className="text-gray-600">Drugs Verified</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">
                {stats?.pharmaciesConnected.toLocaleString() || "5,000"}+
              </div>
              <div className="text-gray-600">Pharmacies Connected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500 mb-2">
                {stats?.counterfeitsDetected.toLocaleString() || "1,200"}+
              </div>
              <div className="text-gray-600">Counterfeits Detected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {stats?.citiesCovered || "150"}+
              </div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
