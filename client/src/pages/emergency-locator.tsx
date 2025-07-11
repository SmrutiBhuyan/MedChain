import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, List, Search, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: number;
  quantity: number;
  drug: {
    name: string;
    batchNumber: string;
    manufacturer: string;
    expiryDate: string;
  };
  pharmacy: {
    name: string;
    address: string;
    contact: string;
    city: string;
    lat: string;
    lng: string;
  };
}

export default function EmergencyLocator() {
  const [drugName, setDrugName] = useState("");
  const [city, setCity] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { toast } = useToast();

  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ["/api/inventory/search", drugName, city],
    queryFn: async () => {
      const response = await fetch(`/api/inventory/search?drugName=${encodeURIComponent(drugName)}&city=${encodeURIComponent(city)}`);
      if (!response.ok) {
        throw new Error("Failed to search inventory");
      }
      return response.json();
    },
    enabled: searchPerformed && !!drugName && !!city,
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

  const calculateDistance = (lat1: string, lng1: string) => {
    // Mock distance calculation - in a real app, you'd use actual geolocation
    return (Math.random() * 10 + 0.5).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Emergency Stock Locator
        </h1>
        <p className="text-xl text-gray-600">
          Find essential medicines in real-time across nearby pharmacies and medical facilities.
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
                placeholder="e.g., Paracetamol"
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
              Map View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Interactive map showing pharmacy locations</p>
                <p className="text-sm text-gray-500 mt-2">Map integration: Google Maps API</p>
              </div>
            </div>
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

            {searchPerformed && !isLoading && !error && (
              <div className="space-y-4">
                {inventory && inventory.length > 0 ? (
                  inventory.map((item: InventoryItem) => {
                    const stockStatus = getStockStatus(item.quantity);
                    const distance = calculateDistance(item.pharmacy.lat, item.pharmacy.lng);
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {item.pharmacy.name}
                          </h3>
                          <Badge className={`text-white ${stockStatus.color}`}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.pharmacy.address}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">Stock:</span> {item.quantity} units
                            <span className="ml-4 font-medium">Distance:</span> {distance} km
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary hover:text-blue-700"
                          >
                            <Navigation className="mr-1 h-3 w-3" />
                            Get Directions
                          </Button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Contact:</span> {item.pharmacy.contact}
                        </div>
                      </div>
                    );
                  })
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
