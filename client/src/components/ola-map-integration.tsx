import React, { useState, useEffect } from 'react';
import OlaMap from './ola-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  contact: string;
  quantity?: number;
  drugName?: string;
}

interface OlaMapIntegrationProps {
  pharmacies: Pharmacy[];
  onPharmacySelect?: (pharmacy: Pharmacy) => void;
  searchQuery?: string;
  drugName?: string;
}

const OlaMapIntegration: React.FC<OlaMapIntegrationProps> = ({
  pharmacies,
  onPharmacySelect,
  searchQuery,
  drugName
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([77.5946, 12.9716]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Check for API key on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('ola_maps_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Use the provided API key as default
      const defaultApiKey = 'SuoxlmXRea98IUzTc8v4sW0cPphMARvFq43BiRQf';
      setApiKey(defaultApiKey);
      localStorage.setItem('ola_maps_api_key', defaultApiKey);
    }
  }, []);

  // Set map center based on pharmacies
  useEffect(() => {
    if (pharmacies.length > 0) {
      // Calculate center of all pharmacies
      const avgLat = pharmacies.reduce((sum, p) => sum + p.lat, 0) / pharmacies.length;
      const avgLng = pharmacies.reduce((sum, p) => sum + p.lng, 0) / pharmacies.length;
      setMapCenter([avgLng, avgLat]);
    }
  }, [pharmacies]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setMapCenter([longitude, latitude]);
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('ola_maps_api_key', apiKey.trim());
      setShowApiKeyInput(false);
    }
  };

  const handlePharmacyClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    if (onPharmacySelect) {
      onPharmacySelect(pharmacy);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('ola_maps_api_key');
    setApiKey('');
    setShowApiKeyInput(true);
  };

  const getDirections = (pharmacy: Pharmacy) => {
    if (userLocation) {
      const url = `https://maps.google.com/maps?saddr=${userLocation[1]},${userLocation[0]}&daddr=${pharmacy.lat},${pharmacy.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://maps.google.com/maps?q=${pharmacy.lat},${pharmacy.lng}`;
      window.open(url, '_blank');
    }
  };

  if (showApiKeyInput) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🗺️ Ola Maps Setup</CardTitle>
          <CardDescription>
            Enter your Ola Maps API key to enable map features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Get your FREE Ola Maps API key:</strong><br/>
              1. Visit <a href="https://maps.olakrutrim.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">maps.olakrutrim.com</a><br/>
              2. Sign up for free account<br/>
              3. Create a new project<br/>
              4. Copy your API key<br/>
              <br/>
              <strong>Free tier includes:</strong> 10 million API calls/month
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your Ola Maps API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
            />
            <Button onClick={handleApiKeySubmit} className="w-full">
              Save API Key
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Why Ola Maps?</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>100% free for Indian developers</li>
              <li>Optimized for Indian roads and locations</li>
              <li>Better regional coverage than Google Maps</li>
              <li>No billing or credit card required</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Map Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">🗺️ Emergency Pharmacies Map</h3>
          <p className="text-sm text-gray-600">
            {pharmacies.length} pharmacies found
            {searchQuery && ` for "${searchQuery}"`}
            {drugName && ` with ${drugName}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={clearApiKey}>
          Change API Key
        </Button>
      </div>

      {/* Map */}
      <div className="rounded-lg border overflow-hidden">
        <OlaMap
          apiKey={apiKey}
          center={mapCenter}
          zoom={pharmacies.length > 1 ? 10 : 12}
          height="500px"
          width="100%"
          pharmacies={pharmacies}
          onPharmacyClick={handlePharmacyClick}
        />
      </div>

      {/* Selected Pharmacy Info */}
      {selectedPharmacy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📍 Selected Pharmacy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-red-600">{selectedPharmacy.name}</h4>
                <p className="text-sm text-gray-600">{selectedPharmacy.address}</p>
                <p className="text-sm text-gray-600">📞 {selectedPharmacy.contact}</p>
              </div>
              
              {selectedPharmacy.drugName && selectedPharmacy.quantity && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    💊 {selectedPharmacy.drugName}: {selectedPharmacy.quantity} units available
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => getDirections(selectedPharmacy)}
                  className="flex-1"
                >
                  🧭 Get Directions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`tel:${selectedPharmacy.contact}`, '_self')}
                  className="flex-1"
                >
                  📞 Call Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">🗺️ Map Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">🏥 Red Markers</p>
              <p className="text-gray-600">Emergency pharmacies</p>
            </div>
            <div>
              <p className="font-medium">📍 Click Markers</p>
              <p className="text-gray-600">View pharmacy details</p>
            </div>
            <div>
              <p className="font-medium">🔍 Zoom Controls</p>
              <p className="text-gray-600">Top-right corner</p>
            </div>
            <div>
              <p className="font-medium">📱 Fullscreen</p>
              <p className="text-gray-600">Top-right corner</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OlaMapIntegration;