import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, List, Search, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import OlaMapIntegration from "@/components/ola-map-integration";

interface ACOPharmacy {
  id: number;
  name: string;
  address: string;
  city: string;
  lat: string | null;
  lng: string | null;
  quantity: number;
  lastUpdated: Date;
  contact: string;
  drugInfo: {
    name: string;
    batchNumber: string;
    manufacturer: string;
    expiryDate: string;
  };
  acoScore: number;
  pheromoneLevel: number;
  heuristicValue: number;
  explanation: string;
  distance?: number;
}

interface ACOResponse {
  algorithm: string;
  totalFound: number;
  searchCriteria: {
    drugName: string;
    city: string;
    userLocation: {
      lat?: number;
      lng?: number;
    };
  };
  pharmacies: ACOPharmacy[];
}

export default function EmergencyLocator() {
  const [drugName, setDrugName] = useState("");
  const [city, setCity] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const { toast } = useToast();

  // Get user's location
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location Access Granted",
            description: "We'll show you the nearest pharmacies first",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Access Denied",
            description: "Search results won't include distance optimization",
            variant: "destructive",
          });
        }
      );
    }
  };

  const { data: acoResponse, isLoading, error } = useQuery({
    queryKey: ["/api/emergency-locator", drugName, city, userLocation?.lat, userLocation?.lng],
    queryFn: async ({ signal }): Promise<ACOResponse> => {
      const params = new URLSearchParams({
        drugName,
        city,
        ...(userLocation && { 
          lat: userLocation.lat.toString(), 
          lng: userLocation.lng.toString() 
        })
      });
      
      const response = await fetch(`/api/emergency-locator?${params}`, { signal });
      if (!response.ok) {
        throw new Error("Failed to search inventory");
      }
      return response.json();
    },
    enabled: searchPerformed && !!drugName && !!city,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      return failureCount < 2;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim() || !city.trim()) {
      toast({
        title: "Error",
        description: "Please enter both drug name and city",
        variant: "destructive",
      });
      return;
    }
    setSearchPerformed(true);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-500" };
    if (quantity < 10) return { label: "Low Stock", color: "bg-yellow-500" };
    return { label: "In Stock", color: "bg-green-500" };
  };

  const formatACOScore = (score: number) => {
    return (score * 100).toFixed(0);
  };

  const getACOBadgeColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-blue-500";
    if (score >= 0.4) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Emergency Stock Locator
        </h1>
        <p className="text-xl text-gray-600">
          Find life-saving emergency medicines in real-time across nearby pharmacies and medical facilities.
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="drugName">Drug Name</Label>
              <Input
                id="drugName"
                type="text"
                placeholder="e.g., Epinephrine, Naloxone, Atropine"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="e.g., Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-primary hover:bg-blue-700">
                <Search className="mr-2 h-4 w-4" />
                Search Stock
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Interactive Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OlaMapIntegration
              pharmacies={acoResponse?.pharmacies?.map(pharmacy => ({
                id: pharmacy.id,
                name: pharmacy.name,
                address: pharmacy.address,
                city: pharmacy.city,
                lat: pharmacy.lat ? parseFloat(pharmacy.lat) : 0,
                lng: pharmacy.lng ? parseFloat(pharmacy.lng) : 0,
                contact: pharmacy.contact,
                quantity: pharmacy.quantity,
                drugName: pharmacy.drugInfo.name
              })) || []}
              searchQuery={searchPerformed ? `${drugName} in ${city}` : ''}
              drugName={drugName}
              onPharmacySelect={(pharmacy) => {
                toast({
                  title: "Pharmacy Selected",
                  description: `${pharmacy.name} - ${pharmacy.quantity} units available`,
                });
              }}
            />
          </CardContent>
        </Card>

        {/* Results List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="mr-2 h-5 w-5 text-secondary" />
              Nearby Pharmacies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 mt-2">Searching for stock...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to search inventory. Please try again.</p>
              </div>
            )}

            {!userLocation && !isLoading && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  Enable location access for better results with distance-based ranking
                </p>
                <Button onClick={getUserLocation} size="sm" variant="outline" className="border-blue-500 text-blue-600">
                  <Navigation className="mr-1 h-3 w-3" />
                  Enable Location
                </Button>
              </div>
            )}

            {searchPerformed && !isLoading && !error && (
              <div className="space-y-4">
                {acoResponse && acoResponse.pharmacies.length > 0 ? (
                  <>
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Found {acoResponse.totalFound} pharmacies using {acoResponse.algorithm}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Results are optimized based on stock availability, distance, and data freshness
                      </p>
                    </div>
                    {acoResponse.pharmacies.map((pharmacy: ACOPharmacy, index: number) => {
                      const stockStatus = getStockStatus(pharmacy.quantity);
                      
                      return (
                        <div key={pharmacy.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full mr-2">
                                #{index + 1}
                              </span>
                              <h3 className="font-semibold text-gray-900">
                                {pharmacy.name}
                              </h3>
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={`text-white ${getACOBadgeColor(pharmacy.acoScore)}`}>
                                Score: {formatACOScore(pharmacy.acoScore)}
                              </Badge>
                              <Badge className={`text-white ${stockStatus.color}`}>
                                {stockStatus.label}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {pharmacy.address}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                            <div>
                              <span className="font-medium">Stock:</span> {pharmacy.quantity} units
                            </div>
                            <div>
                              <span className="font-medium">Contact:</span> {pharmacy.contact}
                            </div>
                            {pharmacy.distance && (
                              <div>
                                <span className="font-medium">Distance:</span> {pharmacy.distance.toFixed(1)} km
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Manufacturer:</span> {pharmacy.drugInfo.manufacturer}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            <span className="font-medium">AI Reasoning:</span> {pharmacy.explanation}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              Updated: {new Date(pharmacy.lastUpdated).toLocaleString()}
                            </div>
                            <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-white">
                              <Navigation className="mr-1 h-3 w-3" />
                              Get Directions
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      No stock found for "{drugName}" in {city}. Try searching for a different drug or city.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!searchPerformed && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Enter a drug name and city to search for available stock.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
